import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { InstructorAudience, InstructorLevel } from '../../enums/member.enum';

@InputType()
export class InstructorProfileUpdate {
  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  instructorResortId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  instructorExperienceYears?: number | null;

  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((language: unknown) =>
          typeof language === 'string' ? language.trim() : language,
        )
      : value,
  )
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/\S/, { each: true })
  @Field(() => [String], { nullable: true })
  instructorLanguages?: string[] | null;

  @IsOptional()
  @IsEnum(InstructorLevel)
  @Field(() => InstructorLevel, { nullable: true })
  instructorLevel?: InstructorLevel | null;

  @IsOptional()
  @IsEnum(InstructorAudience)
  @Field(() => InstructorAudience, { nullable: true })
  instructorAudience?: InstructorAudience | null;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice1Week?: number | null;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice2Weeks?: number | null;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice3Weeks?: number | null;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice4Weeks?: number | null;
}
