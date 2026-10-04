import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import {
  ResortFacilities,
  ResortLevel,
  ResortLocation,
  ResortStatus,
} from '../../enums/resort.enum';
import { MeLiked } from '../like/like';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class Resort {
  @Field(() => String)
  _id!: Types.ObjectId;

  @Field(() => ResortStatus)
  resortStatus!: ResortStatus;

  @Field(() => String)
  resortTitle!: string;

  @Field(() => ResortLocation)
  resortLocation!: ResortLocation;

  @Field(() => String)
  resortAddress!: string;

  @Field(() => Float)
  resortPricePerDay!: number;

  @Field(() => Int)
  resortMinDays!: number;

  @Field(() => ResortLevel, { nullable: true })
  resortLevel?: ResortLevel | null;

  @Field(() => [String])
  resortImages!: string[];

  @Field(() => [ResortFacilities], { nullable: true })
  resortFacilities?: ResortFacilities[] | null;

  @Field(() => String, { nullable: true })
  resortDesc?: string | null;

  @Field(() => Int)
  resortViews!: number;

  @Field(() => Int)
  resortLikes!: number;

  @Field(() => Int)
  resortComments!: number;

  @Field(() => String)
  memberId!: Types.ObjectId;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;

  @Field(() => Member, { nullable: true })
  memberData?: Member | null;

  @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];
}

@ObjectType()
export class Resorts {
  @Field(() => [Resort])
  list!: Resort[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter!: TotalCounter[];
}
