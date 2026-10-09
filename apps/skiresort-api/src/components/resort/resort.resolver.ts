import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import {
  shapeIntoMongoObjectId,
  validateMongoObjectId,
} from '../../libs/config';
import { Resort, Resorts } from '../../libs/dto/resort/resort';
import {
  AllResortsInquiry,
  ResortInput,
  ResortsInquiry,
} from '../../libs/dto/resort/resort.input';
import { ResortUpdate } from '../../libs/dto/resort/resort.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { ResortService } from './resort.service';

@Resolver()
export class ResortResolver {
  constructor(private readonly resortService: ResortService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Resort)
  public createResort(
    @Args('input') input: ResortInput,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resort> {
    return this.resortService.createResort(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Resort)
  public getResort(
    @Args('resortId') resortId: string,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Resort> {
    return this.resortService.getResort(
      memberId,
      validateMongoObjectId(resortId),
    );
  }

  @UseGuards(WithoutGuard)
  @Query(() => Resorts)
  public getResorts(
    @Args('input') input: ResortsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Resorts> {
    return this.resortService.getResorts(memberId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Resorts)
  public getAllResortsByAdmin(
    @Args('input') input: AllResortsInquiry,
  ): Promise<Resorts> {
    return this.resortService.getAllResortsByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Resort)
  public updateResortByAdmin(
    @Args('input') input: ResortUpdate,
  ): Promise<Resort> {
    input._id = shapeIntoMongoObjectId(input._id) as Types.ObjectId;
    return this.resortService.updateResortByAdmin(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Resort)
  public removeResortByAdmin(
    @Args('resortId') resortId: string,
  ): Promise<Resort> {
    return this.resortService.removeResortByAdmin(
      validateMongoObjectId(resortId),
    );
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Resort)
  public likeTargetResort(
    @Args('resortId') resortId: string,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resort> {
    return this.resortService.likeTargetResort(
      memberId,
      validateMongoObjectId(resortId),
    );
  }

  @UseGuards(AuthGuard)
  @Query(() => Resorts)
  public getFavoriteResorts(
    @Args('input') input: ResortsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resorts> {
    return this.resortService.getFavoriteResorts(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Resorts)
  public getVisitedResorts(
    @Args('input') input: ResortsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resorts> {
    return this.resortService.getVisitedResorts(memberId, input);
  }
}
