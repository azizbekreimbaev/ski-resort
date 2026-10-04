import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InstructorApplicationService } from './instructor-application.service';
import { InstructorApplication } from '../../libs/dto/instructor-application/instructor-application';
import { InstructorApplicationStatus as Status } from '../../libs/enums/instructor-application.enum';
import {
  InstructorAudience,
  InstructorLevel,
  MemberStatus,
  MemberType,
} from '../../libs/enums/member.enum';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));
const query = (value: unknown) => ({
  session: jest.fn<any, unknown[]>().mockReturnThis(),
  lean: jest.fn<any, unknown[]>().mockReturnThis(),
  sort: jest.fn<any, unknown[]>().mockReturnThis(),
  exec: jest.fn<any, unknown[]>().mockResolvedValue(value),
  then: (
    resolve: (value: unknown) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(value).then(resolve, reject),
});

describe('InstructorApplicationService', () => {
  const memberId = new Types.ObjectId();
  const adminId = new Types.ObjectId();
  const applicationId = new Types.ObjectId();
  const input = {
    instructorExperienceYears: 2,
    instructorLanguages: [' English '],
    instructorLevel: InstructorLevel.ALL,
    instructorAudience: InstructorAudience.KIDS,
  };
  let application: InstructorApplication;
  let applications: Record<
    | 'exists'
    | 'create'
    | 'findOne'
    | 'findById'
    | 'findOneAndUpdate'
    | 'aggregate',
    jest.Mock<any, unknown[]>
  >;
  let members: Record<
    'findOne' | 'findOneAndUpdate',
    jest.Mock<any, unknown[]>
  >;
  let memberService: { promoteMemberToInstructor: jest.Mock<any, unknown[]> };
  let resorts: { assertVisibleResort: jest.Mock<any, unknown[]> };
  let connection: { transaction: jest.Mock<any, unknown[]> };
  let service: InstructorApplicationService;
  const session = { inTransaction: () => true };

  beforeEach(() => {
    application = {
      _id: applicationId,
      memberId,
      ...input,
      applicationStatus: Status.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    applications = {
      exists: jest.fn<any, unknown[]>().mockReturnValue(query(null)),
      create: jest
        .fn<any, unknown[]>()
        .mockImplementation((values: Record<string, unknown>[]) =>
          Promise.resolve([
            { toObject: () => ({ _id: applicationId, ...values[0] }) },
          ]),
        ),
      findOne: jest.fn<any, unknown[]>().mockReturnValue(query(application)),
      findById: jest
        .fn<any, unknown[]>()
        .mockImplementation(() => query(application)),
      findOneAndUpdate: jest
        .fn<any, unknown[]>()
        .mockImplementation(
          (_match: unknown, update: { $set: Record<string, unknown> }) =>
            query({ ...application, ...update.$set }),
        ),
      aggregate: jest
        .fn<any, unknown[]>()
        .mockReturnValue(
          query([{ list: [application], metaCounter: [{ total: 1 }] }]),
        ),
    };
    members = {
      findOne: jest
        .fn<any, unknown[]>()
        .mockImplementation((match: Record<string, unknown>) =>
          query({
            _id: match._id,
            memberType: match.memberType,
            memberStatus: MemberStatus.ACTIVE,
            updatedAt: new Date(),
          }),
        ),
      findOneAndUpdate: jest
        .fn<any, unknown[]>()
        .mockReturnValue(query({ _id: memberId })),
    };
    memberService = {
      promoteMemberToInstructor: jest
        .fn<any, unknown[]>()
        .mockResolvedValue({}),
    };
    resorts = {
      assertVisibleResort: jest.fn<any, unknown[]>().mockResolvedValue({}),
    };
    connection = {
      transaction: jest
        .fn<any, unknown[]>()
        .mockImplementation(
          (
            callback: (session: {
              inTransaction: () => boolean;
            }) => Promise<unknown>,
          ) => callback(session),
        ),
    };
    service = new InstructorApplicationService(
      applications as unknown as ConstructorParameters<
        typeof InstructorApplicationService
      >[0],
      members as unknown as ConstructorParameters<
        typeof InstructorApplicationService
      >[1],
      connection as unknown as ConstructorParameters<
        typeof InstructorApplicationService
      >[2],
      memberService as unknown as ConstructorParameters<
        typeof InstructorApplicationService
      >[3],
      resorts as unknown as ConstructorParameters<
        typeof InstructorApplicationService
      >[4],
    );
  });

  it('submits a trimmed PENDING snapshot without promotion or Member profile writes', async () => {
    const result = await service.createInstructorApplication(memberId, input);
    expect(result.applicationStatus).toBe(Status.PENDING);
    expect(result.instructorLanguages).toEqual(['English']);
    expect(members.findOne).toHaveBeenCalledWith({
      _id: memberId,
      memberType: MemberType.USER,
      memberStatus: MemberStatus.ACTIVE,
    });
    expect(
      Object.keys(
        (
          members.findOneAndUpdate.mock.calls[0][1] as {
            $set: Record<string, unknown>;
          }
        ).$set,
      ),
    ).toEqual(['updatedAt']);
    expect(applications.create.mock.calls[0][1]).toEqual({ session });
    expect(memberService.promoteMemberToInstructor).not.toHaveBeenCalled();
  });

  it('rejects current non-USER/inactive members even with an old USER token', async () => {
    members.findOne.mockReturnValue(query(null));
    await expect(
      service.createInstructorApplication(memberId, input),
    ).rejects.toThrow(ForbiddenException);
    expect(applications.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate PENDING submissions', async () => {
    applications.exists.mockReturnValue(query({ _id: applicationId }));
    await expect(
      service.createInstructorApplication(memberId, input),
    ).rejects.toThrow(ConflictException);
    expect(applications.create).not.toHaveBeenCalled();
  });

  it('maps concurrent duplicate-index errors without swallowing other persistence errors', async () => {
    applications.create.mockRejectedValueOnce({ code: 11000 });
    await expect(
      service.createInstructorApplication(memberId, input),
    ).rejects.toThrow(ConflictException);
    const failure = new Error('database unavailable');
    applications.create.mockRejectedValueOnce(failure);
    await expect(
      service.createInstructorApplication(memberId, input),
    ).rejects.toBe(failure);
  });

  it('stops submission if the conditional Member timestamp touch loses', async () => {
    members.findOneAndUpdate.mockReturnValue(query(null));
    await expect(
      service.createInstructorApplication(memberId, input),
    ).rejects.toThrow(ConflictException);
    expect(applications.create).not.toHaveBeenCalled();
  });

  it('uses owner identity and deterministic latest ordering', async () => {
    await service.getMyInstructorApplication(memberId);
    expect(applications.findOne).toHaveBeenCalledWith({ memberId });
    applications.findOne.mockReturnValue(query(null));
    expect(await service.getMyInstructorApplication(memberId)).toBeNull();
  });

  it('requires current ADMIN for list/detail/review', async () => {
    members.findOne.mockReturnValue(query(null));
    await expect(
      service.getAllInstructorApplicationsByAdmin(adminId, {
        page: 1,
        limit: 10,
      } as never),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      service.getInstructorApplicationByAdmin(adminId, applicationId),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      service.approveInstructorApplicationByAdmin(adminId, applicationId),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      service.rejectInstructorApplicationByAdmin(adminId, {
        _id: applicationId.toHexString(),
        rejectionReason: 'reason',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(memberService.promoteMemberToInstructor).not.toHaveBeenCalled();
  });

  it('lists with existing facet/pagination output and status/member filters', async () => {
    const result = await service.getAllInstructorApplicationsByAdmin(adminId, {
      page: 2,
      limit: 10,
      search: {
        applicationStatus: Status.PENDING,
        memberId: memberId.toHexString(),
      },
    });
    expect(result.metaCounter).toEqual([{ total: 1 }]);
    const pipeline = applications.aggregate.mock.calls[0][0] as [
      unknown,
      unknown,
      { $facet: { list: unknown[] } },
    ];
    expect(pipeline[0]).toEqual({
      $match: { memberId, applicationStatus: Status.PENDING },
    });
    expect(pipeline[1]).toEqual({ $sort: { createdAt: -1, _id: -1 } });
    expect(pipeline[2].$facet.list).toEqual([{ $skip: 10 }, { $limit: 10 }]);
  });

  it.each([
    { page: 0, limit: 10 },
    { page: 1, limit: 101 },
    { page: 1, limit: 10, sort: 'memberPassword' },
  ])('rejects invalid inquiry %j', async (input) => {
    await expect(
      service.getAllInstructorApplicationsByAdmin(adminId, input as never),
    ).rejects.toThrow(BadRequestException);
    expect(applications.aggregate).not.toHaveBeenCalled();
  });

  it('approves and promotes with the same transaction and reviewed snapshot', async () => {
    const approved = await service.approveInstructorApplicationByAdmin(
      adminId,
      applicationId,
    );
    expect(approved.applicationStatus).toBe(Status.APPROVED);
    expect(approved.reviewedBy).toBe(adminId);
    expect(memberService.promoteMemberToInstructor).toHaveBeenCalledWith(
      memberId,
      approved,
      session,
    );
    expect(applications.findOneAndUpdate.mock.calls[0][0]).toEqual({
      _id: applicationId,
      applicationStatus: Status.PENDING,
    });
    expect(applications.findOneAndUpdate.mock.calls[0][2]).toEqual({
      new: true,
      runValidators: true,
      session,
    });
  });

  it('propagates promotion failure out of the transaction for rollback', async () => {
    const failure = new ConflictException('Member is no longer USER');
    memberService.promoteMemberToInstructor.mockRejectedValue(failure);
    await expect(
      service.approveInstructorApplicationByAdmin(adminId, applicationId),
    ).rejects.toBe(failure);
  });

  it('revalidates Resort references before approval', async () => {
    application.instructorResortId = new Types.ObjectId();
    resorts.assertVisibleResort.mockRejectedValue(new NotFoundException());
    await expect(
      service.approveInstructorApplicationByAdmin(adminId, applicationId),
    ).rejects.toThrow(NotFoundException);
    expect(applications.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects with trimmed reason and leaves Member entirely unchanged', async () => {
    const rejected = await service.rejectInstructorApplicationByAdmin(adminId, {
      _id: applicationId.toHexString(),
      rejectionReason: '  insufficient experience  ',
    });
    expect(rejected.applicationStatus).toBe(Status.REJECTED);
    expect(rejected.rejectionReason).toBe('insufficient experience');
    expect(memberService.promoteMemberToInstructor).not.toHaveBeenCalled();
    expect(members.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it.each([Status.APPROVED, Status.REJECTED])(
    'denies repeated review of %s',
    async (status) => {
      application.applicationStatus = status;
      await expect(
        service.approveInstructorApplicationByAdmin(adminId, applicationId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.rejectInstructorApplicationByAdmin(adminId, {
          _id: applicationId.toHexString(),
          rejectionReason: 'reason',
        }),
      ).rejects.toThrow(ConflictException);
      expect(applications.findOneAndUpdate).not.toHaveBeenCalled();
    },
  );

  it('denies a concurrent review losing the pending compare-and-set', async () => {
    applications.findOneAndUpdate.mockReturnValue(query(null));
    await expect(
      service.approveInstructorApplicationByAdmin(adminId, applicationId),
    ).rejects.toThrow(ConflictException);
    expect(memberService.promoteMemberToInstructor).not.toHaveBeenCalled();
  });

  it('returns not found for absent applications and rejects blank rejection reasons', async () => {
    applications.findById.mockReturnValue(query(null));
    await expect(
      service.getInstructorApplicationByAdmin(adminId, applicationId),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.rejectInstructorApplicationByAdmin(adminId, {
        _id: applicationId.toHexString(),
        rejectionReason: ' ',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
