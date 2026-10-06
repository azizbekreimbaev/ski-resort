import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Direction } from '../../enums/common.enum';
import { EventStatus } from '../../enums/event.enum';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class EventInput {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  eventTitle!: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  eventDesc!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  @Field(() => [String])
  eventImages!: string[];
  @IsDate() @Field(() => Date) eventStartDate!: Date;
  @IsDate() @Field(() => Date) eventEndDate!: Date;
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EventStatus)
  @Field(() => EventStatus, { nullable: true, defaultValue: EventStatus.DRAFT })
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

@InputType()
export class EventUpdate extends PartialType(EventInput, {
  skipNullProperties: false,
}) {
  @IsMongoId() @Field(() => String) _id!: string;
  // Override the creation default: omission must not unpublish an Event.
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EventStatus)
  @Field(() => EventStatus, { nullable: true })
  eventStatus?: EventStatus;
}

@InputType()
export class EventSearch {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;
  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string;
}

@InputType()
export class AllEventSearch extends EventSearch {
  @IsOptional()
  @IsEnum(EventStatus)
  @Field(() => EventStatus, { nullable: true })
  eventStatus?: EventStatus;
}

@InputType({ isAbstract: true })
class EventPagination {
  @IsInt() @Min(1) @Field(() => Int) page!: number;
  @IsInt() @Min(1) @Max(100) @Field(() => Int) limit!: number;
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'eventStartDate'])
  @Field(() => String, { nullable: true })
  sort?: string;
  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;
}

@InputType()
export class EventsInquiry extends EventPagination {
  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => EventSearch)
  @ValidateNested()
  @Field(() => EventSearch, { nullable: true })
  search?: EventSearch;
}

@InputType()
export class AllEventsInquiry extends EventPagination {
  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllEventSearch)
  @ValidateNested()
  @Field(() => AllEventSearch, { nullable: true })
  search?: AllEventSearch;
}
