import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import {
  AllFaqsInquiry,
  FaqInput,
  FaqsInquiry,
} from '../../libs/dto/faq/faq.input';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FaqService } from './faq.service';

@Resolver()
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @Query(() => Faq)
  public async getFaq(@Args('faqId') faqId: string): Promise<Faq> {
    return await this.faqService.getFaq(faqId);
  }

  @Query(() => Faqs)
  public async getFaqs(@Args('input') input: FaqsInquiry): Promise<Faqs> {
    return await this.faqService.getFaqs(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  public async createFaq(
    @Args('input') input: FaqInput,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Faq> {
    return await this.faqService.createFaq(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  public async updateFaqByAdmin(
    @Args('input') input: FaqUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Faq> {
    return await this.faqService.updateFaqByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  public async removeFaqByAdmin(
    @Args('faqId') faqId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Faq> {
    return await this.faqService.removeFaqByAdmin(adminId, faqId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Faq)
  public async getFaqByAdmin(
    @Args('faqId') faqId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Faq> {
    return await this.faqService.getFaqByAdmin(adminId, faqId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Faqs)
  public async getAllFaqsByAdmin(
    @Args('input') input: AllFaqsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Faqs> {
    return await this.faqService.getAllFaqsByAdmin(adminId, input);
  }
}
