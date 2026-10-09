import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import {
  shapeIntoMongoObjectId,
  validateMongoObjectId,
} from '../../libs/config';
import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';
import {
  AllEquipmentsInquiry,
  EquipmentHistoryInquiry,
  EquipmentInput,
  EquipmentsInquiry,
} from '../../libs/dto/equipment/equipment.input';
import { EquipmentUpdate } from '../../libs/dto/equipment/equipment.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { EquipmentService } from './equipment.service';

@Resolver()
export class EquipmentResolver {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Equipment)
  public createEquipment(
    @Args('input') input: EquipmentInput,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipment> {
    return this.equipmentService.createEquipment(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Equipment)
  public getEquipment(
    @Args('equipmentId') equipmentId: string,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Equipment> {
    return this.equipmentService.getEquipment(
      memberId,
      validateMongoObjectId(equipmentId),
    );
  }

  @UseGuards(WithoutGuard)
  @Query(() => Equipments)
  public getEquipments(
    @Args('input') input: EquipmentsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Equipments> {
    return this.equipmentService.getEquipments(memberId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Equipments)
  public getAllEquipmentsByAdmin(
    @Args('input') input: AllEquipmentsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Equipments> {
    return this.equipmentService.getAllEquipmentsByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Equipment)
  public updateEquipmentByAdmin(
    @Args('input') input: EquipmentUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Equipment> {
    input._id = shapeIntoMongoObjectId(input._id) as Types.ObjectId;
    return this.equipmentService.updateEquipmentByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Equipment)
  public removeEquipmentByAdmin(
    @Args('equipmentId') equipmentId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Equipment> {
    return this.equipmentService.removeEquipmentByAdmin(
      adminId,
      validateMongoObjectId(equipmentId),
    );
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Equipment)
  public likeTargetEquipment(
    @Args('equipmentId') equipmentId: string,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipment> {
    return this.equipmentService.likeTargetEquipment(
      memberId,
      validateMongoObjectId(equipmentId),
    );
  }

  @UseGuards(AuthGuard)
  @Query(() => Equipments)
  public getFavoriteEquipments(
    @Args('input') input: EquipmentHistoryInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipments> {
    return this.equipmentService.getFavoriteEquipments(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Equipments)
  public getVisitedEquipments(
    @Args('input') input: EquipmentsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipments> {
    return this.equipmentService.getVisitedEquipments(memberId, input);
  }
}
