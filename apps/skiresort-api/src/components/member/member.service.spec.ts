import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MemberService } from './member.service';
import {
  MemberStatus,
  MemberType,
  InstructorAudience,
  InstructorLevel,
} from '../../libs/enums/member.enum';
import { InstructorApplicationStatus } from '../../libs/enums/instructor-application.enum';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

const query = (value: unknown) => ({
  exec: jest.fn<any, unknown[]>().mockResolvedValue(value),
  select: jest.fn<any, unknown[]>().mockReturnThis(),
  then: (
    resolve: (value: unknown) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(value).then(resolve, reject),
});

describe('Member instructor workflow and compatibility', () => {
  const memberId = new Types.ObjectId();
  let current: {
    _id: Types.ObjectId;
    memberType: MemberType;
    memberStatus: MemberStatus;
    memberPassword: string;
    accessToken?: string;
  };
  let model: Record<
    'create' | 'findOne' | 'findOneAndUpdate' | 'aggregate',
    jest.Mock<any, unknown[]>
  >;
  let auth: Record<
    'hashPassword' | 'createToken' | 'comparePasswords',
    jest.Mock<any, unknown[]>
  >;
  let resorts: { assertVisibleResort: jest.Mock<any, unknown[]> };
  let service: MemberService;

  beforeEach(() => {
    current = {
      _id: memberId,
      memberType: MemberType.USER,
      memberStatus: MemberStatus.ACTIVE,
      memberPassword: 'hash',
    };
    model = {
      create: jest.fn<any, unknown[]>().mockResolvedValue(current),
      findOne: jest
        .fn<any, unknown[]>()
        .mockImplementation(() => query(current)),
      findOneAndUpdate: jest
        .fn<any, unknown[]>()
        .mockImplementation(() => query(current)),
      aggregate: jest
        .fn<any, unknown[]>()
        .mockResolvedValue([{ list: [], metaCounter: [] }]),
    };
    auth = {
      hashPassword: jest.fn<any, unknown[]>().mockResolvedValue('hash'),
      createToken: jest.fn<any, unknown[]>().mockResolvedValue('token'),
      comparePasswords: jest.fn<any, unknown[]>().mockResolvedValue(true),
    };
    resorts = {
      assertVisibleResort: jest.fn<any, unknown[]>().mockResolvedValue({}),
    };
    service = new MemberService(
      model as unknown as ConstructorParameters<typeof MemberService>[0],
      {} as ConstructorParameters<typeof MemberService>[1],
      auth as unknown as ConstructorParameters<typeof MemberService>[2],
      {} as ConstructorParameters<typeof MemberService>[3],
      {} as ConstructorParameters<typeof MemberService>[4],
      resorts as unknown as ConstructorParameters<typeof MemberService>[5],
    );
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([MemberType.USER, undefined])(
    'preserves signup for role %s',
    async (memberType) => {
      const input = {
        memberNick: 'user',
        memberPhone: 'phone',
        memberPassword: 'password',
        ...(memberType ? { memberType } : {}),
      };
      expect(await service.signup(input)).toBe(current);
      expect(auth.hashPassword).toHaveBeenCalledWith('password');
      expect(model.create).toHaveBeenCalledWith({
        ...input,
        memberPassword: 'hash',
      });
      expect(current.accessToken).toBe('token');
      if (memberType === undefined)
        expect(model.create.mock.calls[0][0]).not.toHaveProperty('memberType');
    },
  );

  it.each([MemberType.ADMIN, MemberType.INSTRUCTOR, null])(
    'rejects signup role %s before hashing/creation',
    async (memberType) => {
      await expect(
        service.signup({
          memberType,
          memberNick: 'user',
          memberPhone: 'phone',
          memberPassword: 'pass',
        } as never),
      ).rejects.toThrow(BadRequestException);
      expect(auth.hashPassword).not.toHaveBeenCalled();
      expect(model.create).not.toHaveBeenCalled();
    },
  );

  it('preserves login and token creation', async () => {
    expect(
      await service.login({ memberNick: 'user', memberPassword: 'password' }),
    ).toBe(current);
    expect(auth.comparePasswords).toHaveBeenCalledWith('password', 'hash');
    expect(current.accessToken).toBe('token');
  });

  it.each([MemberStatus.BLOCK, MemberStatus.DELETE])(
    'preserves login denial for %s',
    async (status) => {
      current.memberStatus = status;
      await expect(
        service.login({ memberNick: 'user', memberPassword: 'password' }),
      ).rejects.toThrow(BadRequestException);
      expect(auth.createToken).not.toHaveBeenCalled();
    },
  );

  it('preserves general profile updates and ignores target/unknown fields', async () => {
    await service.updateMember(
      memberId as never,
      {
        _id: 'other',
        memberDesc: 'bio',
        instructorAudience: InstructorAudience.KIDS,
      } as never,
    );
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: memberId, memberStatus: MemberStatus.ACTIVE },
      { memberDesc: 'bio' },
      { new: true },
    );
    expect(current.accessToken).toBe('token');
  });

  it.each([MemberType.INSTRUCTOR, MemberType.ADMIN, null])(
    'denies self role change %s',
    async (role) => {
      await expect(
        service.updateMember(memberId as never, { memberType: role } as never),
      ).rejects.toThrow(ForbiddenException);
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    },
  );

  it('accepts an unchanged self role without writing it', async () => {
    await service.updateMember(memberId as never, {
      memberType: MemberType.USER,
      memberDesc: 'bio',
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      memberDesc: 'bio',
    });
  });

  it('denies generic admin promotion to INSTRUCTOR', async () => {
    await expect(
      service.updateMemberByAdmin({
        _id: memberId.toHexString(),
        memberType: MemberType.INSTRUCTOR,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('retains ordinary admin updates with a role compare-and-set', async () => {
    await service.updateMemberByAdmin({
      _id: memberId.toHexString(),
      memberType: MemberType.ADMIN,
      memberDesc: 'bio',
    });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: memberId.toHexString(), memberType: MemberType.USER },
      { memberType: MemberType.ADMIN, memberDesc: 'bio' },
      { new: true },
    );
  });

  it('accepts unchanged instructor role but denies reassignment', async () => {
    current.memberType = MemberType.INSTRUCTOR;
    await service.updateMemberByAdmin({
      _id: memberId.toHexString(),
      memberType: MemberType.INSTRUCTOR,
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).not.toHaveProperty(
      'memberType',
    );
    await expect(
      service.updateMemberByAdmin({
        _id: memberId.toHexString(),
        memberType: MemberType.USER,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('uses the approved snapshot and transaction for promotion without overwriting bio/prices', async () => {
    const session = { inTransaction: () => true };
    const application = {
      memberId,
      applicationStatus: InstructorApplicationStatus.APPROVED,
      instructorExperienceYears: 2,
      instructorLanguages: ['English'],
      instructorLevel: InstructorLevel.ALL,
      instructorAudience: InstructorAudience.FAMILY,
      memberDesc: 'application bio',
    };
    await service.promoteMemberToInstructor(
      memberId,
      application as never,
      session as never,
    );
    const [match, change, options] = model.findOneAndUpdate.mock.calls[0] as [
      unknown,
      { $set: Record<string, unknown> },
      unknown,
    ];
    expect(match).toEqual({
      _id: memberId,
      memberType: MemberType.USER,
      memberStatus: MemberStatus.ACTIVE,
    });
    expect(change.$set).toEqual({
      memberType: MemberType.INSTRUCTOR,
      instructorResortId: null,
      instructorExperienceYears: 2,
      instructorLanguages: ['English'],
      instructorLevel: InstructorLevel.ALL,
      instructorAudience: InstructorAudience.FAMILY,
    });
    expect(options).toEqual({ new: true, runValidators: true, session });
  });

  it('rejects promotion without an approved matching application and active transaction', async () => {
    await expect(
      service.promoteMemberToInstructor(
        memberId,
        {
          memberId,
          applicationStatus: InstructorApplicationStatus.PENDING,
        } as never,
        { inTransaction: () => false } as never,
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('fails promotion when conditional USER match no longer exists', async () => {
    model.findOneAndUpdate.mockReturnValue(query(null));
    await expect(
      service.promoteMemberToInstructor(
        memberId,
        {
          memberId,
          applicationStatus: InstructorApplicationStatus.APPROVED,
        } as never,
        { inTransaction: () => true } as never,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('preserves instructor directory architecture and interaction lookup', async () => {
    const result = await service.getInstructors(memberId as never, {
      page: 2,
      limit: 5,
      sort: 'memberRank',
      search: { text: 'snow' },
    });
    const pipeline = model.aggregate.mock.calls[0][0] as [
      { $match: Record<string, unknown> },
      unknown,
      { $facet: { list: [unknown, unknown, { $lookup: { from: string } }] } },
    ];
    expect(pipeline[0].$match).toEqual({
      memberType: MemberType.INSTRUCTOR,
      memberStatus: MemberStatus.ACTIVE,
      memberNick: { $regex: /snow/i },
    });
    expect(pipeline[1]).toEqual({ $sort: { memberRank: -1 } });
    expect(pipeline[2].$facet.list.slice(0, 2)).toEqual([
      { $skip: 5 },
      { $limit: 5 },
    ]);
    expect(pipeline[2].$facet.list[2].$lookup.from).toBe('likes');
    expect(result).toEqual({ list: [], metaCounter: [] });
  });

  it('denies profile update when current database role/status does not match', async () => {
    model.findOne.mockReturnValue(query(null));
    await expect(
      service.updateInstructorProfile(memberId as never, {
        instructorPrice1Week: 20,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(model.findOne).toHaveBeenCalledWith({
      _id: memberId,
      memberType: MemberType.INSTRUCTOR,
      memberStatus: MemberStatus.ACTIVE,
    });
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('updates only allowed instructor fields, clears null and refreshes token', async () => {
    current.memberType = MemberType.INSTRUCTOR;
    await service.updateInstructorProfile(
      memberId as never,
      {
        instructorAudience: InstructorAudience.PRIVATE,
        instructorLanguages: [' English '],
        instructorPrice1Week: null,
        memberType: MemberType.ADMIN,
      } as never,
    );
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: {
        instructorAudience: InstructorAudience.PRIVATE,
        instructorLanguages: ['English'],
        instructorPrice1Week: null,
      },
    });
    expect(current.accessToken).toBe('token');
  });

  it('validates optional Resort association without creating views', async () => {
    const resortId = new Types.ObjectId();
    await service.updateInstructorProfile(memberId as never, {
      instructorResortId: resortId.toHexString(),
    });
    expect(resorts.assertVisibleResort).toHaveBeenCalledWith(resortId);
  });
});
