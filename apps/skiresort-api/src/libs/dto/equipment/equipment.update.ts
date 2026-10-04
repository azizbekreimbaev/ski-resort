import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
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
import type { Types } from 'mongoose';
import { EquipmentRentalRateInput } from './equipment.input';
const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class EquipmentUpdate {
  @IsMongoId() @Field(() => String) _id!: string | Types.ObjectId;
  
  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentStatus)
  @Field(() => EquipmentStatus, { nullable: true })
  equipmentStatus?: EquipmentStatus;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentCategory)
  @Field(() => EquipmentCategory, { nullable: true })
  equipmentCategory?: EquipmentCategory;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentName?: string;

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
  @Field(() => EquipmentAudience, { nullable: true })
  equipmentAudience?: EquipmentAudience;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => EquipmentRentalRateInput)
  @ValidateNested({ each: true })
  @Field(() => [EquipmentRentalRateInput], { nullable: true })
  equipmentRentalRates?: EquipmentRentalRateInput[];

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  equipmentPurchasable?: boolean;

  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  equipmentPurchasePrice?: number | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  @Field(() => Int, { nullable: true })
  equipmentQuantity?: number;

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
