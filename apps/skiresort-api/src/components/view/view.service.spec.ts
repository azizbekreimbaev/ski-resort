jest.mock('uuid', () => ({ v4: () => 'fixture-image-id' }));

import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ViewService } from './view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ResortStatus } from '../../libs/enums/resort.enum';
import { ViewInput } from '../../libs/dto/view/view.input';

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

describe('ViewService resort interactions', () => {
  const input = {
    memberId: new Types.ObjectId(),
    viewRefId: new Types.ObjectId(),
    viewGroup: ViewGroup.RESORT,
  } as unknown as ViewInput;
  let model: Record<string, jest.Mock>;
  let service: ViewService;

  beforeEach(() => {
    model = {
      findOne: jest.fn().mockReturnValue(query(null)),
      create: jest.fn(),
      deleteOne: jest.fn().mockReturnValue(query({ deletedCount: 1 })),
      aggregate: jest
        .fn()
        .mockReturnValue(query([{ list: [], metaCounter: [] }])),
    };
    service = new ViewService(model as never);
  });

  it('deduplicates the exact group and preserves the recordView wrapper result', async () => {
    model.findOne.mockReturnValue(query(input));
    expect(await service.recordView(input)).toBeNull();
    expect(model.findOne).toHaveBeenCalledWith(input);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('returns the newly inserted view and compensates only its exact id once', async () => {
    const created = { ...input, _id: new Types.ObjectId() };
    model.create.mockResolvedValue(created);
    const change = await service.recordViewWithChange(input);
    expect(change.record).toBe(created);
    await change.undo();
    await change.undo();
    expect(model.deleteOne).toHaveBeenCalledTimes(1);
    expect(model.deleteOne).toHaveBeenCalledWith({ _id: created._id });
  });

  it('handles simultaneous creates in the same group without counting another view', async () => {
    model.findOne
      .mockReturnValueOnce(query(null))
      .mockReturnValueOnce(query(input));
    model.create.mockRejectedValue({ code: 11000 });
    const change = await service.recordViewWithChange(input);
    expect(change.record).toBeNull();
    await change.undo();
    expect(model.findOne).toHaveBeenNthCalledWith(2, input);
    expect(model.deleteOne).not.toHaveBeenCalled();
  });

  it('rejects a duplicate-key conflict caused by another legacy group', async () => {
    model.create.mockRejectedValue({ code: 11000 });
    await expect(service.recordViewWithChange(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(model.findOne).toHaveBeenNthCalledWith(2, input);
  });

  it('filters deleted resorts before pagination/counting and retains missing owners with safe resort likes', async () => {
    const resort = {
      _id: input.viewRefId,
      resortStatus: ResortStatus.ACTIVE,
      memberData: null,
    };
    model.aggregate.mockReturnValue(
      query([
        { list: [{ visitedResort: resort }], metaCounter: [{ total: 1 }] },
      ]),
    );
    expect(
      await service.getVisitedResorts(input.memberId, { page: 2, limit: 4 }),
    ).toEqual({
      list: [resort],
      metaCounter: [{ total: 1 }],
    });
    const stages = (model.aggregate.mock.calls as [HistoryStage[]][])[0][0];
    const facetIndex = stages.findIndex((stage) => Boolean(stage.$facet));
    expect(facetIndex).toBeGreaterThanOrEqual(0);
    expect(stages[0]).toEqual({
      $match: { viewGroup: ViewGroup.RESORT, memberId: input.memberId },
    });
    expect(stages.slice(0, facetIndex)).toContainEqual({
      $match: {
        'visitedResort.resortStatus': {
          $in: [ResortStatus.ACTIVE, ResortStatus.SOLD_OUT],
        },
      },
    });
    const list = stages[facetIndex].$facet?.list ?? [];
    expect(list[0]).toEqual({ $skip: 4 });
    const ownerLookup = list.find(
      (stage) => stage.$lookup?.from === 'members',
    )?.$lookup;
    expect(ownerLookup?.let.ownerId).toBe('$visitedResort.memberId');
    expect(ownerLookup?.pipeline).toContainEqual({
      $match: { $expr: { $eq: ['$_id', '$$ownerId'] } },
    });
    expect(ownerLookup?.pipeline).toContainEqual({
      $project: { memberPassword: 0, accessToken: 0, authorization: 0 },
    });
    expect(list).toContainEqual({
      $unwind: {
        path: '$visitedResort.memberData',
        preserveNullAndEmptyArrays: true,
      },
    });
    const likedLookup = list.find(
      (stage) => stage.$lookup?.from === 'likes',
    )?.$lookup;
    expect(likedLookup?.let.localLikeGroup).toBe(LikeGroup.RESORT);
    expect(likedLookup?.let.localLikeRefId).toBe('$visitedResort._id');
  });
});
