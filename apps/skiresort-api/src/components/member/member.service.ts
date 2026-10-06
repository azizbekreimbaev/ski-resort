import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import {
  InstructorsInquiry,
  LoginInput,
  MemberInput,
  MembersInquiry,
} from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { ObjectId } from 'mongoose';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { lookupAuthMemberFollowed, lookupAuthMemberLiked } from '../../libs/config';
import { validateMongoObjectId } from '../../libs/config';
import { InstructorProfileUpdate } from '../../libs/dto/member/instructor-profile.update';
import { InstructorApplication } from '../../libs/dto/instructor-application/instructor-application';
import { InstructorApplicationStatus } from '../../libs/enums/instructor-application.enum';
import { ResortService } from '../resort/resort.service';
@Injectable()
export class MemberService {

    constructor(
        @InjectModel("Member") private readonly memberModel: Model<Member>,
        @InjectModel("Follow") private readonly followModel: Model<Follower | Following>,
        private authService: AuthService,
        private viewService: ViewService,
        private likeService: LikeService,
    private resortService: ResortService,
    ) { }

    public async signup(input: MemberInput): Promise<Member> {
    if (
      input.memberType !== undefined &&
      input.memberType !== MemberType.USER
    ) {
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
    }
        try {

            input.memberPassword = await this.authService.hashPassword(input.memberPassword)

            const result = await this.memberModel.create(input)

            // AUTHENTICATION TOKENS
            result.accessToken = await this.authService.createToken(result)
            console.log("accessToken", result)
            return result

        } catch (err) {
            console.log("ERROR on signup service model", err instanceof Error ? err.message : err)
            throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE)
        }

    }

    public async login(input: LoginInput): Promise<Member> {
        try {

            const { memberNick, memberPassword } = input
            const result = await this.memberModel.findOne({ memberNick: memberNick })
                .select("+memberPassword").exec()


            if (!result || result.memberStatus === MemberStatus.DELETE) {
                throw new InternalServerErrorException(Message.NO_MEMBER_NICK)
            } else if (result.memberStatus === MemberStatus.BLOCK) {
                throw new InternalServerErrorException(Message.BLOCKED_USER)
            }

            // BSCRYPT COMPARING PASSWORD

            const isMatch = await this.authService
                .comparePasswords(input.memberPassword, result.memberPassword)

            if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD)


            result.accessToken = await this.authService.createToken(result)

            return result


        } catch (err) {

            console.log("ERROR on login service model", err)
            throw new BadRequestException(err)
        }

    }

    public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
    if (input.memberType !== undefined) {
      const current = await this.memberModel
        .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
        .exec();
      if (!current || input.memberType !== current.memberType) {
        throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
      }
    }
        const result: Member | null = await this.memberModel.findOneAndUpdate(
            { _id: memberId, memberStatus: MemberStatus.ACTIVE },
      this.generalProfileFields(input),
            { new: true }
        )

        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED)

        result.accessToken = await this.authService.createToken(result)

        return result
    }

    public async getMember(memberId: ObjectId | null, targetId: ObjectId): Promise<Member> {

        const search: T = {
            _id: targetId,
            memberStatus: {
                $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK]
            }
        }

        let targetMember = await this.memberModel.findOne(search).exec()

        if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND)


        if (memberId) {
            //view
            //increase

            const viewInput: ViewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER }

            const newView = await this.viewService.recordView(viewInput)

            if (newView) {
                await this.memberModel
                    .findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec()
                targetMember.memberViews++
            }
            //LIKED
            const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
            targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput)

            //Follow
            targetMember.meFollowed = await this.checkSubscription(memberId, targetId)


        }





        return targetMember
    }

    private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {

        const result = await this.followModel.findOne({
            followerId: followerId, followingId: followingId
        }).exec()

        return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : []
    }

  public async getInstructors(
    memberId: ObjectId,
    input: InstructorsInquiry,
  ): Promise<Members> {
        const { text } = input.search
    const match: T = {
      memberType: MemberType.INSTRUCTOR,
      memberStatus: MemberStatus.ACTIVE,
    };
        const sort: T = { [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC }


        if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
        console.log("match", match)


        const result = await this.memberModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        lookupAuthMemberLiked(memberId),
                        lookupAuthMemberFollowed({ followerId: memberId, followingId: '$_id' })
                    ],
                    metaCounter: [{ $count: 'total' }]
                }
            }
        ])

        console.log("result", result)
        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND)
        return result[0]
    }


    public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
        const target = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec()
        if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        const input: LikeInput = {
            memberId: memberId,
            likeRefId: likeRefId,
            likeGroup: LikeGroup.MEMBER
        }


        const modifier: number = await this.likeService.toggleLike(input)

        const result = await this.memberStatsEditor({
            _id: likeRefId,
            targetKey: "memberLikes",
            modifier: modifier
        })

        if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG)
        return result

    }



    /**ADMIN */


    public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
        const { memberStatus, memberType, text } = input.search
        const match: T = {}
        const sort: T = { [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC }

        if (memberStatus) match.memberStatus = memberStatus
        if (memberType) match.memberType = memberType

        if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
        console.log("match", match)


        const result = await this.memberModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
                    metaCounter: [{ $count: 'total' }]
                }
            }
        ])

        console.log("result", result)
        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND)


        return result[0]
    }

    public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
    const match: Record<string, unknown> = { _id: input._id };
    const values = this.generalProfileFields(input);
    if (input.memberType !== undefined) {
      const current = await this.memberModel.findOne({ _id: input._id }).exec();
      if (!current)
        throw new InternalServerErrorException(Message.UPDATE_FAILED);
      if (!Object.values(MemberType).includes(input.memberType)) {
        throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
      }
      if (input.memberType !== current.memberType) {
        if (
          input.memberType === MemberType.INSTRUCTOR ||
          current.memberType === MemberType.INSTRUCTOR
        ) {
          throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
        }
        match.memberType = current.memberType;
        values.memberType = input.memberType;
      }
    }
        const result = await this.memberModel.findOneAndUpdate(
            match,
            values,
            { new: true }
        ).exec()

        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED)

        return result
    }

  public async promoteMemberToInstructor(
    memberId: ObjectId | Types.ObjectId,
    application: InstructorApplication,
    session: ClientSession,
  ): Promise<Member> {
    if (
      !session.inTransaction() ||
      application.applicationStatus !== InstructorApplicationStatus.APPROVED ||
      application.memberId.toString() !== memberId.toString()
    ) {
      throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
    }
    const result = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberStatus: MemberStatus.ACTIVE,
          memberType: MemberType.USER,
        },
        {
          $set: {
            memberType: MemberType.INSTRUCTOR,
            instructorResortId: application.instructorResortId ?? null,
            instructorExperienceYears: application.instructorExperienceYears,
            instructorLanguages: application.instructorLanguages,
            instructorLevel: application.instructorLevel,
            instructorAudience: application.instructorAudience,
          },
        },
        { new: true, runValidators: true, session },
      )
      .exec();
    if (!result)
      throw new ConflictException('Only an active USER can be approved');
    return result;
  }

  public async updateInstructorProfile(
    memberId: ObjectId,
    input: InstructorProfileUpdate,
  ): Promise<Member> {
    const values: Record<string, unknown> = {};
    for (const field of [
      'instructorResortId',
      'instructorExperienceYears',
      'instructorLanguages',
      'instructorLevel',
      'instructorAudience',
      'instructorPrice1Week',
      'instructorPrice2Weeks',
      'instructorPrice3Weeks',
      'instructorPrice4Weeks',
    ] as const) {
      if (input[field] !== undefined) values[field] = input[field];
    }
    if (input.instructorResortId != null) {
      const resortId = validateMongoObjectId(input.instructorResortId);
      values.instructorResortId = resortId;
      await this.resortService.assertVisibleResort(resortId);
    }
    if (input.instructorLanguages != null) {
      values.instructorLanguages = input.instructorLanguages.map((language) =>
        language.trim(),
      );
    }
    const result = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberType: MemberType.INSTRUCTOR,
          memberStatus: MemberStatus.ACTIVE,
        },
        { $set: values },
        { new: true, runValidators: true },
      )
      .exec();
    if (!result)
      throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
    result.accessToken = await this.authService.createToken(result);
    return result;
  }

  private generalProfileFields(input: MemberUpdate): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const field of [
      'memberStatus',
      'memberPhone',
      'memberNick',
      'memberPassword',
      'memberFullName',
      'memberImage',
      'memberAddress',
      'memberDesc',
    ] as const) {
      if (input[field] !== undefined) values[field] = input[field];
    }
    return values;
  }

    public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
        const { _id, targetKey, modifier } = input

        const result = await this.memberModel.findOneAndUpdate(
            { _id },
            { $inc: { [targetKey]: modifier } },
            { new: true }
        ).exec()

        if (!result) throw new InternalServerErrorException("memberStatsEditor error")
        return result
    }

}
