import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Model, Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { lstat, realpath, unlink } from 'fs/promises';
import { resolve, dirname, extname } from 'path';
import { Event, Events } from '../../libs/dto/event/event';
import {
  AllEventsInquiry,
  AllEventSearch,
  EventInput,
  EventUpdate,
  EventsInquiry,
} from '../../libs/dto/event/event.input';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { EventStatus } from '../../libs/enums/event.enum';
import { Direction } from '../../libs/enums/common.enum';
import { validateMongoObjectId } from '../../libs/config';
import { saveImageUpload } from '../../libs/image-upload';
import type { ImageUpload } from '../../libs/image-upload';
import { ResortService } from '../resort/resort.service';

const contentFields = [
  'eventTitle',
  'eventDesc',
  'eventImages',
  'eventStartDate',
  'eventEndDate',
  'eventStatus',
  'eventLocation',
  'resortId',
] as const;

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private readonly eventModel: Model<Event>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly resortService: ResortService,
  ) {}

  private async assertAdmin(adminId: Types.ObjectId): Promise<void> {
    const member = await this.memberModel
      .findOne({
        _id: adminId,
        memberType: MemberType.ADMIN,
        memberStatus: MemberStatus.ACTIVE,
      })
      .lean()
      .exec();
    if (!member) throw new ForbiddenException('Active ADMIN required');
  }

  private async content(input: EventInput | EventUpdate, update = false) {
    const dto = update
      ? plainToInstance(EventUpdate, input)
      : plainToInstance(EventInput, input);
    if (validateSync(dto).length)
      throw new BadRequestException('Invalid Event input');
    const values = Object.fromEntries(
      contentFields
        .filter((key) => dto[key] !== undefined)
        .map((key) => [key, dto[key]]),
    ) as Partial<Event>;
    if (values.eventImages) {
      const directory = resolve(process.cwd(), 'uploads/events');
      for (const path of values.eventImages) {
        if (!/^uploads\/events\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg)$/i.test(path))
          throw new BadRequestException('Invalid Event image path');
        try {
          const file = resolve(process.cwd(), path);
          const stat = await lstat(file);
          if (
            !stat.isFile() ||
            stat.isSymbolicLink() ||
            dirname(await realpath(file)) !== directory
          )
            throw new Error('Invalid file');
        } catch {
          throw new BadRequestException('Event image file does not exist');
        }
      }
    }
    if (dto.resortId) {
      values.resortId = validateMongoObjectId(dto.resortId);
      await this.resortService.assertVisibleResort(values.resortId);
    }
    return values;
  }

  private validateDates(start: unknown, end: unknown): void {
    if (
      !(start instanceof Date) ||
      !(end instanceof Date) ||
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end <= start
    )
      throw new BadRequestException('Event end must be after start');
  }

  async createEvent(
    adminId: Types.ObjectId,
    input: EventInput,
  ): Promise<Event> {
    await this.assertAdmin(adminId);
    const values = await this.content(input);
    this.validateDates(values.eventStartDate, values.eventEndDate);
    return (
      await this.eventModel.create({ ...values, memberId: adminId })
    ).toObject();
  }

  async updateEventByAdmin(
    adminId: Types.ObjectId,
    input: EventUpdate,
  ): Promise<Event> {
    await this.assertAdmin(adminId);
    const id = validateMongoObjectId(input._id);
    const values = await this.content(input, true);
    if (!Object.keys(values).length)
      throw new BadRequestException('No Event fields supplied');
    const filter: FilterQuery<Event> = { _id: id };
    if (
      values.eventStartDate !== undefined ||
      values.eventEndDate !== undefined
    ) {
      const current = await this.eventModel.findOne(filter).lean().exec();
      if (!current) throw new NotFoundException('Event not found');
      this.validateDates(
        values.eventStartDate ?? current.eventStartDate,
        values.eventEndDate ?? current.eventEndDate,
      );
      filter.eventStartDate = current.eventStartDate;
      filter.eventEndDate = current.eventEndDate;
    }
    const event = await this.eventModel
      .findOneAndUpdate(
        filter,
        { $set: values },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();
    if (!event) {
      if (filter.eventStartDate)
        throw new ConflictException(
          'Event changed or was removed; reload and retry',
        );
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async removeEventByAdmin(
    adminId: Types.ObjectId,
    eventId: string,
  ): Promise<Event> {
    await this.assertAdmin(adminId);
    const event = await this.eventModel
      .findOneAndDelete({ _id: validateMongoObjectId(eventId) })
      .lean()
      .exec();
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async getEvent(eventId: string): Promise<Event> {
    return this.detail(eventId, false);
  }

  async getEventByAdmin(
    adminId: Types.ObjectId,
    eventId: string,
  ): Promise<Event> {
    await this.assertAdmin(adminId);
    return this.detail(eventId, true);
  }

  private async detail(eventId: string, admin: boolean): Promise<Event> {
    const event = await this.eventModel
      .findOne({
        _id: validateMongoObjectId(eventId),
        ...(admin ? {} : { eventStatus: EventStatus.PUBLISHED }),
      })
      .lean()
      .exec();
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async getEvents(input: EventsInquiry): Promise<Events> {
    return this.list(input, false);
  }

  async getAllEventsByAdmin(
    adminId: Types.ObjectId,
    input: AllEventsInquiry,
  ): Promise<Events> {
    await this.assertAdmin(adminId);
    return this.list(input, true);
  }

  private async list(
    input: EventsInquiry | AllEventsInquiry,
    admin: boolean,
  ): Promise<Events> {
    const dto = admin
      ? plainToInstance(AllEventsInquiry, input)
      : plainToInstance(EventsInquiry, input);
    if (validateSync(dto).length)
      throw new BadRequestException('Invalid Event inquiry');
    const filter: FilterQuery<Event> = {};
    if (!admin) filter.eventStatus = EventStatus.PUBLISHED;
    else if (dto.search instanceof AllEventSearch && dto.search.eventStatus)
      filter.eventStatus = dto.search.eventStatus;
    if (dto.search?.resortId)
      filter.resortId = validateMongoObjectId(dto.search.resortId);
    if (dto.search?.text) {
      const text = dto.search.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['eventTitle', 'eventDesc'].map((field) => ({
        [field]: { $regex: text, $options: 'i' },
      }));
    }
    const direction = dto.direction ?? Direction.DESC;
    const [result] = await this.eventModel
      .aggregate<Events>([
        { $match: filter },
        { $sort: { [dto.sort ?? 'createdAt']: direction, _id: direction } },
        {
          $facet: {
            list: [
              { $skip: (dto.page - 1) * dto.limit },
              { $limit: dto.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    return result ?? { list: [], metaCounter: [] };
  }

  async uploadEventImages(
    adminId: Types.ObjectId,
    files: Promise<ImageUpload>[],
  ): Promise<string[]> {
    await this.assertAdmin(adminId);
    if (!Array.isArray(files) || files.length < 1 || files.length > 5)
      throw new BadRequestException('Supply 1–5 Event images');
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const image = await file;
        if (!/^\.(png|jpg|jpeg)$/i.test(extname(image.filename)))
          throw new BadRequestException(
            'Event images must have a PNG/JPEG extension',
          );
        return saveImageUpload(image, 'events');
      }),
    );
    const paths = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    );
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') {
      await Promise.all(
        paths.map((path) => unlink(resolve(process.cwd(), path))),
      );
      throw failure.reason;
    }
    return paths;
  }
}
