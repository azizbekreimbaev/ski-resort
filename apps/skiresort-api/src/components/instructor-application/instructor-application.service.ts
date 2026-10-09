import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import type { ObjectId } from 'mongoose';
import { validateMongoObjectId } from '../../libs/config';
import {
  InstructorApplication,
  InstructorApplications,
} from '../../libs/dto/instructor-application/instructor-application';
import {
  availableInstructorApplicationSorts,
  InstructorApplicationInput,
  InstructorApplicationReject,
  InstructorApplicationsInquiry,
} from '../../libs/dto/instructor-application/instructor-application.input';
import { Member } from '../../libs/dto/member/member';
import { Direction, Message } from '../../libs/enums/common.enum';
import { InstructorApplicationStatus } from '../../libs/enums/instructor-application.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { MemberService } from '../member/member.service';
import { ResortService } from '../resort/resort.service';

type MongoId = ObjectId | Types.ObjectId;

@Injectable()
export class InstructorApplicationService {
  constructor(
    @InjectModel('InstructorApplication')
    private readonly applicationModel: Model<InstructorApplication>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    @InjectConnection() private readonly connection: Connection,
    private readonly memberService: MemberService,
    private readonly resortService: ResortService,
  ) {}

  public async createInstructorApplication(
    memberId: MongoId,
    input: InstructorApplicationInput,
  ): Promise<InstructorApplication> {
    try {
      return await this.connection.transaction(async (session) => {
        const member = await this.assertActiveRole(
          memberId,
          MemberType.USER,
          session,
        );
        if (
          await this.applicationModel
            .exists({
              memberId,
              applicationStatus: InstructorApplicationStatus.PENDING,
            })
            .session(session)
        ) {
          throw new ConflictException(
            'A pending instructor application already exists',
          );
        }
        const resortId =
          input.instructorResortId == null
            ? null
            : validateMongoObjectId(input.instructorResortId);
        if (resortId) await this.resortService.assertVisibleResort(resortId);

        // A real Member write serializes submission against concurrent promotion.
        // Monotonic timestamps also protect submissions arriving in the same millisecond.
        const updatedAt = new Date(
          Math.max(Date.now(), new Date(member.updatedAt ?? 0).getTime() + 1),
        );
        const touched = await this.memberModel
          .findOneAndUpdate(
            {
              _id: memberId,
              memberType: MemberType.USER,
              memberStatus: MemberStatus.ACTIVE,
              updatedAt: member.updatedAt,
            },
            { $set: { updatedAt } },
            { session, new: true, timestamps: false },
          )
          .exec();
        if (!touched)
          throw new ConflictException(
            'Member changed while submitting application',
          );
        const [application] = await this.applicationModel.create(
          [
            {
              memberId,
              applicationStatus: InstructorApplicationStatus.PENDING,
              instructorResortId: resortId,
              instructorExperienceYears: input.instructorExperienceYears,
              instructorLanguages: input.instructorLanguages.map((language) =>
                language.trim(),
              ),
              instructorLevel: input.instructorLevel,
              instructorAudience: input.instructorAudience,
              memberDesc: input.memberDesc ?? null,
            },
          ],
          { session },
        );
        return application.toObject();
      });
    } catch (error) {
      if ((error as { code?: number } | null)?.code === 11000) {
        throw new ConflictException(
          'A pending instructor application already exists',
        );
      }
      throw error;
    }
  }

  public async getMyInstructorApplication(
    memberId: MongoId,
  ): Promise<InstructorApplication | null> {
    await this.assertActiveRole(memberId);
    return await this.applicationModel
      .findOne({ memberId })
      .sort({ createdAt: -1, _id: -1 })
      .lean<InstructorApplication>()
      .exec();
  }

