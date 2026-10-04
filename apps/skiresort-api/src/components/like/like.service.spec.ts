jest.mock('uuid', () => ({ v4: () => 'fixture-image-id' }));

import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LikeService } from './like.service';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ResortStatus } from '../../libs/enums/resort.enum';
import { LikeInput } from '../../libs/dto/like/like.input';

const query = (value: unknown) => ({
  exec: jest.fn().mockResolvedValue(value),
});

interface HistoryStage {
  $facet?: { list: HistoryStage[] };
  $lookup?: {
    from: string;
    pipeline: unknown[];
    let: Record<string, unknown>;
  };
}

describe('LikeService resort interactions', () => {
  const input = {
    memberId: new Types.ObjectId(),
    likeRefId: new Types.ObjectId(),
    likeGroup: LikeGroup.RESORT,
  } as unknown as LikeInput;
  let model: Record<string, jest.Mock>;
  let service: LikeService;

  beforeEach(() => {
    model = {
      findOneAndDelete: jest.fn().mockReturnValue(query(null)),
      findOne: jest.fn().mockReturnValue(query(null)),
      create: jest.fn(),
      deleteOne: jest.fn().mockReturnValue(query({ deletedCount: 1 })),
      aggregate: jest
        .fn()
        .mockReturnValue(query([{ list: [], metaCounter: [] }])),
    };
    service = new LikeService(model as never);
  });

  it('atomically removes only the requested group and restores the exact deleted record on compensation', async () => {
    const snapshot = {
      ...input,
      _id: new Types.ObjectId(),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-02-01T00:00:00Z'),
    };
    model.findOneAndDelete.mockReturnValue(query({ toObject: () => snapshot }));
    model.create.mockResolvedValue([snapshot]);

    const change = await service.toggleLikeWithChange(input);
    expect(change.modifier).toBe(-1);
    expect(model.findOneAndDelete).toHaveBeenCalledWith(input);
    expect(model.findOne).not.toHaveBeenCalled();
    await change.undo();
    await change.undo();
    expect(model.create).toHaveBeenCalledTimes(1);
    expect(model.create).toHaveBeenCalledWith([snapshot], {
      timestamps: false,
    });
  });

  it('compensates a new like by deleting its exact id, leaving a later replacement untouched', async () => {
    const created = { ...input, _id: new Types.ObjectId() };
    model.create.mockResolvedValue(created);

    const change = await service.toggleLikeWithChange(input);
    expect(change.modifier).toBe(1);
    await change.undo();
    await change.undo();
    expect(model.deleteOne).toHaveBeenCalledTimes(1);
    expect(model.deleteOne).toHaveBeenCalledWith({ _id: created._id });
  });

  it('treats a concurrent duplicate in the same group as no change', async () => {
    model.create.mockRejectedValue({ code: 11000 });
    model.findOne.mockReturnValue(query(input));

    const change = await service.toggleLikeWithChange(input);
    expect(change.modifier).toBe(0);
    expect(model.findOne).toHaveBeenCalledWith(input);
    await change.undo();
    expect(model.deleteOne).not.toHaveBeenCalled();
  });

  it('rejects a legacy index conflict with another group without changing its record', async () => {
    model.create.mockRejectedValue({ code: 11000 });
    await expect(service.toggleLikeWithChange(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(model.findOne).toHaveBeenCalledWith(input);
    expect(model.deleteOne).not.toHaveBeenCalled();
  });

  it('keeps the old toggle API and checks likes using all three discriminator fields', async () => {
    model.create.mockResolvedValue({ ...input, _id: new Types.ObjectId() });
    expect(await service.toggleLike(input)).toBe(1);
    model.findOne.mockReturnValue(query(input));
    expect(await service.checkLikeExistence(input)).toEqual([
      {
        memberId: input.memberId,
        likeRefId: input.likeRefId,
        myFavorite: true,
      },
    ]);
    expect(model.findOne).toHaveBeenCalledWith(input);
  });

  it('filters deleted or missing resorts before pagination/counting while retaining missing owners and excluding credentials', async () => {
    const resort = {
      _id: input.likeRefId,
      resortStatus: ResortStatus.SOLD_OUT,
      memberData: null,
    };
    model.aggregate.mockReturnValue(
      query([
        { list: [{ favoriteResort: resort }], metaCounter: [{ total: 1 }] },
      ]),
    );

    expect(
      await service.getFavoriteResorts(input.memberId, { page: 2, limit: 3 }),
    ).toEqual({
      list: [resort],
      metaCounter: [{ total: 1 }],
    });
    const stages = (model.aggregate.mock.calls as [HistoryStage[]][])[0][0];
    const facetIndex = stages.findIndex((stage) => Boolean(stage.$facet));
    expect(facetIndex).toBeGreaterThanOrEqual(0);
    expect(stages[0]).toEqual({
      $match: { likeGroup: LikeGroup.RESORT, memberId: input.memberId },
    });
    expect(stages.slice(0, facetIndex)).toContainEqual({
      $match: {
        'favoriteResort.resortStatus': {
          $in: [ResortStatus.ACTIVE, ResortStatus.SOLD_OUT],
        },
      },
    });
    const list = stages[facetIndex].$facet?.list ?? [];
    expect(list[0]).toEqual({ $skip: 3 });
    expect(list[1]).toEqual({ $limit: 3 });
    const ownerLookup = list.find(
      (stage) => stage.$lookup?.from === 'members',
    )?.$lookup;
    expect(ownerLookup?.let.ownerId).toBe('$favoriteResort.memberId');
    expect(ownerLookup?.pipeline).toContainEqual({
      $match: { $expr: { $eq: ['$_id', '$$ownerId'] } },
    });
    expect(ownerLookup?.pipeline).toContainEqual({
      $project: { memberPassword: 0, accessToken: 0, authorization: 0 },
    });
    expect(list).toContainEqual({
      $unwind: {
        path: '$favoriteResort.memberData',
        preserveNullAndEmptyArrays: true,
      },
    });
    const likedLookup = list.find(
      (stage) => stage.$lookup?.from === 'likes',
    )?.$lookup;
    expect(likedLookup?.let.localLikeGroup).toBe(LikeGroup.RESORT);
    expect(likedLookup?.let.localLikeRefId).toBe('$favoriteResort._id');
  });

  it('returns an empty history instead of failing when aggregation yields no result', async () => {
    model.aggregate.mockReturnValue(query([]));
    expect(
      await service.getFavoriteResorts(input.memberId, { page: 1, limit: 10 }),
    ).toEqual({ list: [], metaCounter: [] });
  });
});
