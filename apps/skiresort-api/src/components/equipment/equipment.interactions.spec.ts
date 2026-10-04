import { Types } from 'mongoose';
import { CommentService } from '../comment/comment.service';
import { LikeService } from '../like/like.service';
import { ViewService } from '../view/view.service';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { EquipmentStatus } from '../../libs/enums/equipment.enum';

jest.mock('uuid', () => ({ v4: () => 'fixture-image-id' }));
const q = (value: unknown) => ({ exec: jest.fn().mockResolvedValue(value) });
const memberId = new Types.ObjectId(),
  equipmentId = new Types.ObjectId(),
  commentId = new Types.ObjectId();
const snapshot = () => ({
  _id: commentId,
  memberId,
  commentRefId: equipmentId,
  commentGroup: CommentGroup.EQUIPMENT,
  commentStatus: CommentStatus.ACTIVE,
  commentContent: 'Great boots',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('Equipment comments', () => {
  let model: Record<string, jest.Mock<unknown, unknown[]>> & {
    collection: { insertOne: jest.Mock };
  };
  let equipment: Record<string, jest.Mock>;
  let service: CommentService;
  beforeEach(() => {
    model = {
      create: jest.fn().mockResolvedValue(snapshot()),
      findOne: jest.fn().mockReturnValue(q(snapshot())),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      deleteOne: jest.fn().mockReturnValue(q({ deletedCount: 1 })),
      collection: { insertOne: jest.fn().mockResolvedValue({}) },
    } as unknown as typeof model;
    equipment = {
      assertVisibleEquipment: jest.fn().mockResolvedValue({}),
      equipmentStatsEditor: jest.fn().mockResolvedValue({}),
      commentRemoved: jest.fn().mockResolvedValue(undefined),
    };
    service = new CommentService(
      model as never,
      {} as never,
      {} as never,
      {} as never,
      equipment as never,
    );
  });
  it('requires a visible target, increments its comment counter and compensates the exact inserted record', async () => {
    const input = {
      commentRefId: equipmentId,
      commentGroup: CommentGroup.EQUIPMENT,
      commentContent: 'Great boots',
    };
    await service.createComment(memberId as never, input as never);
    expect(equipment.assertVisibleEquipment).toHaveBeenCalledWith(equipmentId);
    expect(equipment.equipmentStatsEditor).toHaveBeenCalledWith({
      _id: equipmentId,
      targetKey: 'equipmentComments',
      modifier: 1,
    });
    const failure = new Error('counter unavailable');
    equipment.equipmentStatsEditor.mockRejectedValue(failure);
    await expect(
      service.createComment(memberId as never, input as never),
    ).rejects.toBe(failure);
    expect(model.deleteOne).toHaveBeenCalledWith({
      _id: commentId,
      memberId,
      commentGroup: CommentGroup.EQUIPMENT,
      updatedAt: snapshot().updatedAt,
    });
  });
  it('does not insert comments on hidden or removed Equipment', async () => {
    equipment.assertVisibleEquipment.mockRejectedValue(
      new Error('Equipment not found'),
    );
    await expect(
      service.createComment(
        memberId as never,
        {
          commentRefId: equipmentId,
          commentGroup: CommentGroup.EQUIPMENT,
          commentContent: 'test',
        } as never,
      ),
    ).rejects.toThrow('Equipment not found');
    expect(model.create).not.toHaveBeenCalled();
  });
  it('owner deletion only updates comment status, without Equipment counters or compensation', async () => {
    const deleted = { ...snapshot(), commentStatus: CommentStatus.DELETE };
    const input = { _id: commentId, commentStatus: CommentStatus.DELETE };
    model.findOneAndUpdate.mockReturnValue(q(deleted));
    await expect(
      service.updateComment(memberId as never, input as never),
    ).resolves.toBe(deleted);
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: commentId, memberId, commentStatus: CommentStatus.ACTIVE },
      input,
      { new: true },
    );
    expect(model.findOne).not.toHaveBeenCalled();
    expect(equipment.commentRemoved).not.toHaveBeenCalled();
    expect(equipment.equipmentStatsEditor).not.toHaveBeenCalled();
  });
  it('admin removal can remove comments whose Equipment target is gone', async () => {
    const removed = { ...snapshot(), toObject: snapshot };
    model.findOneAndDelete.mockReturnValue(q(removed));
    await expect(
      service.removeCommentByAdmin(commentId as never),
    ).resolves.toBe(removed);
    expect(equipment.commentRemoved).toHaveBeenCalledWith(equipmentId);
    expect(model.collection.insertOne).not.toHaveBeenCalled();
  });
  it('admin removal restores the original snapshot if counter removal fails', async () => {
    const removed = { ...snapshot(), toObject: snapshot };
    model.findOneAndDelete.mockReturnValue(q(removed));
    const failure = new Error('counter failure');
    equipment.commentRemoved.mockRejectedValue(failure);
    await expect(service.removeCommentByAdmin(commentId as never)).rejects.toBe(
      failure,
    );
    expect(model.collection.insertOne).toHaveBeenCalledWith(snapshot());
  });
});

