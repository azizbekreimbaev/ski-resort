import { Field, InputType, Int } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
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
import { FaqStatus } from '../../enums/faq.enum';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class FaqInput {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  faqQuestion!: string;
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  faqAnswer!: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(FaqStatus)
  @Field(() => FaqStatus, { nullable: true, defaultValue: FaqStatus.DRAFT })
  faqStatus?: FaqStatus;
}

@InputType()
export class FaqSearch {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class AllFaqSearch extends FaqSearch {
  @IsOptional()
  @IsEnum(FaqStatus)
  @Field(() => FaqStatus, { nullable: true })
  faqStatus?: FaqStatus;
}

@InputType({ isAbstract: true })
class FaqPagination {
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
  @IsIn(['createdAt', 'updatedAt'])
  @Field(() => String, { nullable: true })
  sort?: string;
  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;
}

@InputType()
export class FaqsInquiry extends FaqPagination {
  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => FaqSearch)
  @ValidateNested()
  @Field(() => FaqSearch, { nullable: true })
  search?: FaqSearch;
}

@InputType()
export class AllFaqsInquiry extends FaqPagination {
  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllFaqSearch)
  @ValidateNested()
  @Field(() => AllFaqSearch, { nullable: true })
  search?: AllFaqSearch;
}
