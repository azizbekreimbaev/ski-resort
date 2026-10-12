import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum AssistantSourceType {
  FAQ = 'FAQ',
  RESORT = 'RESORT',
  EQUIPMENT = 'EQUIPMENT',
  EVENT = 'EVENT',
}

registerEnumType(AssistantSourceType, { name: 'AssistantSourceType' });

@ObjectType()
export class AssistantSource {
  @Field(() => AssistantSourceType)
  type!: AssistantSourceType;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  title!: string;
}

@ObjectType()
export class AssistantResponse {
  @Field(() => String)
  answer!: string;

  @Field(() => [AssistantSource])
  sources!: AssistantSource[];
}