  public async getAllInstructorApplicationsByAdmin(
    adminId: MongoId,
    input: InstructorApplicationsInquiry,
  ): Promise<InstructorApplications> {
    await this.assertActiveRole(adminId, MemberType.ADMIN);
    const sortKey = input.sort ?? 'createdAt';
    const direction = input.direction ?? Direction.DESC;
    if (
      !Number.isInteger(input.page) ||
      input.page < 1 ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > 100 ||
      !availableInstructorApplicationSorts.includes(sortKey) ||
      ![Direction.ASC, Direction.DESC].includes(direction)
    ) {
      throw new BadRequestException(
        'Invalid instructor application pagination or sort',
      );
    }
    const match: Record<string, unknown> = {};
    if (input.search?.applicationStatus != null) {
      if (
        !Object.values(InstructorApplicationStatus).includes(
          input.search.applicationStatus,
        )
      )
        throw new BadRequestException('Invalid application status');
      match.applicationStatus = input.search.applicationStatus;
    }
    if (input.search?.memberId)
      match.memberId = validateMongoObjectId(input.search.memberId);
    const sort = { [sortKey]: direction, _id: direction };
    const result = await this.applicationModel
      .aggregate<InstructorApplications>([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    return result[0] ?? { list: [], metaCounter: [] };
  }

  public async getInstructorApplicationByAdmin(
    adminId: MongoId,
    applicationId: MongoId,
  ): Promise<InstructorApplication> {
    await this.assertActiveRole(adminId, MemberType.ADMIN);
    const application = await this.applicationModel
      .findById(applicationId)
      .lean<InstructorApplication>()
      .exec();
    if (!application)
      throw new NotFoundException('Instructor application not found');
    return application;
  }

  public async approveInstructorApplicationByAdmin(
    adminId: MongoId,
    applicationId: MongoId,
  ): Promise<InstructorApplication> {
    return await this.connection.transaction(async (session) => {
      await this.assertActiveRole(adminId, MemberType.ADMIN, session);
      const application = await this.pendingApplication(applicationId, session);
      if (application.instructorResortId)
        await this.resortService.assertVisibleResort(
          application.instructorResortId,
        );
      const approved = await this.applicationModel
        .findOneAndUpdate(
          {
            _id: applicationId,
            applicationStatus: InstructorApplicationStatus.PENDING,
          },
          {
            $set: {
              applicationStatus: InstructorApplicationStatus.APPROVED,
              reviewedBy: adminId,
              reviewedAt: new Date(),
              rejectionReason: null,
            },
          },
          { new: true, runValidators: true, session },
        )
        .lean<InstructorApplication>()
        .exec();
      if (!approved)
        throw new ConflictException('Application has already been reviewed');
      await this.memberService.promoteMemberToInstructor(
        approved.memberId,
        approved,
        session,
      );
      return approved;
    });
  }

  public async rejectInstructorApplicationByAdmin(
    adminId: MongoId,
    input: InstructorApplicationReject,
  ): Promise<InstructorApplication> {
    const applicationId = validateMongoObjectId(input._id);
    if (
      typeof input.rejectionReason !== 'string' ||
      !input.rejectionReason.trim()
    )
      throw new BadRequestException('Rejection reason is required');
    return await this.connection.transaction(async (session) => {
      await this.assertActiveRole(adminId, MemberType.ADMIN, session);
      await this.pendingApplication(applicationId, session);
      const rejected = await this.applicationModel
        .findOneAndUpdate(
          {
            _id: applicationId,
            applicationStatus: InstructorApplicationStatus.PENDING,
          },
          {
            $set: {
              applicationStatus: InstructorApplicationStatus.REJECTED,
              reviewedBy: adminId,
              reviewedAt: new Date(),
              rejectionReason: input.rejectionReason.trim(),
            },
          },
          { new: true, runValidators: true, session },
        )
        .lean<InstructorApplication>()
        .exec();
      if (!rejected)
        throw new ConflictException('Application has already been reviewed');
      return rejected;
    });
  }

  private async assertActiveRole(
    memberId: MongoId,
    role?: MemberType,
    session?: ClientSession,
  ): Promise<Member> {
    const member = await this.memberModel
      .findOne({
        _id: memberId,
        memberStatus: MemberStatus.ACTIVE,
        ...(role ? { memberType: role } : {}),
      })
      .session(session ?? null)
      .lean<Member>()
      .exec();
    if (!member)
      throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
    return member;
  }

  private async pendingApplication(
    applicationId: MongoId,
    session: ClientSession,
  ): Promise<InstructorApplication> {
    const application = await this.applicationModel
      .findById(applicationId)
      .session(session)
      .lean<InstructorApplication>()
      .exec();
    if (!application)
      throw new NotFoundException('Instructor application not found');
    if (application.applicationStatus !== InstructorApplicationStatus.PENDING)
      throw new ConflictException('Application has already been reviewed');
    return application;
  }
}
