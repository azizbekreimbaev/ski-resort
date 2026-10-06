import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { ValidationArguments } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import {
  ResortFacilities,
  ResortLevel,
  ResortLocation,
  ResortStatus,
} from '../../enums/resort.enum';

export const availableResortSorts = [
  'createdAt',
  'updatedAt',
  'resortTitle',
  'resortPricePerDay',
  'resortLikes',
  'resortViews',
  'resortComments',
];

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class ResortInput {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  resortTitle!: string;

  @IsEnum(ResortLocation)
  @Field(() => ResortLocation)
  resortLocation!: ResortLocation;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  resortAddress!: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  resortPricePerDay!: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  resortMinDays = 1;

  @IsOptional()
  @IsEnum(ResortLevel)
  @Field(() => ResortLevel, { nullable: true })
  resortLevel?: ResortLevel | null;

  @IsArray()
  @IsString({ each: true })
  @Field(() => [String])
  resortImages!: string[];

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

@ValidatorConstraint({ name: 'orderedResortPricesRange', async: false })
class OrderedResortPricesRange implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const { start } = args.object as ResortPricesRange;
    return typeof value === 'number' && value >= start;
  }

  defaultMessage(): string {
    return 'end must be greater than or equal to start';
  }
}

@InputType()
export class ResortPricesRange {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  start!: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Validate(OrderedResortPricesRange)
  @Field(() => Float)
  end!: number;
}

@InputType()
export class ResortSearch {
  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  memberId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ResortLocation, { each: true })
  @Field(() => [ResortLocation], { nullable: true })
  locationList?: ResortLocation[];

  @IsOptional()
  @IsArray()
  @IsEnum(ResortLevel, { each: true })
  @Field(() => [ResortLevel], { nullable: true })
  levelList?: ResortLevel[];

  @IsOptional()
  @IsArray()
  @IsEnum(ResortFacilities, { each: true })
  @Field(() => [ResortFacilities], { nullable: true })
  facilities?: ResortFacilities[];

  @IsOptional()
  @IsObject()
  @Type(() => ResortPricesRange)
  @ValidateNested()
  @Field(() => ResortPricesRange, { nullable: true })
  pricesRange?: ResortPricesRange;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class AllResortSearch extends ResortSearch {
  @IsOptional()
  @IsEnum(ResortStatus)
  @Field(() => ResortStatus, { nullable: true })
  resortStatus?: ResortStatus;
}

@InputType()
export class ResortHistoryInquiry {
  @IsInt()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int)
  limit!: number;
}

@InputType()
export class ResortsInquiry extends ResortHistoryInquiry {
  @IsOptional()
  @IsIn(availableResortSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => ResortSearch)
  @ValidateNested()
  @Field(() => ResortSearch, { nullable: true })
  search: ResortSearch = new ResortSearch();
}

@InputType()
export class AllResortsInquiry extends ResortHistoryInquiry {
  @IsOptional()
  @IsIn(availableResortSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllResortSearch)
  @ValidateNested()
  @Field(() => AllResortSearch, { nullable: true })
  search: AllResortSearch = new AllResortSearch();
}
