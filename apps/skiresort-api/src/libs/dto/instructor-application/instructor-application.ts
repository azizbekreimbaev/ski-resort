import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { InstructorApplicationStatus } from '../../enums/instructor-application.enum';
import { InstructorAudience, InstructorLevel } from '../../enums/member.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class InstructorApplication {
  @Field(() => String)
  _id!: Types.ObjectId;

  @Field(() => String)
  memberId!: Types.ObjectId;

  @Field(() => InstructorApplicationStatus)
  applicationStatus!: InstructorApplicationStatus;

  @Field(() => Int)
  instructorExperienceYears!: number;

  @Field(() => [String])
  instructorLanguages!: string[];

  @Field(() => InstructorLevel)
  instructorLevel!: InstructorLevel;

  @Field(() => InstructorAudience)
  instructorAudience!: InstructorAudience;

  @Field(() => String, { nullable: true })
  instructorResortId?: Types.ObjectId | null;

  @Field(() => String, { nullable: true })
  memberDesc?: string | null;

  @Field(() => String, { nullable: true })
  reviewedBy?: Types.ObjectId | null;

  @Field(() => Date, { nullable: true })
  reviewedAt?: Date | null;

  @Field(() => String, { nullable: true })
  rejectionReason?: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class InstructorApplications {
  @Field(() => [InstructorApplication])
  list!: InstructorApplication[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter!: TotalCounter[];
}
