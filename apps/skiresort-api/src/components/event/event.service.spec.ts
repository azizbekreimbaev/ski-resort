import 'reflect-metadata';
import { mkdtemp, mkdir, writeFile, rm, readdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { Model, Types } from 'mongoose';
import { EventService } from './event.service';
import { Event } from '../../libs/dto/event/event';
import { Member } from '../../libs/dto/member/member';
import { EventInput, EventUpdate } from '../../libs/dto/event/event.input';
import { ResortService } from '../resort/resort.service';
import { EventStatus } from '../../libs/enums/event.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import type { ImageUpload } from '../../libs/image-upload';

jest.mock('uuid', () => ({
  v4: () => `image-${Math.random().toString(36).slice(2)}`,
}));
const adminId = new Types.ObjectId();
const id = new Types.ObjectId();
const query = (value: unknown) => ({
  lean: () => ({ exec: () => Promise.resolve(value) }),
});

const makeModel = (input: EventInput) => ({
  create: jest.fn((values: Partial<Event>) =>
    Promise.resolve({ toObject: () => values }),
  ),
  findOne: jest.fn((_filter: unknown) => {
    void _filter;
    return query({ ...input, _id: id });
  }),
  findOneAndUpdate: jest.fn(
    (_filter: unknown, _update: unknown, _options: unknown) => {
      void _filter;
      void _update;
      void _options;
      return query({ ...input, _id: id });
    },
  ),
  findOneAndDelete: jest.fn((_filter: unknown) => {
    void _filter;
    return query({ ...input, _id: id });
  }),
  aggregate: jest.fn((_pipeline: unknown[]) => {
    void _pipeline;
    return {
      exec: () => Promise.resolve([{ list: [], metaCounter: [] }]),
    };
  }),
});

describe('Event service', () => {
  let root: string;
  let model: ReturnType<typeof makeModel>;
  let members: { findOne: jest.Mock<ReturnType<typeof query>, [unknown]> };
  let resort: { assertVisibleResort: jest.Mock };
  let service: EventService;
  let input: EventInput;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'skiresort-events-'));
    jest.spyOn(process, 'cwd').mockReturnValue(root);
    await mkdir(join(root, 'uploads/events'), { recursive: true });
    await writeFile(join(root, 'uploads/events/image.jpg'), 'fixture');
    input = {
      eventTitle: ' Event ',
      eventDesc: ' Description ',
      eventImages: ['uploads/events/image.jpg'],
      eventStartDate: new Date('2020-01-01'),
      eventEndDate: new Date('2020-01-02'),
    };
    model = makeModel(input);
    members = {
      findOne: jest.fn((filter: unknown) => {
        void filter;
        return query({ _id: adminId });
      }),
    };
    resort = { assertVisibleResort: jest.fn() };
    service = new EventService(
      model as unknown as Model<Event>,
      members as unknown as Model<Member>,
      resort as unknown as ResortService,
    );
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it('checks current admin, trims content and derives creator, accepting past dates', async () => {
    await service.createEvent(adminId, {
      ...input,
      memberId: new Types.ObjectId(),
    } as EventInput);
    expect(members.findOne).toHaveBeenCalledWith({
      _id: adminId,
      memberType: MemberType.ADMIN,
      memberStatus: MemberStatus.ACTIVE,
    });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventTitle: 'Event',
        eventDesc: 'Description',
        memberId: adminId,
      }),
    );
  });
  it.each(['create', 'update', 'remove', 'detail', 'list', 'upload'])(
    'rejects stale or inactive admin for %s',
    async (operation) => {
      members.findOne.mockReturnValue(query(null));
      const requests = {
        create: () => service.createEvent(adminId, input),
        update: () =>
          service.updateEventByAdmin(adminId, {
            _id: id.toString(),
            eventTitle: 'edit',
          }),
        remove: () => service.removeEventByAdmin(adminId, id.toString()),
        detail: () => service.getEventByAdmin(adminId, id.toString()),
        list: () =>
          service.getAllEventsByAdmin(adminId, { page: 1, limit: 10 }),
        upload: () => service.uploadEventImages(adminId, []),
      };
      await expect(
        requests[operation as keyof typeof requests](),
      ).rejects.toThrow('Active ADMIN');
    },
  );
  it.each([0, 6])('rejects %i image paths', async (count) => {
    await expect(
      service.createEvent(adminId, {
        ...input,
        eventImages: Array.from(
          { length: count },
          (_, i) => `uploads/events/${i}.jpg`,
        ),
      }),
    ).rejects.toThrow();
  });
  it.each([
    '../image.jpg',
    'uploads/resort/image.jpg',
    'uploads/events/missing.jpg',
  ])('rejects image %s', async (path) => {
    await expect(
      service.createEvent(adminId, { ...input, eventImages: [path] }),
    ).rejects.toThrow();
  });
  it('rejects duplicate images and null required fields', async () => {
    await expect(
      service.createEvent(adminId, {
        ...input,
        eventImages: [input.eventImages[0], input.eventImages[0]],
      }),
    ).rejects.toThrow();
    await expect(
      service.updateEventByAdmin(adminId, {
        _id: id.toString(),
        eventTitle: null,
      } as unknown as EventUpdate),
    ).rejects.toThrow();
  });
  it.each([
    new Date('2019-01-01'),
    new Date('2020-01-01'),
    new Date('invalid'),
  ])('rejects invalid end %s', async (end) => {
    await expect(
      service.createEvent(adminId, { ...input, eventEndDate: end }),
    ).rejects.toThrow();
  });
  it('validates optional resort and allows clearing nullable fields', async () => {
    await service.createEvent(adminId, { ...input, resortId: id.toString() });
    expect(resort.assertVisibleResort).toHaveBeenCalledWith(id);
    await service.updateEventByAdmin(adminId, {
      _id: id.toString(),
      resortId: null,
      eventLocation: null,
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { resortId: null, eventLocation: null },
    });
  });
  it('propagates invalid Resort associations', async () => {
    resort.assertVisibleResort.mockRejectedValue(new Error('Resort not found'));
    await expect(
      service.createEvent(adminId, { ...input, resortId: id.toString() }),
    ).rejects.toThrow('Resort not found');
  });
  it('conditionally updates dates and reports a competing update', async () => {
    model.findOneAndUpdate.mockReturnValue(query(null));
    await expect(
      service.updateEventByAdmin(adminId, {
        _id: id.toString(),
        eventEndDate: new Date('2020-01-03'),
      }),
    ).rejects.toThrow('reload and retry');
    expect(model.findOneAndUpdate.mock.calls[0][0]).toEqual({
      _id: id,
      eventStartDate: input.eventStartDate,
      eventEndDate: input.eventEndDate,
    });
  });
  it('rejects partial invalid schedule and empty updates', async () => {
    await expect(
      service.updateEventByAdmin(adminId, {
        _id: id.toString(),
        eventStartDate: new Date('2020-01-03'),
      }),
    ).rejects.toThrow('after start');
    await expect(
      service.updateEventByAdmin(adminId, { _id: id.toString() }),
    ).rejects.toThrow('No Event fields');
  });
  it('updates only supplied fields without resetting status or creator', async () => {
    await service.updateEventByAdmin(adminId, {
      _id: id.toString(),
      eventTitle: ' edit ',
      memberId: id,
    } as unknown as EventUpdate);
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { eventTitle: 'edit' },
    });
  });
  it('restricts public detail to published and allows admin drafts', async () => {
    await service.getEvent(id.toString());
    expect(model.findOne).toHaveBeenLastCalledWith({
      _id: id,
      eventStatus: EventStatus.PUBLISHED,
    });
    await service.getEventByAdmin(adminId, id.toString());
    expect(model.findOne).toHaveBeenLastCalledWith({ _id: id });
  });
  it('returns removed Event and retains its images', async () => {
    expect(
      await service.removeEventByAdmin(adminId, id.toString()),
    ).toMatchObject({ _id: id });
    expect(await readdir(join(root, 'uploads/events'))).toEqual(['image.jpg']);
  });
  it('reports missing records and invalid IDs', async () => {
    model.findOne.mockReturnValue(query(null));
    model.findOneAndDelete.mockReturnValue(query(null));
    model.findOneAndUpdate.mockReturnValue(query(null));
    await expect(service.getEvent(id.toString())).rejects.toThrow('not found');
    await expect(
      service.removeEventByAdmin(adminId, id.toString()),
    ).rejects.toThrow('not found');
    await expect(
      service.updateEventByAdmin(adminId, {
        _id: id.toString(),
        eventTitle: 'edit',
      }),
    ).rejects.toThrow('not found');
    await expect(service.getEvent('invalid')).rejects.toThrow();
  });
  it('filters and paginates published Events without expiring past ones', async () => {
    expect(
      await service.getEvents({
        page: 2,
        limit: 5,
        search: { text: 'a.b', resortId: id.toString() },
      }),
    ).toEqual({ list: [], metaCounter: [] });
    const pipeline = model.aggregate.mock.calls[0][0] as [
      { $match: { $or: { eventTitle: { $regex: string } }[] } },
      unknown,
      { $facet: { list: unknown[] } },
    ];
    expect(pipeline[0].$match).toMatchObject({
      eventStatus: EventStatus.PUBLISHED,
      resortId: id,
    });
    expect(pipeline[0].$match.$or[0].eventTitle.$regex).toBe('a\\.b');
    expect(pipeline[1]).toEqual({ $sort: { createdAt: -1, _id: -1 } });
    expect(pipeline[2].$facet.list).toEqual([{ $skip: 5 }, { $limit: 5 }]);
  });
  it('supports admin status filters', async () => {
    await service.getAllEventsByAdmin(adminId, {
      page: 1,
      limit: 10,
      search: { eventStatus: EventStatus.DRAFT },
    });
    expect(model.aggregate.mock.calls[0][0][0]).toEqual({
      $match: { eventStatus: EventStatus.DRAFT },
    });
  });
  it.each([
    { page: 0, limit: 10 },
    { page: 1, limit: 101 },
    { page: 1, limit: 0 },
    { page: 1, limit: 10, sort: 'memberPassword' },
  ])('rejects inquiry %j', async (inquiry) => {
    await expect(service.getEvents(inquiry)).rejects.toThrow(
      'Invalid Event inquiry',
    );
  });

  const upload = (mimetype = 'image/jpeg'): Promise<ImageUpload> =>
    Promise.resolve({
      filename: 'fixture.jpg',
      mimetype,
      createReadStream: () => Readable.from(['fixture']),
    });
  it.each([1, 5])('uploads %i images', async (count) => {
    const paths = await service.uploadEventImages(
      adminId,
      Array.from({ length: count }, () => upload()),
    );
    expect(paths).toHaveLength(count);
    expect(new Set(paths).size).toBe(count);
  });
  it.each([0, 6])('rejects %i uploads', async (count) => {
    await expect(
      service.uploadEventImages(
        adminId,
        Array.from({ length: count }, () => upload()),
      ),
    ).rejects.toThrow('1–5');
  });
  it('cleans successful files when another upload fails', async () => {
    await expect(
      service.uploadEventImages(adminId, [upload(), upload('text/plain')]),
    ).rejects.toThrow();
    expect(await readdir(join(root, 'uploads/events'))).toEqual(['image.jpg']);
  });

  it('rejects extensions that would produce unusable Event image paths', async () => {
    const image = await upload();
    await expect(
      service.uploadEventImages(adminId, [
        upload(),
        Promise.resolve({ ...image, filename: 'image.exe' }),
      ]),
    ).rejects.toThrow('extension');
    expect(await readdir(join(root, 'uploads/events'))).toEqual(['image.jpg']);
  });
  it('cleans partial streams and other successful files', async () => {
    const broken = Promise.resolve({
      filename: 'bad.jpg',
      mimetype: 'image/jpeg',
      createReadStream: () =>
        Readable.from(
          (function* () {
            yield 'partial';
            throw new Error('stream failed');
          })(),
        ),
    });
    await expect(
      service.uploadEventImages(adminId, [upload(), broken]),
    ).rejects.toThrow('stream failed');
    expect(await readdir(join(root, 'uploads/events'))).toEqual(['image.jpg']);
  });
});
