import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { ResortHistoryInquiry } from '../../libs/dto/resort/resort.input';
import { Resort, Resorts } from '../../libs/dto/resort/resort';
import { TotalCounter } from '../../libs/dto/member/member';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ResortStatus } from '../../libs/enums/resort.enum';
import { lookupAuthMemberLiked, lookupFavorite } from '../../libs/config';

export interface LikeChange {
  modifier: number;
  undo: () => Promise<void>;
}

@Injectable()
export class LikeService {
  constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

  public async toggleLike(input: LikeInput): Promise<number> {
    return (await this.toggleLikeWithChange(input)).modifier;
  }

  public async toggleLikeWithChange(input: LikeInput): Promise<LikeChange> {
    const search = {
      memberId: input.memberId,
      likeRefId: input.likeRefId,
      likeGroup: input.likeGroup,
    };
    const removed = await this.likeModel.findOneAndDelete(search).exec();
    if (removed) {
      const snapshot = removed.toObject();
      let restoration: Promise<void> | undefined;
      return {
        modifier: -1,
        undo: () =>
          (restoration ??= this.likeModel
            .create([snapshot], { timestamps: false })
            .then(() => undefined)),
      };
    }

    try {
      const created = await this.likeModel.create(input);
      let removal: Promise<void> | undefined;
      return {
        modifier: 1,
        undo: () =>
          (removal ??= this.likeModel
            .deleteOne({ _id: created._id })
            .exec()
            .then(() => undefined)),
      };
    } catch (err) {
      if (
        (err as { code?: number } | null)?.code === 11000 &&
        (await this.likeModel.findOne(search).exec())
      ) {
        return { modifier: 0, undo: () => Promise.resolve() };
      }
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
    const { memberId, likeRefId, likeGroup } = input;
    const result = await this.likeModel
      .findOne({ memberId, likeRefId, likeGroup })
      .exec();
    return result ? [{ memberId, likeRefId, myFavorite: true }] : [];
  }

  public async getFavoriteResorts(
    memberId: ObjectId | Types.ObjectId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts> {
    const { page, limit } = input;
    const data = await this.likeModel
      .aggregate<{
        list: { favoriteResort: Resort }[];
        metaCounter: TotalCounter[];
      }>([
        { $match: { likeGroup: LikeGroup.RESORT, memberId } },
        { $sort: { updatedAt: -1, _id: -1 } },
        {
          $lookup: {
            from: 'resorts',
            localField: 'likeRefId',
            foreignField: '_id',
            as: 'favoriteResort',
          },
        },
        { $unwind: '$favoriteResort' },
        {
          $match: {
            'favoriteResort.resortStatus': {
              $in: [ResortStatus.ACTIVE, ResortStatus.SOLD_OUT],
            },
          },
        },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupFavorite,
              {
                $unwind: {
                  path: '$favoriteResort.memberData',
                  preserveNullAndEmptyArrays: true,
                },
              },
              lookupAuthMemberLiked(
                memberId,
                '$favoriteResort._id',
                LikeGroup.RESORT,
              ),
              { $set: { 'favoriteResort.meLiked': '$meLiked' } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    return {
      list: (data[0]?.list ?? []).map((entry) => entry.favoriteResort),
      metaCounter: data[0]?.metaCounter ?? [],
    };
  }
}
