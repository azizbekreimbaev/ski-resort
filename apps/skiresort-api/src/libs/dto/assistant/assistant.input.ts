import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export enum AssistantRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

registerEnumType(AssistantRole, { name: 'AssistantRole' });

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class AssistantHistoryInput {
  @IsEnum(AssistantRole)
  @Field(() => AssistantRole)
  role!: AssistantRole;

  @Transform(trim)
  @IsString()
  @Length(1, 2000)
  @Field(() => String)
  message!: string;
}

@InputType()
export class AssistantInput {
  @Transform(trim)
  @IsString()
  @Length(1, 2000)
  @Field(() => String)
  message!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @Type(() => AssistantHistoryInput)
  @ValidateNested({ each: true })
  @Field(() => [AssistantHistoryInput], { nullable: true })
  history?: AssistantHistoryInput[] | null;
}
