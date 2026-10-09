import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { FaqStatus } from '../../enums/faq.enum';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class FaqUpdate {
  @IsMongoId()
  @Field(() => String)
  _id!: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  faqQuestion?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  faqAnswer?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(FaqStatus)
  @Field(() => FaqStatus, { nullable: true })
  faqStatus?: FaqStatus;
}
