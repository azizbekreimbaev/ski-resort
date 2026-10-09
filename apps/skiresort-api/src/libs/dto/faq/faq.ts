import { Field, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { FaqStatus } from '../../enums/faq.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Faq {
  @Field(() => String)
  _id!: Types.ObjectId;
  @Field(() => String)
  faqQuestion!: string;
  @Field(() => String)
  faqAnswer!: string;
  @Field(() => FaqStatus)
  faqStatus!: FaqStatus;
  @Field(() => String)
  memberId!: Types.ObjectId;
  @Field(() => Date)
  createdAt!: Date;
  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class Faqs {
  @Field(() => [Faq])
  list!: Faq[];
  @Field(() => [TotalCounter])
  metaCounter!: TotalCounter[];
}
