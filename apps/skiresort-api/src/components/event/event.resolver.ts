import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Types } from 'mongoose';
import { GraphQLUpload } from 'graphql-upload';
import type { ImageUpload } from '../../libs/image-upload';
import { Event, Events } from '../../libs/dto/event/event';
import {
  AllEventsInquiry,
  EventInput,
  EventUpdate,
  EventsInquiry,
} from '../../libs/dto/event/event.input';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EventService } from './event.service';

@Resolver()
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Query(() => Event)
  getEvent(@Args('eventId') eventId: string) {
    return this.eventService.getEvent(eventId);
  }

  @Query(() => Events)
  getEvents(@Args('input') input: EventsInquiry) {
    return this.eventService.getEvents(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  createEvent(
    @Args('input') input: EventInput,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.eventService.createEvent(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  updateEventByAdmin(
    @Args('input') input: EventUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.eventService.updateEventByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  removeEventByAdmin(
    @Args('eventId') eventId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.eventService.removeEventByAdmin(adminId, eventId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Event)
  getEventByAdmin(
    @Args('eventId') eventId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.eventService.getEventByAdmin(adminId, eventId);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Events)
  getAllEventsByAdmin(
    @Args('input') input: AllEventsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.eventService.getAllEventsByAdmin(adminId, input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => [String])
  uploadEventImages(
    // graphql-upload v13 exposes its scalar without usable ESLint type metadata.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<ImageUpload>[],
    @AuthMember('_id') adminId: Types.ObjectId,
  ) {
    return this.eventService.uploadEventImages(adminId, files);
  }
}
