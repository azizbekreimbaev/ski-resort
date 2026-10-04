import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Types } from 'mongoose';
import type { ObjectId } from 'mongoose';
import { CommentService } from './comment.service';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import {
  CommentInput,
  CommentsInquiry,
} from '../../libs/dto/comment/comment.input';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

const query = (value: unknown) => ({
  exec: jest.fn<any, unknown[]>().mockResolvedValue(value),
});
const memberId = new Types.ObjectId() as unknown as ObjectId;
const resortId = new Types.ObjectId();
const commentId = new Types.ObjectId() as unknown as ObjectId;

describe('Resort comments', () => {
  let model: {
    create: jest.Mock<any, unknown[]>;
    findOne: jest.Mock<any, unknown[]>;
    findOneAndUpdate: jest.Mock<any, unknown[]>;
    findOneAndDelete: jest.Mock<any, unknown[]>;
    deleteOne: jest.Mock<any, unknown[]>;
    aggregate: jest.Mock<any, unknown[]>;
    collection: { insertOne: jest.Mock<any, unknown[]> };
  };
  let resort: {
    assertVisibleResort: jest.Mock<any, unknown[]>;
    resortStatsEditor: jest.Mock<any, unknown[]>;
  };
  let member: { memberStatsEditor: jest.Mock<any, unknown[]> };
  let article: { boardArticleStatsEditor: jest.Mock<any, unknown[]> };
  let service: CommentService;
  let warning: jest.SpyInstance;

  const comment = (extra = {}) => ({
    _id: commentId,
    memberId,
    commentRefId: resortId,
    commentGroup: CommentGroup.RESORT,
    commentStatus: CommentStatus.ACTIVE,
    commentContent: 'Great snow',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...extra,
  });
  const createInput = (group = CommentGroup.RESORT): CommentInput => ({
    commentRefId: resortId as unknown as ObjectId,
    commentGroup: group,
    commentContent: 'Great snow',
  });

  beforeEach(() => {
    model = {
      create: jest.fn<any, unknown[]>().mockResolvedValue(comment()),
      findOne: jest.fn<any, unknown[]>().mockReturnValue(query(null)),
      findOneAndUpdate: jest.fn<any, unknown[]>().mockReturnValue(query(null)),
      findOneAndDelete: jest.fn<any, unknown[]>().mockReturnValue(query(null)),
      deleteOne: jest
        .fn<any, unknown[]>()
        .mockReturnValue(query({ deletedCount: 1 })),
      aggregate: jest
        .fn<any, unknown[]>()
        .mockReturnValue(query([{ list: [], metaCounter: [] }])),
      collection: {
        insertOne: jest.fn<any, unknown[]>().mockResolvedValue({}),
      },
    };
    resort = {
      assertVisibleResort: jest.fn<any, unknown[]>().mockResolvedValue({}),
      resortStatsEditor: jest.fn<any, unknown[]>().mockResolvedValue({}),
    };
    member = {
      memberStatsEditor: jest.fn<any, unknown[]>().mockResolvedValue({}),
    };
    article = {
      boardArticleStatsEditor: jest.fn<any, unknown[]>().mockResolvedValue({}),
    };
    service = new CommentService(
      model as unknown as ConstructorParameters<typeof CommentService>[0],
      member as unknown as ConstructorParameters<typeof CommentService>[1],
      resort as unknown as ConstructorParameters<typeof CommentService>[2],
      article as unknown as ConstructorParameters<typeof CommentService>[3],
    );
    warning = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('checks target visibility before insertion and increments only after insertion', async () => {
    await service.createComment(memberId, createInput());
    expect(resort.assertVisibleResort).toHaveBeenCalledWith(resortId);
    expect(resort.assertVisibleResort.mock.invocationCallOrder[0]).toBeLessThan(
      model.create.mock.invocationCallOrder[0],
    );
    expect(model.create.mock.invocationCallOrder[0]).toBeLessThan(
      resort.resortStatsEditor.mock.invocationCallOrder[0],
    );
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ memberId }),
    );
    expect(resort.resortStatsEditor).toHaveBeenCalledWith({
      _id: resortId,
      targetKey: 'resortComments',
      modifier: 1,
    });
  });

  it('does not insert a comment against a hidden or missing Resort', async () => {
    resort.assertVisibleResort.mockRejectedValue(new BadRequestException());
    await expect(
      service.createComment(memberId, createInput()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it.each(['PROPERTY', 'EQUIPMENT'])(
    'rejects unsupported %s before persistence',
    async (group) => {
      await expect(
        service.createComment(memberId, createInput(group as CommentGroup)),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(model.create).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid reference IDs before persistence', async () => {
    await expect(
      service.createComment(memberId, {
        ...createInput(),
        commentRefId: 'bad-id',
      } as unknown as CommentInput),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('does not increment when insertion fails', async () => {
    model.create.mockRejectedValue(new Error('insert failed'));
    const consoleLog = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    await expect(
      service.createComment(memberId, createInput()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(resort.resortStatsEditor).not.toHaveBeenCalled();
    consoleLog.mockRestore();
  });

  it('removes the exact inserted comment when its counter increment fails', async () => {
    const failure = new Error('counter failed');
    resort.resortStatsEditor.mockRejectedValue(failure);
    await expect(service.createComment(memberId, createInput())).rejects.toBe(
      failure,
    );
    expect(model.deleteOne).toHaveBeenCalledWith({
      _id: commentId,
      memberId,
      commentGroup: CommentGroup.RESORT,
      updatedAt: comment().updatedAt,
    });
    expect(warning).not.toHaveBeenCalled();
  });

  it('reports failed creation compensation while preserving the original counter error', async () => {
    const failure = new Error('counter failed');
    resort.resortStatsEditor.mockRejectedValue(failure);
    model.deleteOne.mockReturnValue({
      exec: jest
        .fn<any, unknown[]>()
        .mockRejectedValue(new Error('rollback failed')),
    });
    await expect(service.createComment(memberId, createInput())).rejects.toBe(
      failure,
    );
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('compensation failed'),
    );
  });

  it('decrements a successful owner soft deletion only once', async () => {
    const original = comment();
    const deleted = comment({
      commentStatus: CommentStatus.DELETE,
      updatedAt: new Date('2026-02-01'),
    });
    model.findOne
      .mockReturnValueOnce(query(original))
      .mockReturnValueOnce(query(deleted));
    model.findOneAndUpdate.mockReturnValue(query(deleted));
    const input = { _id: commentId, commentStatus: CommentStatus.DELETE };
    await expect(service.updateComment(memberId, input)).resolves.toBe(deleted);
    await expect(service.updateComment(memberId, input)).resolves.toBe(deleted);
    expect(resort.resortStatsEditor).toHaveBeenCalledTimes(1);
    expect(resort.resortStatsEditor).toHaveBeenCalledWith({
      _id: resortId,
      targetKey: 'resortComments',
      modifier: -1,
    });
    expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(model.findOneAndUpdate.mock.calls[0][0]).toEqual(
      expect.objectContaining({ memberId, updatedAt: original.updatedAt }),
    );
  });

  it('does not restore an owner-deleted Resort comment', async () => {
    model.findOne.mockReturnValue(
      query(comment({ commentStatus: CommentStatus.DELETE })),
    );
    await expect(
      service.updateComment(memberId, {
        _id: commentId,
        commentStatus: CommentStatus.ACTIVE,
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("does not mutate another member's comment", async () => {
    await expect(
      service.updateComment(memberId, {
        _id: commentId,
        commentStatus: CommentStatus.DELETE,
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(model.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ memberId }),
    );
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ memberId }),
      expect.anything(),
      expect.anything(),
    );
    expect(resort.resortStatsEditor).not.toHaveBeenCalled();
  });

  it('does not decrement for a Resort content edit', async () => {
    model.findOne.mockReturnValue(query(comment()));
    model.findOneAndUpdate.mockReturnValue(
      query(comment({ commentContent: 'Updated' })),
    );
    await service.updateComment(memberId, {
      _id: commentId,
      commentContent: 'Updated',
    });
    expect(resort.resortStatsEditor).not.toHaveBeenCalled();
  });

  it('treats a concurrent winning deletion as idempotent without another decrement', async () => {
    const deleted = comment({ commentStatus: CommentStatus.DELETE });
    model.findOne
      .mockReturnValueOnce(query(comment()))
      .mockReturnValueOnce(query(deleted));
    await expect(
      service.updateComment(memberId, {
        _id: commentId,
        commentStatus: CommentStatus.DELETE,
      }),
    ).resolves.toBe(deleted);
    expect(resort.resortStatsEditor).not.toHaveBeenCalled();
  });

  it('restores only the failed deletion mutation and preserves its original counter error', async () => {
    const original = comment();
    const deleted = comment({
      commentStatus: CommentStatus.DELETE,
      updatedAt: new Date('2026-02-01'),
    });
    const failure = new Error('counter failed');
    model.findOne.mockReturnValue(query(original));
    model.findOneAndUpdate
      .mockReturnValueOnce(query(deleted))
      .mockReturnValueOnce(query(original));
    resort.resortStatsEditor.mockRejectedValue(failure);
    await expect(
      service.updateComment(memberId, {
        _id: commentId,
        commentStatus: CommentStatus.DELETE,
      }),
    ).rejects.toBe(failure);
    expect(model.findOneAndUpdate.mock.calls[1]).toEqual([
      {
        _id: commentId,
        memberId,
        commentGroup: CommentGroup.RESORT,
        commentStatus: CommentStatus.DELETE,
        updatedAt: deleted.updatedAt,
      },
      {
        $set: {
          commentStatus: CommentStatus.ACTIVE,
          commentContent: original.commentContent,
          updatedAt: original.updatedAt,
        },
      },
      { new: true, runValidators: true, timestamps: false },
    ]);
  });

  it('reports a missed soft-deletion compensation without overwriting a concurrent mutation', async () => {
    const failure = new Error('counter failed');
    model.findOne.mockReturnValue(query(comment()));
    model.findOneAndUpdate
      .mockReturnValueOnce(
        query(comment({ commentStatus: CommentStatus.DELETE })),
      )
      .mockReturnValueOnce(query(null));
    resort.resortStatsEditor.mockRejectedValue(failure);
    await expect(
      service.updateComment(memberId, {
        _id: commentId,
        commentStatus: CommentStatus.DELETE,
      }),
    ).rejects.toBe(failure);
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('did not restore'),
    );
  });

  it.each([CommentStatus.ACTIVE, CommentStatus.DELETE])(
    'admin removal decrements only when previously %s is active',
    async (status) => {
      model.findOneAndDelete.mockReturnValue(
        query(comment({ commentStatus: status })),
      );
      await service.removeCommentByAdmin(commentId);
      expect(resort.resortStatsEditor).toHaveBeenCalledTimes(
        status === CommentStatus.ACTIVE ? 1 : 0,
      );
    },
  );

  it('restores the exact admin-removed document when its active counter decrement fails', async () => {
    const original = comment();
    const removed = { ...original, toObject: () => original };
    const failure = new Error('counter failed');
    model.findOneAndDelete.mockReturnValue(query(removed));
    resort.resortStatsEditor.mockRejectedValue(failure);
    await expect(service.removeCommentByAdmin(commentId)).rejects.toBe(failure);
    expect(model.collection.insertOne).toHaveBeenCalledWith(original);
  });

  it('reports failed admin removal compensation while preserving the original counter error', async () => {
    const original = comment();
    const failure = new Error('counter failed');
    model.findOneAndDelete.mockReturnValue(
      query({ ...original, toObject: () => original }),
    );
    resort.resortStatsEditor.mockRejectedValue(failure);
    model.collection.insertOne.mockRejectedValue(new Error('rollback failed'));
    await expect(service.removeCommentByAdmin(commentId)).rejects.toBe(failure);
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('compensation failed'),
    );
  });

  it.each([CommentGroup.MEMBER, CommentGroup.ARTICLE])(
    'preserves %s creation counters',
    async (group) => {
      await service.createComment(memberId, createInput(group));
      const stats =
        group === CommentGroup.MEMBER
          ? member.memberStatsEditor
          : article.boardArticleStatsEditor;
      expect(stats).toHaveBeenCalledWith({
        _id: resortId,
        targetKey:
          group === CommentGroup.MEMBER ? 'memberComments' : 'articleComments',
        modifier: 1,
      });
      expect(resort.assertVisibleResort).not.toHaveBeenCalled();
    },
  );

  it('preserves the existing Member/Article owner update lifecycle', async () => {
    const updated = comment({
      commentGroup: CommentGroup.ARTICLE,
      commentStatus: CommentStatus.DELETE,
    });
    model.findOneAndUpdate.mockReturnValue(query(updated));
    await service.updateComment(memberId, {
      _id: commentId,
      commentStatus: CommentStatus.DELETE,
    });
    expect(article.boardArticleStatsEditor).not.toHaveBeenCalled();
    expect(member.memberStatsEditor).not.toHaveBeenCalled();
  });

  it.each([undefined, CommentGroup.RESORT])(
    'filters inquiry groups using %s',
    async (group) => {
      await service.getComments(memberId, {
        page: 2,
        limit: 10,
        search: { commentRefId: resortId, commentGroup: group },
      } as unknown as CommentsInquiry);
      const pipeline = model.aggregate.mock.calls[0][0] as [
        { $match: { commentGroup: unknown; commentStatus: CommentStatus } },
        unknown,
        { $facet: { list: unknown[] } },
      ];
      expect(pipeline[0].$match.commentGroup).toEqual(
        group ?? { $in: Object.values(CommentGroup) },
      );
      expect(pipeline[0].$match.commentStatus).toBe(CommentStatus.ACTIVE);
      expect(pipeline[2].$facet.list[0]).toEqual({ $skip: 10 });
      expect(JSON.stringify(pipeline[0])).not.toContain('PROPERTY');
    },
  );

  it('validates nested inquiry IDs and group enums', async () => {
    const input = plainToInstance(CommentsInquiry, {
      page: 1,
      limit: 10,
      search: { commentRefId: 'invalid', commentGroup: 'PROPERTY' },
    });
    const errors = await validate(input);
    expect(JSON.stringify(errors)).toContain('isMongoId');
    expect(JSON.stringify(errors)).toContain('isEnum');
    const valid = plainToInstance(CommentsInquiry, {
      page: 1,
      limit: 10,
      search: {
        commentRefId: resortId.toHexString(),
        commentGroup: CommentGroup.RESORT,
      },
    });
    expect(await validate(valid)).toEqual([]);
  });
});
