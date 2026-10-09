import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EventStatus } from '../../enums/event.enum';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class EventUpdate {
  @IsMongoId()
  @Field(() => String)
  _id!: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  eventTitle?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  eventDesc?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  eventImages?: string[];

  @ValidateIf((_object, value) => value !== undefined)
  @IsDate()
  @Field(() => Date, { nullable: true })
  eventStartDate?: Date;

  @ValidateIf((_object, value) => value !== undefined)
  @IsDate()
  @Field(() => Date, { nullable: true })
  eventEndDate?: Date;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EventStatus)
  @Field(() => EventStatus, { nullable: true })
  eventStatus?: EventStatus;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  eventLocation?: string | null;

  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string | null;
}
