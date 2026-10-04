import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
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
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  EquipmentAudience,
  EquipmentCategory,
  EquipmentStatus,
} from '../../enums/equipment.enum';
import { Direction } from '../../enums/common.enum';
const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export const availableEquipmentSorts = [
  'createdAt',
  'updatedAt',
  'equipmentName',
  'equipmentViews',
  'equipmentLikes',
  'equipmentComments',
];
@InputType()
export class EquipmentRentalRateInput {
  @IsInt() @Min(1) @Max(2147483647) @Field(() => Int) durationHours!: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  price!: number;
}
@InputType()
export class EquipmentInput {
  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentStatus)
  @Field(() => EquipmentStatus, {
    nullable: true,
    defaultValue: EquipmentStatus.AVAILABLE,
  })
  equipmentStatus?: EquipmentStatus = EquipmentStatus.AVAILABLE;

  @IsEnum(EquipmentCategory)
  @Field(() => EquipmentCategory)
  equipmentCategory!: EquipmentCategory;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  equipmentName!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentBrand?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentSize?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentAudience)
  @Field(() => EquipmentAudience, {
    nullable: true,
    defaultValue: EquipmentAudience.ALL,
  })
  equipmentAudience?: EquipmentAudience = EquipmentAudience.ALL;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => EquipmentRentalRateInput)
  @ValidateNested({ each: true })
  @Field(() => [EquipmentRentalRateInput])
  equipmentRentalRates!: EquipmentRentalRateInput[];

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  equipmentPurchasable?: boolean = false;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  equipmentPurchasePrice?: number | null;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  @Field(() => Int)
  equipmentQuantity!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  equipmentImages?: string[] | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  equipmentDesc?: string | null;
}
@InputType()
export class EquipmentPricesRange {
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  start!: number;
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  end!: number;
}
@InputType()
export class EquipmentSearch {
  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string;
  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentCategory, { each: true })
  @Field(() => [EquipmentCategory], { nullable: true })
  categoryList?: EquipmentCategory[];
  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentAudience, { each: true })
  @Field(() => [EquipmentAudience], { nullable: true })
  audienceList?: EquipmentAudience[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  sizeList?: string[];
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentBrand?: string;
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;
  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  equipmentPurchasable?: boolean;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  @Field(() => Int, { nullable: true })
  rentalDurationHours?: number;
  @IsOptional()
  @IsObject()
  @Type(() => EquipmentPricesRange)
  @ValidateNested()
  @Field(() => EquipmentPricesRange, { nullable: true })
  rentalPricesRange?: EquipmentPricesRange;
  @IsOptional()
  @IsObject()
  @Type(() => EquipmentPricesRange)
  @ValidateNested()
  @Field(() => EquipmentPricesRange, { nullable: true })
  purchasePricesRange?: EquipmentPricesRange;
}
@InputType()
export class AllEquipmentSearch extends EquipmentSearch {
  @IsOptional()
  @IsEnum(EquipmentStatus)
  @Field(() => EquipmentStatus, { nullable: true })
  equipmentStatus?: EquipmentStatus;
}
@InputType()
export class EquipmentHistoryInquiry {
  @IsInt() @Min(1) @Field(() => Int) page!: number;
  @IsInt() @Min(1) @Max(100) @Field(() => Int) limit!: number;
}

@InputType()
export class EquipmentsInquiry extends EquipmentHistoryInquiry {
  @IsOptional()
  @IsIn(availableEquipmentSorts)
  @Field(() => String, { nullable: true })
  sort?: string;
  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;
  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => EquipmentSearch)
  @ValidateNested()
  @Field(() => EquipmentSearch, { nullable: true })
  search: EquipmentSearch = new EquipmentSearch();
}

@InputType()
export class AllEquipmentsInquiry extends EquipmentHistoryInquiry {
  @IsOptional()
  @IsIn(availableEquipmentSorts)
  @Field(() => String, { nullable: true })
  sort?: string;
  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;
  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllEquipmentSearch)
  @ValidateNested()
  @Field(() => AllEquipmentSearch, { nullable: true })
  search: AllEquipmentSearch = new AllEquipmentSearch();
}
