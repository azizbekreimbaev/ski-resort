import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { FollowService } from './follow.service';
import FollowSchema from '../../schemas/Follow.model';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

describe('Follow subscription idempotency', () => {
  const followerId = new Types.ObjectId();
  const followingId = new Types.ObjectId();
  const follow = { _id: new Types.ObjectId(), followerId, followingId };
  let model: { create: jest.Mock; findOne: jest.Mock };
  let members: { getMember: jest.Mock; memberStatsEditor: jest.Mock };
  let service: FollowService;

  beforeEach(() => {
    model = {
      create: jest.fn().mockResolvedValue(follow),
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(follow) }),
    };
    members = {
      getMember: jest.fn().mockResolvedValue({ _id: followingId }),
      memberStatsEditor: jest.fn().mockResolvedValue({}),
    };
    service = new FollowService(model as never, members as never);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('creates a follow and increments both counters once', async () => {
    await expect(
      service.subscribe(followerId as never, followingId as never),
    ).resolves.toBe(follow);
    expect(model.create).toHaveBeenCalledWith({ followingId, followerId });
    expect(members.memberStatsEditor.mock.calls).toEqual([
      [{ _id: followerId, targetKey: 'memberFollowings', modifier: 1 }],
      [{ _id: followingId, targetKey: 'memberFollowers', modifier: 1 }],
    ]);
  });

  it('returns an existing follow on a duplicate without incrementing counters', async () => {
    model.create.mockRejectedValue({ code: 11000 });
    await expect(
      service.subscribe(followerId as never, followingId as never),
    ).resolves.toBe(follow);
    expect(model.findOne).toHaveBeenCalledWith({ followingId, followerId });
    expect(members.memberStatsEditor).not.toHaveBeenCalled();
  });

  it('increments counters only for the winning concurrent insert', async () => {
    model.create
      .mockResolvedValueOnce(follow)
      .mockRejectedValueOnce({ code: 11000 });
    const results = await Promise.all([
      service.subscribe(followerId as never, followingId as never),
      service.subscribe(followerId as never, followingId as never),
    ]);
    expect(results).toEqual([follow, follow]);
    expect(members.memberStatsEditor).toHaveBeenCalledTimes(2);
  });

  it('does not swallow unrelated persistence errors', async () => {
    model.create.mockRejectedValue(new Error('write failed'));
    await expect(
      service.subscribe(followerId as never, followingId as never),
    ).rejects.toThrow(BadRequestException);
    expect(model.findOne).not.toHaveBeenCalled();
    expect(members.memberStatsEditor).not.toHaveBeenCalled();
  });

  it('fails when the duplicate relationship no longer exists', async () => {
    model.create.mockRejectedValue({ code: 11000 });
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(
      service.subscribe(followerId as never, followingId as never),
    ).rejects.toThrow(BadRequestException);
    expect(members.memberStatsEditor).not.toHaveBeenCalled();
  });

  it('still rejects self subscription', async () => {
    await expect(
      service.subscribe(followerId as never, followerId as never),
    ).rejects.toThrow(InternalServerErrorException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('preserves the unique relationship index', () => {
    expect(FollowSchema.indexes()).toContainEqual([
      { followingId: 1, followerId: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });
});
