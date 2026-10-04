import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose'
import {
  InstructorAudience,
  InstructorLevel,
  MemberAuthType,
  MemberStatus,
  MemberType,
} from '../../enums/member.enum';
import { MeLiked } from "../like/like";
import { MeFollowed } from "../follow/follow";


@ObjectType()
export class Member {

    @Field(() => String)
    _id!: ObjectId;


    @Field(() => MemberType)
    memberType!: MemberType;

    @Field(() => MemberStatus)
    memberStatus!: MemberStatus;

    @Field(() => MemberAuthType)
    memberAuthType!: MemberAuthType;

    @Field(() => String)
    memberPhone!: string;

    @Field(() => String)
    memberNick!: string;

    memberPassword?: string

    @Field(() => String, { nullable: true })
    memberFullName?: string;

    @Field(() => String)
    memberImage!: string;

    @Field(() => String, { nullable: true })
    memberAddress?: string;

    @Field(() => String, { nullable: true })
    memberDesc?: string;

  @Field(() => String, { nullable: true })
  instructorResortId?: ObjectId | null;

  @Field(() => Int, { nullable: true })
  instructorExperienceYears?: number | null;

  @Field(() => [String], { nullable: true })
  instructorLanguages?: string[] | null;

  @Field(() => InstructorLevel, { nullable: true })
  instructorLevel?: InstructorLevel | null;

  @Field(() => InstructorAudience, { nullable: true })
  instructorAudience?: InstructorAudience | null;

  @Field(() => Float, { nullable: true })
  instructorPrice1Week?: number | null;

  @Field(() => Float, { nullable: true })
  instructorPrice2Weeks?: number | null;

  @Field(() => Float, { nullable: true })
  instructorPrice3Weeks?: number | null;

  @Field(() => Float, { nullable: true })
  instructorPrice4Weeks?: number | null;

    @Field(() => Int)
    memberProperties!: number;

    @Field(() => Int)
    memberArticles!: number;

    @Field(() => Int)
    memberFollowers!: number;

    @Field(() => Int)
    memberFollowings!: number;

    @Field(() => Int)
    memberPoints!: number;

    @Field(() => Int)
    memberLikes!: number;

    @Field(() => Int)
    memberViews!: number;

    @Field(() => Int)
    memberComments!: number;

    @Field(() => Int)
    memberRank!: number;

    @Field(() => Int)
    memberWarnings!: number;

    @Field(() => Int)
    memberBlocks!: number;

    @Field(() => Date, { nullable: true })
    deletedAt?: Date;

    @Field(() => Date,)
    createdAt?: Date;

    @Field(() => Date,)
    updatedAt?: Date;
    @Field(() => String, { nullable: true })
    accessToken?: string;

    //**AGGREGATION */

    @Field(() => [MeLiked], { nullable: true })
    meLiked?: MeLiked[]

    @Field(() => [MeFollowed], { nullable: true })
    meFollowed?: MeFollowed[]


}

@ObjectType()
export class TotalCounter {
    @Field(() => Int, { nullable: true })
    total?: number
}

@ObjectType()
export class Members {
    @Field(() => [Member])
    list!: Member[]

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter?: TotalCounter[]
}
