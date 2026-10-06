import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import type { Types } from 'mongoose';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ResortFacilities,
  ResortLevel,
  ResortLocation,
  ResortStatus,
} from '../../enums/resort.enum';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class ResortUpdate {
  @IsMongoId()
  @Field(() => String)
  _id!: string | Types.ObjectId;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(ResortStatus)
  @Field(() => ResortStatus, { nullable: true })
  resortStatus?: ResortStatus;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  resortTitle?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(ResortLocation)
  @Field(() => ResortLocation, { nullable: true })
  resortLocation?: ResortLocation;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  resortAddress?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  resortPricePerDay?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  resortMinDays?: number;

  @IsOptional()
  @IsEnum(ResortLevel)
  @Field(() => ResortLevel, { nullable: true })
  resortLevel?: ResortLevel | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  resortImages?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(ResortFacilities, { each: true })
  @Field(() => [ResortFacilities], { nullable: true })
  resortFacilities?: ResortFacilities[] | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  resortDesc?: string | null;
}
