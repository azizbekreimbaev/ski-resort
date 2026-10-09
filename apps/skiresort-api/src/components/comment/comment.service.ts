// comment.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { EquipmentService } from '../equipment/equipment.service';
import { MemberService } from '../member/member.service';
import { ResortService } from '../resort/resort.service';
import { BoardArticleService } from '../board-article/board-article.service';
import {
  CommentInput,
  CommentsInquiry,
} from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { lookupMember, validateMongoObjectId } from '../../libs/config';
import { T } from '../../libs/types/common';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    private readonly memberService: MemberService,
    private readonly resortService: ResortService,
    private readonly boardArticleService: BoardArticleService,
    private readonly equipmentService: EquipmentService,
  ) {}

  public async createComment(
    memberId: ObjectId,
    input: CommentInput,
  ): Promise<Comment> {
    if (!Object.values(CommentGroup).includes(input.commentGroup)) {
      throw new BadRequestException(Message.BAD_REQUEST);
    }
    input.commentRefId = validateMongoObjectId(
      input.commentRefId,
    ) as unknown as ObjectId;
    input.memberId = memberId;
    if (input.commentGroup === CommentGroup.RESORT) {
      await this.resortService.assertVisibleResort(input.commentRefId);
    }

    if (input.commentGroup === CommentGroup.EQUIPMENT)
      await this.equipmentService.assertVisibleEquipment(input.commentRefId);
    let result: Comment | null = null;
    try {
      result = await this.commentModel.create(input);
    } catch (err) {
      console.log(
        'Error, Service.model:',
        err instanceof Error ? err.message : err,
      );
      throw new BadRequestException(Message.CREATE_FAILED);
    }

    if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

    switch (input.commentGroup) {
      case CommentGroup.RESORT:
        try {
          await this.resortService.resortStatsEditor({
            _id: input.commentRefId,
            targetKey: 'resortComments',
            modifier: 1,
          });
        } catch (err) {
          try {
            const removed = await this.commentModel
              .deleteOne({
                _id: result._id,
                memberId,
                commentGroup: CommentGroup.RESORT,
                updatedAt: result.updatedAt,
              })
              .exec();
            if (removed.deletedCount !== 1) {
              this.logger.warn(
                `Resort comment creation compensation did not remove ${validateMongoObjectId(result._id).toHexString()}`,
              );
            }
          } catch {
            this.logger.warn(
              `Resort comment creation compensation failed for ${validateMongoObjectId(result._id).toHexString()}`,
            );
          }
          throw err;
        }
        break;
      case CommentGroup.EQUIPMENT:
        try {
          await this.equipmentService.equipmentStatsEditor({
            _id: input.commentRefId,
            targetKey: 'equipmentComments',
            modifier: 1,
          });
        } catch (err) {
          try {
            const removed = await this.commentModel
              .deleteOne({
                _id: result._id,
                memberId,
                commentGroup: CommentGroup.EQUIPMENT,
                updatedAt: result.updatedAt,
              })
              .exec();
            if (removed.deletedCount !== 1) {
              this.logger.warn(
                `Equipment comment creation compensation did not remove ${validateMongoObjectId(result._id).toHexString()}`,
              );
            }
          } catch {
            this.logger.warn(
              `Equipment comment creation compensation failed for ${validateMongoObjectId(result._id).toHexString()}`,
            );
          }
          throw err;
        }
        break;
      case CommentGroup.ARTICLE:
        await this.boardArticleService.boardArticleStatsEditor({
          _id: input.commentRefId,
          targetKey: 'articleComments',
          modifier: 1,
        });
        break;
      case CommentGroup.MEMBER:
        await this.memberService.memberStatsEditor({
          _id: input.commentRefId,
          targetKey: 'memberComments',
          modifier: 1,
        });
        break;
    }

    return result;
  }

  public async updateComment(
    memberId: ObjectId,
    input: CommentUpdate,
  ): Promise<Comment> {
    const { _id } = input;
    const result = await this.commentModel
      .findOneAndUpdate(
        {
          _id: _id,
          memberId: memberId,
          commentStatus: CommentStatus.ACTIVE,
        },
        input,
        { new: true },
      )
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  public async getComments(
    memberId: ObjectId,
    input: CommentsInquiry,
  ): Promise<Comments> {
    const { commentRefId, commentGroup } = input.search;
    if (
      commentGroup != null &&
      !Object.values(CommentGroup).includes(commentGroup)
    ) {
      throw new BadRequestException(Message.BAD_REQUEST);
    }
    const match: T = {
      commentRefId: validateMongoObjectId(commentRefId),
      commentStatus: CommentStatus.ACTIVE,
      commentGroup: commentGroup ?? { $in: Object.values(CommentGroup) },
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    const result = await this.commentModel
      .aggregate<Comments>([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              // meLiked
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length)
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
    const result = await this.commentModel
      .findOneAndDelete({
        _id: validateMongoObjectId(input),
        commentGroup: { $in: Object.values(CommentGroup) },
      })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    if (
      result.commentGroup === CommentGroup.RESORT &&
      result.commentStatus === CommentStatus.ACTIVE
    ) {
      try {
        await this.resortService.resortStatsEditor({
          _id: result.commentRefId,
          targetKey: 'resortComments',
          modifier: -1,
        });
      } catch (err) {
        try {
          await this.commentModel.collection.insertOne({
            ...result.toObject(),
            _id: validateMongoObjectId(result._id),
          });
        } catch {
          this.logger.warn(
            `Resort comment removal compensation failed for ${validateMongoObjectId(result._id).toHexString()}`,
          );
        }
        throw err;
      }
    }
    if (
      result.commentGroup === CommentGroup.EQUIPMENT &&
      result.commentStatus === CommentStatus.ACTIVE
    ) {
      try {
        await this.equipmentService.commentRemoved(result.commentRefId);
      } catch (err) {
        try {
          await this.commentModel.collection.insertOne({
            ...result.toObject(),
            _id: validateMongoObjectId(result._id),
          });
        } catch {
          this.logger.warn(
            `Equipment comment removal compensation failed for ${validateMongoObjectId(result._id).toHexString()}`,
          );
        }
        throw err;
      }
    }
    return result;
  }
}
