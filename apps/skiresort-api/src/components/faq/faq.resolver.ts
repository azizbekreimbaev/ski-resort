import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import {
  AllFaqsInquiry,
  FaqInput,
  FaqUpdate,
  FaqsInquiry,
} from '../../libs/dto/faq/faq.input';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FaqService } from './faq.service';

@Resolver()
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @Query(() => Faq)
  getFaq(@Args('faqId') faqId: string) {
    return this.faqService.getFaq(faqId);
  }

  @Query(() => Faqs)
  getFaqs(@Args('input') input: FaqsInquiry) {
    return this.faqService.getFaqs(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  createFaq(
    @Args('input') input: FaqInput,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.faqService.createFaq(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  updateFaqByAdmin(
    @Args('input') input: FaqUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.faqService.updateFaqByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  removeFaqByAdmin(
    @Args('faqId') faqId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.faqService.removeFaqByAdmin(adminId, faqId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Faq)
  getFaqByAdmin(
    @Args('faqId') faqId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.faqService.getFaqByAdmin(adminId, faqId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Faqs)
  getAllFaqsByAdmin(
    @Args('input') input: AllFaqsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.faqService.getAllFaqsByAdmin(adminId, input);
  }
}
