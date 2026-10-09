import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { validateMongoObjectId } from '../../libs/config';
import {
  InstructorApplication,
  InstructorApplications,
} from '../../libs/dto/instructor-application/instructor-application';
import {
  InstructorApplicationInput,
  InstructorApplicationReject,
  InstructorApplicationsInquiry,
} from '../../libs/dto/instructor-application/instructor-application.input';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InstructorApplicationService } from './instructor-application.service';

@Resolver()
export class InstructorApplicationResolver {
  constructor(
    private readonly applicationService: InstructorApplicationService,
  ) {}

  @Roles(MemberType.USER)
  @UseGuards(RolesGuard)
  @Mutation(() => InstructorApplication)
  public createInstructorApplication(
    @Args('input') input: InstructorApplicationInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<InstructorApplication> {
    return this.applicationService.createInstructorApplication(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => InstructorApplication, { nullable: true })
  public getMyInstructorApplication(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<InstructorApplication | null> {
    return this.applicationService.getMyInstructorApplication(memberId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => InstructorApplications)
  public getAllInstructorApplicationsByAdmin(
    @Args('input') input: InstructorApplicationsInquiry,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplications> {
    return this.applicationService.getAllInstructorApplicationsByAdmin(
      adminId,
      input,
    );
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => InstructorApplication)
  public getInstructorApplicationByAdmin(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplication> {
    return this.applicationService.getInstructorApplicationByAdmin(
      adminId,
      validateMongoObjectId(applicationId),
    );
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => InstructorApplication)
  public approveInstructorApplicationByAdmin(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplication> {
    return this.applicationService.approveInstructorApplicationByAdmin(
      adminId,
      validateMongoObjectId(applicationId),
    );
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => InstructorApplication)
  public rejectInstructorApplicationByAdmin(
    @Args('input') input: InstructorApplicationReject,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplication> {
    return this.applicationService.rejectInstructorApplicationByAdmin(
      adminId,
      input,
    );
  }
}
