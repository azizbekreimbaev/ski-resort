import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { GraphQLUpload } from 'graphql-upload';
import type { ImageUpload } from '../../libs/image-upload';
import { Event, Events } from '../../libs/dto/event/event';
import {
  AllEventsInquiry,
  EventInput,
  EventsInquiry,
} from '../../libs/dto/event/event.input';
import { EventUpdate } from '../../libs/dto/event/event.update';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EventService } from './event.service';

@Resolver()
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Query(() => Event)
  public async getEvent(@Args('eventId') eventId: string): Promise<Event> {
    return await this.eventService.getEvent(eventId);
  }

  @Query(() => Events)
  public async getEvents(@Args('input') input: EventsInquiry): Promise<Events> {
    return await this.eventService.getEvents(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  public async createEvent(
    @Args('input') input: EventInput,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Event> {
    return await this.eventService.createEvent(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  public async updateEventByAdmin(
    @Args('input') input: EventUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Event> {
    return await this.eventService.updateEventByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  public async removeEventByAdmin(
    @Args('eventId') eventId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Event> {
    return await this.eventService.removeEventByAdmin(adminId, eventId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Event)
  public async getEventByAdmin(
    @Args('eventId') eventId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Event> {
    return await this.eventService.getEventByAdmin(adminId, eventId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Events)
  public async getAllEventsByAdmin(
    @Args('input') input: AllEventsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Events> {
    return await this.eventService.getAllEventsByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => [String])
  public async uploadEventImages(
    // graphql-upload v13 exposes its scalar without usable ESLint type metadata.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<ImageUpload>[],
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<string[]> {
    return await this.eventService.uploadEventImages(adminId, files);
  }
}
