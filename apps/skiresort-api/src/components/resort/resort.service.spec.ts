import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ResortService } from './resort.service';
import { Resort } from '../../libs/dto/resort/resort';
import {
  ResortInput,
  ResortsInquiry,
} from '../../libs/dto/resort/resort.input';
import { ResortUpdate } from '../../libs/dto/resort/resort.update';
import {
  ResortFacilities,
  ResortLevel,
  ResortLocation,
  ResortStatus,
} from '../../libs/enums/resort.enum';
import { Direction } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeService } from '../like/like.service';
import { ViewService } from '../view/view.service';

// UUID image naming is unrelated to these service tests; installed UUID is ESM.
jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

const query = <T>(value: T) => ({
  lean: jest.fn<any, unknown[]>().mockReturnThis(),
  collation: jest.fn<any, unknown[]>().mockReturnThis(),
  exec: jest.fn<any, unknown[]>().mockResolvedValue(value),
});

describe('ResortService', () => {
  const resortId = new Types.ObjectId();
  const adminId = new Types.ObjectId();
  let model: {
    exists: jest.Mock<any, [Record<string, unknown>]>;
    create: jest.Mock<any, [Record<string, unknown>]>;
    aggregate: jest.Mock<any, [unknown[]]>;
    findOne: jest.Mock<any, unknown[]>;
    findById: jest.Mock<any, unknown[]>;
    findOneAndDelete: jest.Mock<any, unknown[]>;
    findOneAndUpdate: jest.Mock<
      any,
      [
        Record<string, unknown>,
        Record<string, unknown>,
        Record<string, unknown>,
      ]
    >;
  };
  let likes: {
    toggleLikeWithChange: jest.Mock<any, unknown[]>;
    checkLikeExistence: jest.Mock<any, unknown[]>;
    getFavoriteResorts: jest.Mock<any, unknown[]>;
  };
  let views: {
    recordViewWithChange: jest.Mock<any, unknown[]>;
    getVisitedResorts: jest.Mock<any, unknown[]>;
  };
  let service: ResortService;
  let resort: Resort;

  beforeEach(() => {
    resort = {
      _id: resortId,
      memberId: adminId,
      resortStatus: ResortStatus.SOLD_OUT,
      resortTitle: 'Snow [Peak]',
      resortLocation: ResortLocation.PYEONGCHANG,
      resortAddress: 'Mountain road',
      resortPricePerDay: 50.5,
      resortMinDays: 2,
      resortImages: [],
      resortLikes: 0,
      resortViews: 0,
      resortComments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    model = {
      exists: jest
        .fn<any, [Record<string, unknown>]>()
        .mockReturnValue(query(null)),
      create: jest
        .fn<any, [Record<string, unknown>]>()
        .mockImplementation((data) =>
          Promise.resolve({ toObject: () => data }),
        ),
      aggregate: jest.fn<any, [unknown[]]>().mockReturnValue(query([resort])),
      findOne: jest.fn<any, unknown[]>().mockReturnValue(query(resort)),
      findById: jest.fn<any, unknown[]>().mockReturnValue(query(resort)),
      findOneAndDelete: jest
        .fn<any, unknown[]>()
        .mockReturnValue(query(resort)),
      findOneAndUpdate: jest
        .fn<
          any,
          [
            Record<string, unknown>,
            Record<string, unknown>,
            Record<string, unknown>,
          ]
        >()
        .mockReturnValue(query(resort)),
    };
    likes = {
      toggleLikeWithChange: jest.fn<any, unknown[]>(),
      checkLikeExistence: jest.fn<any, unknown[]>().mockResolvedValue([]),
      getFavoriteResorts: jest.fn<any, unknown[]>(),
    };
    views = {
      recordViewWithChange: jest
        .fn<any, unknown[]>()
        .mockResolvedValue({ record: null, undo: jest.fn<any, unknown[]>() }),
      getVisitedResorts: jest.fn<any, unknown[]>(),
    };
    service = new ResortService(
      model as unknown as Model<Resort>,
      likes as unknown as LikeService,
      views as unknown as ViewService,
    );
  });

  it('assigns ownership and defaults without accepting client counters or Property fields', async () => {
    const input = {
      resortTitle: 'Snow',
      resortLocation: ResortLocation.PYEONGCHANG,
      resortAddress: 'Mountain road',
      resortPricePerDay: 0,
      resortImages: [],
      memberId: new Types.ObjectId(),
      resortStatus: ResortStatus.DELETE,
      resortViews: 99,
      propertyRooms: 4,
    } as unknown as ResortInput;
    const result = await service.createResort(adminId, input);
    expect(result).toMatchObject({
      memberId: adminId,
      resortStatus: ResortStatus.ACTIVE,
      resortMinDays: 1,
      resortViews: 0,
      resortLikes: 0,
      resortComments: 0,
    });
    expect(result).not.toHaveProperty('propertyRooms');
  });

  it.each([ResortStatus.ACTIVE, ResortStatus.SOLD_OUT, ResortStatus.DELETE])(
    'rejects the same resort even when the existing record is %s or belongs to another admin',
    async (status) => {
      model.exists.mockReturnValue(
        query({ _id: resortId, resortStatus: status }),
      );
      await expect(
        service.createResort(new Types.ObjectId(), {
          resortTitle: resort.resortTitle,
          resortLocation: resort.resortLocation,
          resortAddress: resort.resortAddress,
          resortPricePerDay: 999,
          resortMinDays: 2,
          resortImages: ['new-image.jpg'],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(model.create).not.toHaveBeenCalled();
      expect(model.exists).toHaveBeenCalledWith({
        resortTitle: resort.resortTitle,
        resortLocation: resort.resortLocation,
        resortAddress: resort.resortAddress,
        resortLevel: null,
      });
    },
  );

  it('checks trimmed identity with case-insensitive collation and persists the trimmed values', async () => {
    const existenceQuery = query(null);
    model.exists.mockReturnValue(existenceQuery);
    await service.createResort(adminId, {
      resortTitle: '  Snow Resort  ',
      resortLocation: ResortLocation.PYEONGCHANG,
      resortAddress: '  Mountain ROAD  ',
      resortPricePerDay: 50,
      resortMinDays: 2,
      resortImages: [],
    });
    expect(model.exists).toHaveBeenCalledWith({
      resortTitle: 'Snow Resort',
      resortLocation: ResortLocation.PYEONGCHANG,
      resortAddress: 'Mountain ROAD',
      resortLevel: null,
    });
    expect(existenceQuery.collation).toHaveBeenCalledWith({
      locale: 'en',
      strength: 2,
    });
    expect(model.create.mock.calls[0][0]).toMatchObject({
      resortTitle: 'Snow Resort',
      resortAddress: 'Mountain ROAD',
    });
  });

  it('returns a clear conflict when a concurrent create hits the unique index', async () => {
    model.create.mockRejectedValue({ code: 11000 });
    await expect(
      service.createResort(adminId, {
        resortTitle: resort.resortTitle,
        resortLocation: resort.resortLocation,
        resortAddress: resort.resortAddress,
        resortPricePerDay: 50,
        resortMinDays: 2,
        resortImages: [],
      }),
    ).rejects.toThrow(
      'A resort with this title, location, address and level already exists',
    );
  });

  it.each([
    ResortLevel.BEGINNER,
    ResortLevel.INTERMEDIATE,
    ResortLevel.ADVANCED,
    ResortLevel.MIXED,
  ])(
    'includes %s in duplicate matching and persisted identity',
    async (level) => {
      model.exists.mockImplementation((identity) =>
        query(
          identity.resortLevel === ResortLevel.BEGINNER
            ? { _id: resortId }
            : null,
        ),
      );
      const input: ResortInput = {
        resortTitle: resort.resortTitle,
        resortLocation: resort.resortLocation,
        resortAddress: resort.resortAddress,
        resortLevel: level,
        resortPricePerDay: 50,
        resortMinDays: 2,
        resortImages: [],
      };
      if (level === ResortLevel.BEGINNER) {
        await expect(
          service.createResort(adminId, input),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(model.create).not.toHaveBeenCalled();
      } else {
        expect(await service.createResort(adminId, input)).toMatchObject({
          resortLevel: level,
        });
      }
      expect(model.exists).toHaveBeenCalledWith({
        resortTitle: resort.resortTitle,
        resortLocation: resort.resortLocation,
        resortAddress: resort.resortAddress,
        resortLevel: level,
      });
    },
  );

  it.each([undefined, null])(
    'matches an existing unspecified level for input level %s',
    async (level) => {
      model.exists.mockImplementation((identity) =>
        query(identity.resortLevel === null ? { _id: resortId } : null),
      );
      await expect(
        service.createResort(adminId, {
          resortTitle: resort.resortTitle,
          resortLocation: resort.resortLocation,
          resortAddress: resort.resortAddress,
          resortLevel: level,
          resortPricePerDay: 50,
          resortMinDays: 2,
          resortImages: [],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(model.create).not.toHaveBeenCalled();
    },
  );

  it('preserves unrelated persistence failures', async () => {
    const failure = new Error('database unavailable');
    model.create.mockRejectedValue(failure);
    await expect(
      service.createResort(adminId, {
        resortTitle: resort.resortTitle,
        resortLocation: resort.resortLocation,
        resortAddress: resort.resortAddress,
        resortPricePerDay: 50,
        resortMinDays: 2,
        resortImages: [],
      }),
    ).rejects.toBe(failure);
  });

  it('returns the same conflict when an update hits another resort identity', async () => {
    const updateQuery = query(null);
    updateQuery.exec.mockRejectedValue({ code: 11000 });
    model.findOneAndUpdate.mockReturnValue(updateQuery);
    await expect(
      service.updateResortByAdmin({
        _id: resortId.toHexString(),
        resortTitle: 'Another existing resort',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns sold-out details without recording anonymous views', async () => {
    const result = await service.getResort(null, resortId);
    expect(result.resortStatus).toBe(ResortStatus.SOLD_OUT);
    expect(views.recordViewWithChange).not.toHaveBeenCalled();
    const pipeline = model.aggregate.mock.calls[0][0] as [
      { $match: { resortStatus: { $in: ResortStatus[] } } },
      {
        $lookup: {
          pipeline: [unknown, { $project: { memberPassword: number } }];
        };
      },
      ...unknown[],
    ];
    expect(pipeline[0].$match.resortStatus.$in).toEqual([
      ResortStatus.ACTIVE,
      ResortStatus.SOLD_OUT,
    ]);
    expect(pipeline).toContainEqual({
      $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true },
    });
    expect(pipeline[1].$lookup.pipeline[1].$project.memberPassword).toBe(0);
  });

  it('rejects an unavailable detail without recording interactions', async () => {
    model.aggregate.mockReturnValue(query([]));
    await expect(service.getResort(adminId, resortId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(views.recordViewWithChange).not.toHaveBeenCalled();
  });

  it('does not increment counters for an existing authenticated view', async () => {
    await service.getResort(adminId, resortId);
    expect(views.recordViewWithChange).toHaveBeenCalledWith({
      memberId: adminId,
      viewRefId: resortId,
      viewGroup: ViewGroup.RESORT,
    });
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    expect(likes.checkLikeExistence).toHaveBeenCalledWith({
      memberId: adminId,
      likeRefId: resortId,
      likeGroup: LikeGroup.RESORT,
    });
  });

  it('uses the stored counter after a newly recorded view', async () => {
    views.recordViewWithChange.mockResolvedValue({
      record: { _id: new Types.ObjectId() },
      undo: jest.fn<any, unknown[]>(),
    });
    model.findOneAndUpdate.mockReturnValue(
      query({ ...resort, resortViews: 8 }),
    );
    const result = await service.getResort(adminId, resortId);
    expect(result.resortViews).toBe(8);
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $inc: { resortViews: 1 },
    });
  });

  it('removes a newly created view when its counter write fails', async () => {
    const failure = new Error('counter failed');
    const undo = jest.fn<any, unknown[]>().mockResolvedValue(undefined);
    views.recordViewWithChange.mockResolvedValue({
      record: { _id: new Types.ObjectId() },
      undo,
    });
    jest.spyOn(service, 'resortStatsEditor').mockRejectedValue(failure);
    await expect(service.getResort(adminId, resortId)).rejects.toBe(failure);
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('reports compensation failure while preserving the original counter error', async () => {
    const failure = new Error('counter failed');
    views.recordViewWithChange.mockResolvedValue({
      record: { _id: new Types.ObjectId() },
      undo: jest
        .fn<any, unknown[]>()
        .mockRejectedValue(new Error('rollback failed')),
    });
    jest.spyOn(service, 'resortStatsEditor').mockRejectedValue(failure);
    const log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    await expect(service.getResort(adminId, resortId)).rejects.toBe(failure);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('compensation failed'),
    );
    log.mockRestore();
  });

  it('updates the like counter only for an actual changed record', async () => {
    likes.toggleLikeWithChange.mockResolvedValue({
      modifier: 0,
      undo: jest.fn<any, unknown[]>(),
    });
    await service.likeTargetResort(adminId, resortId);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    likes.toggleLikeWithChange.mockResolvedValue({
      modifier: 1,
      undo: jest.fn<any, unknown[]>(),
    });
    await service.likeTargetResort(adminId, resortId);
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $inc: { resortLikes: 1 },
    });
  });

  it('compensates unlike when its decrement fails', async () => {
    const undo = jest.fn<any, unknown[]>().mockResolvedValue(undefined);
    const failure = new Error('counter failed');
    likes.toggleLikeWithChange.mockResolvedValue({ modifier: -1, undo });
    jest.spyOn(service, 'resortStatsEditor').mockRejectedValue(failure);
    await expect(service.likeTargetResort(adminId, resortId)).rejects.toBe(
      failure,
    );
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('rejects likes for missing/deleted resorts before mutating them', async () => {
    model.findOne.mockReturnValue(query(null));
    await expect(
      service.likeTargetResort(adminId, resortId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(likes.toggleLikeWithChange).not.toHaveBeenCalled();
  });

  it('filters and counts visible resorts using escaped text and stable pagination', async () => {
    model.aggregate.mockReturnValue(
      query([{ list: [resort], metaCounter: [{ total: 1 }] }]),
    );
    const result = await service.getResorts(null, {
      page: 2,
      limit: 10,
      search: {
        text: 'Snow [Peak]',
        memberId: adminId.toString(),
        locationList: [ResortLocation.PYEONGCHANG],
        facilities: [ResortFacilities.PARKING, ResortFacilities.SKI_LIFT],
        pricesRange: { start: 0.5, end: 100.5 },
      },
    });
    expect(result.metaCounter).toEqual([{ total: 1 }]);
    const pipeline = model.aggregate.mock.calls[0][0] as [
      { $match: Record<string, unknown> },
      { $sort: Record<string, unknown> },
      { $facet: { list: unknown[] } },
    ];
    expect(pipeline[0].$match).toMatchObject({
      resortStatus: { $in: [ResortStatus.ACTIVE, ResortStatus.SOLD_OUT] },
      resortTitle: { $regex: 'Snow \\[Peak\\]', $options: 'i' },
      memberId: adminId,
      resortLocation: { $in: [ResortLocation.PYEONGCHANG] },
      resortFacilities: {
        $all: [ResortFacilities.PARKING, ResortFacilities.SKI_LIFT],
      },
      resortPricePerDay: { $gte: 0.5, $lte: 100.5 },
    });
    expect(pipeline[1].$sort).toEqual({
      createdAt: Direction.DESC,
      _id: Direction.DESC,
    });
    expect(pipeline[2].$facet.list[0]).toEqual({ $skip: 10 });
  });

  it('returns a valid empty list when no resorts match', async () => {
    model.aggregate.mockReturnValue(query([{ list: [], metaCounter: [] }]));
    await expect(
      service.getResorts(null, { page: 1, limit: 10 } as ResortsInquiry),
    ).resolves.toEqual({ list: [], metaCounter: [] });
  });

  it('rejects invalid pagination, sorting and reversed price ranges before querying', async () => {
    await expect(
      service.getResorts(null, { page: 1, limit: 101 } as ResortsInquiry),
    ).rejects.toThrow('pagination');
    await expect(
      service.getResorts(null, {
        page: 1,
        limit: 10,
        sort: 'propertyRank',
      } as ResortsInquiry),
    ).rejects.toThrow('sort');
    expect(() =>
      service.getResorts(null, {
        page: 1,
        limit: 10,
        search: { pricesRange: { start: 10, end: 5 } },
      }),
    ).toThrow('Price range');
    expect(model.aggregate).not.toHaveBeenCalled();
  });

  it('allows admin filtering to deleted status', async () => {
    model.aggregate.mockReturnValue(query([{ list: [], metaCounter: [] }]));
    await service.getAllResortsByAdmin({
      page: 1,
      limit: 10,
      search: { resortStatus: ResortStatus.DELETE },
    });
    const pipeline = model.aggregate.mock.calls[0][0] as [
      { $match: Record<string, unknown> },
      ...unknown[],
    ];
    expect(pipeline[0].$match.resortStatus).toBe(ResortStatus.DELETE);
  });

  it('permanently removes the resort with a separate delete operation', async () => {
    expect(await service.removeResortByAdmin(resortId)).toBe(resort);
    expect(model.findOneAndDelete).toHaveBeenCalledWith({ _id: resortId });
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('rejects removal of a missing or already removed resort', async () => {
    model.findOneAndDelete.mockReturnValue(query(null));
    await expect(service.removeResortByAdmin(resortId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates only supplied allowed fields without reading status or managing deletedAt', async () => {
    await service.updateResortByAdmin({
      _id: resortId,
      resortStatus: ResortStatus.ACTIVE,
      resortDesc: null,
      memberId: new Types.ObjectId(),
      resortLikes: 200,
      createdAt: new Date(),
      deletedAt: new Date(),
    } as unknown as ResortUpdate);
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: resortId },
      { $set: { resortStatus: ResortStatus.ACTIVE, resortDesc: null } },
      { new: true, runValidators: true },
    );
    expect(model.findById).not.toHaveBeenCalled();
    expect(model.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('keeps status unchanged when only content is supplied', async () => {
    await service.updateResortByAdmin({
      _id: resortId,
      resortTitle: 'New title',
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { resortTitle: 'New title' },
    });
  });

  it('rejects updating a missing resort without retrying', async () => {
    model.findOneAndUpdate.mockReturnValue(query(null));
    await expect(
      service.updateResortByAdmin({
        _id: resortId,
        resortStatus: ResortStatus.DELETE,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('keeps counter decrements nonnegative and rejects missing counter targets', async () => {
    model.findOneAndUpdate.mockReturnValue(query(null));
    await expect(
      service.resortStatsEditor({
        _id: resortId,
        targetKey: 'resortComments',
        modifier: -1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(model.findOneAndUpdate.mock.calls[0][0]).toEqual({
      _id: resortId,
      resortComments: { $gte: 1 },
    });
  });
});
