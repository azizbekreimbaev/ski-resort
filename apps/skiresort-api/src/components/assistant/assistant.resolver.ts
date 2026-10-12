import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { AssistantResponse } from '../../libs/dto/assistant/assistant';
import { AssistantInput } from '../../libs/dto/assistant/assistant.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AssistantService } from './assistant.service';

@Resolver()
export class AssistantResolver {
  constructor(private readonly assistantService: AssistantService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => AssistantResponse)
  public async askAssistant(
    @Args('input') input: AssistantInput,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<AssistantResponse> {
    return await this.assistantService.askAssistant(memberId, input);
  }
}
