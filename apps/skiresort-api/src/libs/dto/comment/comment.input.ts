import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import type { ObjectId } from 'mongoose';
import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';
import { availableCommentSorts } from '../../config';

@InputType()
export class CommentInput {
  @IsNotEmpty()
  @IsEnum(CommentGroup)
  @Field(() => CommentGroup)
  commentGroup!: CommentGroup;

  @IsNotEmpty()
  @Length(1, 100)
  @Field(() => String)
  commentContent!: string;

  @IsNotEmpty()
  @IsMongoId()
  @Field(() => String)
  commentRefId!: ObjectId;

  memberId?: ObjectId;
}

@InputType()
class CISearch {
  @IsNotEmpty()
  @IsMongoId()
  @Field(() => String)
  commentRefId!: ObjectId;

  @IsOptional()
  @IsEnum(CommentGroup)
  @Field(() => CommentGroup, { nullable: true })
  commentGroup?: CommentGroup;
}

@InputType()
export class CommentsInquiry {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  limit!: number;

  @IsOptional()
  @IsIn(availableCommentSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CISearch)
  @Field(() => CISearch)
  search!: CISearch;
}