interface HistoryStage {
  $lookup?: { from: string; let: Record<string, unknown> };
  $facet?: { list: HistoryStage[] };
  $sort?: Record<string, number>;
}

describe('Equipment favorite and visited history', () => {
  it.each(['favorite', 'visited'] as const)(
    '%s filters targets before count/pagination and uses Equipment likes',
    async (kind) => {
      const key =
        kind === 'favorite' ? 'favoriteEquipment' : 'visitedEquipment';
      const rates = [
        { durationHours: 24, price: 35 },
        { durationHours: 3, price: 15 },
      ];
      const model = {
        aggregate: jest.fn().mockReturnValue(
          q([
            {
              list: [
                {
                  [key]: {
                    _id: equipmentId,
                    equipmentRentalRates: rates,
                    meLiked: [],
                  },
                },
              ],
              metaCounter: [{ total: 1 }],
            },
          ]),
        ),
      };
      const result =
        kind === 'favorite'
          ? await new LikeService(model as never).getFavoriteEquipments(
              memberId,
              { page: 2, limit: 4 },
            )
          : await new ViewService(model as never).getVisitedEquipments(
              memberId,
              { page: 2, limit: 4 },
            );
      expect(
        result.list[0].equipmentRentalRates.map((rate) => rate.durationHours),
      ).toEqual([3, 24]);
      const stages = (model.aggregate.mock.calls as [HistoryStage[]][])[0][0];
      expect(stages[0]).toEqual({
        $match: {
          [kind === 'favorite' ? 'likeGroup' : 'viewGroup']:
            kind === 'favorite' ? LikeGroup.EQUIPMENT : ViewGroup.EQUIPMENT,
          memberId,
        },
      });
      expect(stages[1].$sort).toEqual({
        [kind === 'favorite' ? 'updatedAt' : 'createdAt']: -1,
        _id: -1,
      });
      expect(stages[2].$lookup!.from).toBe('equipments');
      expect(stages[3]).toEqual({ $unwind: '$' + key });
      expect(stages[4]).toEqual({
        $match: {
          [key + '.equipmentStatus']: { $in: [EquipmentStatus.AVAILABLE] },
        },
      });
      const list = stages[5].$facet!.list;
      expect(list[0]).toEqual({ $skip: 4 });
      expect(list[1]).toEqual({ $limit: 4 });
      expect(list[2].$lookup!.let.localLikeGroup).toBe(LikeGroup.EQUIPMENT);
      expect(list[2].$lookup!.let.localLikeRefId).toBe('$' + key + '._id');
    },
  );
  it.each(['favorite', 'visited'] as const)(
    '%s returns empty arrays for no matches',
    async (kind) => {
      const model = { aggregate: jest.fn().mockReturnValue(q([])) };
      const result =
        kind === 'favorite'
          ? await new LikeService(model as never).getFavoriteEquipments(
              memberId,
              { page: 1, limit: 10 },
            )
          : await new ViewService(model as never).getVisitedEquipments(
              memberId,
              { page: 1, limit: 10 },
            );
      expect(result).toEqual({ list: [], metaCounter: [] });
    },
  );
});
