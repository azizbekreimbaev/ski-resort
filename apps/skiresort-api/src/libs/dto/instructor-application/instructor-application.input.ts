import { Field, InputType, Int } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Direction } from '../../enums/common.enum';
import { InstructorApplicationStatus } from '../../enums/instructor-application.enum';
import { InstructorAudience, InstructorLevel } from '../../enums/member.enum';

export const availableInstructorApplicationSorts = [
  'createdAt',
  'updatedAt',
  'reviewedAt',
];

@InputType()
export class InstructorApplicationInput {
  @IsInt()
  @Min(0)
  @Field(() => Int)
  instructorExperienceYears!: number;

  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((language: unknown) =>
          typeof language === 'string' ? language.trim() : language,
        )
      : value,
  )
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Matches(/\S/, { each: true })
  @Field(() => [String])
  instructorLanguages!: string[];

  @IsEnum(InstructorLevel)
  @Field(() => InstructorLevel)
  instructorLevel!: InstructorLevel;

  @IsEnum(InstructorAudience)
  @Field(() => InstructorAudience)
  instructorAudience!: InstructorAudience;

  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  instructorResortId?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  memberDesc?: string | null;
}

@InputType()
export class InstructorApplicationSearch {
  @IsOptional()
  @IsEnum(InstructorApplicationStatus)
  @Field(() => InstructorApplicationStatus, { nullable: true })
  applicationStatus?: InstructorApplicationStatus;

  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  memberId?: string;
}

@InputType()
export class InstructorApplicationsInquiry {
  @IsInt()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int)
  limit!: number;

  @IsOptional()
  @IsIn(availableInstructorApplicationSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => InstructorApplicationSearch)
  @ValidateNested()
  @Field(() => InstructorApplicationSearch, { nullable: true })
  search: InstructorApplicationSearch = new InstructorApplicationSearch();
}

@InputType()
export class InstructorApplicationReject {
  @IsMongoId()
  @Field(() => String)
  _id!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  rejectionReason!: string;
}
