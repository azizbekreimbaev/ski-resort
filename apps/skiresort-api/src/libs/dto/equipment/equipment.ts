import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import {
  EquipmentAudience,
  EquipmentCategory,
  EquipmentStatus,
} from '../../enums/equipment.enum';
import { MeLiked } from '../like/like';
import { TotalCounter } from '../member/member';
@ObjectType()
export class EquipmentRentalRate {
  @Field(() => Int)
  durationHours!: number;
  @Field(() => Float)
  price!: number;
}
@ObjectType()
export class Equipment {
  @Field(() => String)
  _id!: Types.ObjectId;
  @Field(() => String, { nullable: true })
  resortId?: Types.ObjectId | null;
  @Field(() => EquipmentStatus)
  equipmentStatus!: EquipmentStatus;
  @Field(() => EquipmentCategory)
  equipmentCategory!: EquipmentCategory;
  @Field(() => String)
  equipmentName!: string;
  @Field(() => String, { nullable: true })
  equipmentBrand?: string | null;
  @Field(() => String, { nullable: true })
  equipmentSize?: string | null;
  @Field(() => EquipmentAudience)
  equipmentAudience!: EquipmentAudience;
  @Field(() => [EquipmentRentalRate])
  equipmentRentalRates!: EquipmentRentalRate[];
  @Field(() => Boolean)
  equipmentPurchasable!: boolean;
  @Field(() => Float, { nullable: true })
  equipmentPurchasePrice?: number | null;
  @Field(() => Int)
  equipmentQuantity!: number;
  @Field(() => [String], { nullable: true })
  equipmentImages?: string[] | null;
  @Field(() => String, { nullable: true })
  equipmentDesc?: string | null;
  @Field(() => Int)
  equipmentViews!: number;
  @Field(() => Int)
  equipmentLikes!: number;
  @Field(() => Int)
  equipmentComments!: number;
  @Field(() => Date)
  createdAt!: Date;
  @Field(() => Date)
  updatedAt!: Date;
  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
  @Field(() => [MeLiked])
  meLiked: MeLiked[] = [];
}
@ObjectType()
export class Equipments {
  @Field(() => [Equipment])
  list!: Equipment[];
  @Field(() => [TotalCounter])
  metaCounter!: TotalCounter[];
}
