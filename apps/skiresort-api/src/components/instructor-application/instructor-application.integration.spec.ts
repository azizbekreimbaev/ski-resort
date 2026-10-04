import { createConnection, Connection, Model, Types } from 'mongoose';
import InstructorApplicationSchema from '../../schemas/InstructorApplication.model';
import MemberSchema from '../../schemas/Member.model';
import { InstructorApplicationService } from './instructor-application.service';
import { MemberService } from '../member/member.service';
import { InstructorApplication } from '../../libs/dto/instructor-application/instructor-application';
import { Member } from '../../libs/dto/member/member';
import {
  InstructorAudience,
  InstructorLevel,
  MemberType,
  MemberStatus,
} from '../../libs/enums/member.enum';
import { InstructorApplicationStatus as Status } from '../../libs/enums/instructor-application.enum';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

// Opt in with a transaction-capable TEST server only. Never load .env or AppModule.
// Every run owns a new database; only that generated database is removed.
const testUri = process.env.SKIRESORT_TEST_MONGO_URI;
const integration = testUri ? describe : describe.skip;

integration('Instructor lifecycle isolated MongoDB integration', () => {
  let connection: Connection;
  let members: Model<Member>;
  let applications: Model<InstructorApplication>;
  let service: InstructorApplicationService;
  let memberService: MemberService;
  let memberId: Types.ObjectId;
  let adminId: Types.ObjectId;
  const databaseName = `skiresort_instructor_test_${new Types.ObjectId().toHexString()}`;
  const input = {
    instructorExperienceYears: 2,
    instructorLanguages: ['English'],
    instructorLevel: InstructorLevel.ALL,
    instructorAudience: InstructorAudience.FAMILY,
  };

  beforeAll(async () => {
    connection = await createConnection(testUri!, {
      dbName: databaseName,
      autoIndex: false,
    }).asPromise();
    members = connection.model<Member>('Member', MemberSchema);
    applications = connection.model<InstructorApplication>(
      'InstructorApplication',
      InstructorApplicationSchema,
    );
    await members.createCollection();
    await applications.createCollection();
    await applications.createIndexes();
    const resorts = { assertVisibleResort: jest.fn() };
    memberService = new MemberService(
      members,
      {} as never,
      { createToken: jest.fn().mockResolvedValue('test-token') } as never,
      {} as never,
      {} as never,
      resorts as never,
    );
    service = new InstructorApplicationService(
      applications,
      members,
      connection,
      memberService,
      resorts as never,
    );
  }, 30000);

  afterAll(async () => {
    if (!connection) return;
    try {
      if (
        connection.name !== databaseName ||
        !/^skiresort_instructor_test_[a-f\d]{24}$/.test(databaseName)
      )
        throw new Error('Refusing unexpected test database cleanup');
      await connection.dropDatabase();
    } finally {
      await connection.close();
    }
  });

  beforeEach(async () => {
    await applications.deleteMany({});
    await members.deleteMany({});
    const user = await members.create({
      memberNick: 'user',
      memberPhone: 'user-phone',
      memberPassword: 'test-hash',
      memberType: MemberType.USER,
    });
    const admin = await members.create({
      memberNick: 'admin',
      memberPhone: 'admin-phone',
      memberPassword: 'test-hash',
      memberType: MemberType.ADMIN,
    });
    memberId = user._id as unknown as Types.ObjectId;
    adminId = admin._id as unknown as Types.ObjectId;
  });

  it('permits only one concurrent pending submission and leaves Member USER', async () => {
    const outcomes = await Promise.allSettled([
      service.createInstructorApplication(memberId, input),
      service.createInstructorApplication(memberId, input),
    ]);
    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      await applications.countDocuments({
        memberId,
        applicationStatus: Status.PENDING,
      }),
    ).toBe(1);
    expect((await members.findById(memberId))!.memberType).toBe(
      MemberType.USER,
    );
  });

  it('retains rejected history, permits resubmission and promotes only on approval', async () => {
    const first = await service.createInstructorApplication(memberId, input);
    await service.rejectInstructorApplicationByAdmin(adminId, {
      _id: first._id.toHexString(),
      rejectionReason: 'Please provide more experience',
    });
    expect((await members.findById(memberId))!.memberType).toBe(
      MemberType.USER,
    );
    const second = await service.createInstructorApplication(memberId, input);
    await service.approveInstructorApplicationByAdmin(adminId, second._id);
    const instructor = await members.findById(memberId);
    expect(instructor!.memberType).toBe(MemberType.INSTRUCTOR);
    expect(instructor!.instructorAudience).toBe(InstructorAudience.FAMILY);
    expect(instructor!.instructorPrice1Week).toBeNull();
    expect(await applications.countDocuments({ memberId })).toBe(2);
    expect((await applications.findById(first._id))!.applicationStatus).toBe(
      Status.REJECTED,
    );
  });

  it('rolls back reviewed status and role if promotion fails', async () => {
    const application = await service.createInstructorApplication(
      memberId,
      input,
    );
    const promote = jest
      .spyOn(memberService, 'promoteMemberToInstructor')
      .mockRejectedValueOnce(new Error('injected promotion failure'));
    try {
      await expect(
        service.approveInstructorApplicationByAdmin(adminId, application._id),
      ).rejects.toThrow('injected promotion failure');
      expect(
        (await applications.findById(application._id))!.applicationStatus,
      ).toBe(Status.PENDING);
      expect((await members.findById(memberId))!.memberType).toBe(
        MemberType.USER,
      );
    } finally {
      promote.mockRestore();
    }
  });

  it('allows exactly one competing approval/rejection and keeps role consistent', async () => {
    const application = await service.createInstructorApplication(
      memberId,
      input,
    );
    const outcomes = await Promise.allSettled([
      service.approveInstructorApplicationByAdmin(adminId, application._id),
      service.rejectInstructorApplicationByAdmin(adminId, {
        _id: application._id.toHexString(),
        rejectionReason: 'Not approved',
      }),
    ]);
    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled'),
    ).toHaveLength(1);
    const stored = await applications.findById(application._id);
    expect((await members.findById(memberId))!.memberType).toBe(
      stored!.applicationStatus === Status.APPROVED
        ? MemberType.INSTRUCTOR
        : MemberType.USER,
    );
  });

  it('cannot approve a blocked or changed-role applicant', async () => {
    const application = await service.createInstructorApplication(
      memberId,
      input,
    );
    await members.updateOne(
      { _id: memberId },
      { $set: { memberStatus: MemberStatus.BLOCK } },
    );
    await expect(
      service.approveInstructorApplicationByAdmin(adminId, application._id),
    ).rejects.toThrow();
    expect(
      (await applications.findById(application._id))!.applicationStatus,
    ).toBe(Status.PENDING);
  });

  it('returns only active instructors in the public directory', async () => {
    const application = await service.createInstructorApplication(
      memberId,
      input,
    );
    await service.approveInstructorApplicationByAdmin(adminId, application._id);
    await members.create([
      {
        memberNick: 'blocked',
        memberPhone: 'blocked-phone',
        memberPassword: 'hash',
        memberType: MemberType.INSTRUCTOR,
        memberStatus: MemberStatus.BLOCK,
      },
      {
        memberNick: 'deleted',
        memberPhone: 'deleted-phone',
        memberPassword: 'hash',
        memberType: MemberType.INSTRUCTOR,
        memberStatus: MemberStatus.DELETE,
      },
      {
        memberNick: 'ordinary',
        memberPhone: 'ordinary-phone',
        memberPassword: 'hash',
        memberType: MemberType.USER,
      },
    ]);
    const result = await memberService.getInstructors(null as never, {
      page: 1,
      limit: 10,
      search: {},
    });
    expect(result.list.map((member) => member._id.toString())).toEqual([
      memberId.toHexString(),
    ]);
    expect(result.metaCounter).toEqual([{ total: 1 }]);
  });

  it('cannot leave a pending submission while concurrently promoting the Member', async () => {
    const application = await service.createInstructorApplication(
      memberId,
      input,
    );
    const outcomes = await Promise.allSettled([
      service.approveInstructorApplicationByAdmin(adminId, application._id),
      service.createInstructorApplication(memberId, input),
    ]);
    expect(outcomes[0].status).toBe('fulfilled');
    expect(outcomes[1].status).toBe('rejected');
    expect(
      await applications.countDocuments({
        memberId,
        applicationStatus: Status.PENDING,
      }),
    ).toBe(0);
    expect((await members.findById(memberId))!.memberType).toBe(
      MemberType.INSTRUCTOR,
    );
  });
});
