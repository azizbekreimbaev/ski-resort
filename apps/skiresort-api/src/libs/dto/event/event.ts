import { Field, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { EventStatus } from '../../enums/event.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Event {
  @Field(() => String)
  _id!: Types.ObjectId;
  @Field(() => String)
  eventTitle!: string;
  @Field(() => String)
  eventDesc!: string;
  @Field(() => [String])
  eventImages!: string[];
  @Field(() => Date)
  eventStartDate!: Date;
  @Field(() => Date)
  eventEndDate!: Date;
  @Field(() => EventStatus)
  eventStatus!: EventStatus;
  @Field(() => String, { nullable: true })
  eventLocation!: string | null;
  @Field(() => String, { nullable: true })
  resortId!: Types.ObjectId | null;
  @Field(() => String)
  memberId!: Types.ObjectId;
  @Field(() => Date)
  createdAt!: Date;
  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class Events {
  @Field(() => [Event])
  list!: Event[];
  @Field(() => [TotalCounter])
  metaCounter!: TotalCounter[];
}
