import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import type { ObjectId } from 'mongoose';
import {
  AllResortsInquiry,
  availableResortSorts,
  ResortHistoryInquiry,
  ResortInput,
  ResortSearch,
  ResortsInquiry,
} from '../../libs/dto/resort/resort.input';
import { Resort, Resorts } from '../../libs/dto/resort/resort';
import { ResortUpdate } from '../../libs/dto/resort/resort.update';
import { ResortStatus } from '../../libs/enums/resort.enum';
import { Direction } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { ViewInput } from '../../libs/dto/view/view.input';
import {
  lookupAuthMemberLiked,
  validateMongoObjectId,
} from '../../libs/config';
import { LikeService } from '../like/like.service';
import { ViewService } from '../view/view.service';
import { resortIdentityCollation } from '../../schemas/Resort.model';

type MongoId = Types.ObjectId | ObjectId;
type ResortCounter = 'resortViews' | 'resortLikes' | 'resortComments';

const visibleStatuses = [ResortStatus.ACTIVE, ResortStatus.SOLD_OUT];
const contentFields = [
  'resortTitle',
  'resortLocation',
  'resortAddress',
  'resortPricePerDay',
  'resortMinDays',
  'resortLevel',
  'resortImages',
  'resortFacilities',
  'resortDesc',
] as const;

// Aggregation bypasses Mongoose's select:false. Never join credentials.
const ownerStages: PipelineStage.FacetPipelineStage[] = [
  {
    $lookup: {
      from: 'members',
      let: { ownerId: '$memberId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$ownerId'] } } },
        { $project: { memberPassword: 0, accessToken: 0, authorization: 0 } },
      ],
      as: 'memberData',
    },
  },
  { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
];

@Injectable()
export class ResortService {
  private readonly logger = new Logger(ResortService.name);

  constructor(
    @InjectModel('Resort') private readonly resortModel: Model<Resort>,
    private readonly likeService: LikeService,
    private readonly viewService: ViewService,
  ) { }

  public async createResort(
    memberId: MongoId,
    input: ResortInput,
  ): Promise<Resort> {
    const identity = {
      resortTitle: input.resortTitle.trim(),
      resortLocation: input.resortLocation,
      resortAddress: input.resortAddress.trim(),
      resortLevel: input.resortLevel ?? null,
    };
    const duplicate = await this.resortModel
      .exists(identity)
      .collation(resortIdentityCollation)
      .exec();
    if (duplicate) throw this.duplicateResortError();

    try {
      const resort = await this.resortModel.create({
        ...this.pickContent(input),
        ...identity,
        memberId,
        resortStatus: ResortStatus.ACTIVE,
        resortMinDays: input.resortMinDays ?? 2,
        resortViews: 0,
        resortLikes: 0,
        resortComments: 0,
      });
      return resort.toObject();
    } catch (error) {
      // The database index is the final guard when concurrent pre-checks pass.
      if (this.isDuplicateKeyError(error)) throw this.duplicateResortError();
      throw error;
    }
  }

  public async assertVisibleResort(resortId: MongoId): Promise<Resort> {
    const resort = await this.resortModel
      .findOne({ _id: resortId, resortStatus: { $in: visibleStatuses } })
      .lean<Resort>()
      .exec();
    if (!resort) throw new NotFoundException('Resort not found');
    return resort;
  }

  public async getResort(
    memberId: MongoId | null,
    resortId: MongoId,
  ): Promise<Resort> {
    const [resort] = await this.resortModel
      .aggregate<Resort>([
        { $match: { _id: resortId, resortStatus: { $in: visibleStatuses } } },
        ...ownerStages,
      ])
      .exec();
    if (!resort) throw new NotFoundException('Resort not found');

    resort.meLiked = [];
    if (memberId) {
      const change = await this.viewService.recordViewWithChange({
        memberId,
        viewRefId: resortId,
        viewGroup: ViewGroup.RESORT,
      } as unknown as ViewInput);
      if (change.record) {
        try {
          const updated = await this.resortStatsEditor({
            _id: resortId,
            targetKey: 'resortViews',
            modifier: 1,
          });
          resort.resortViews = updated.resortViews;
        } catch (error) {
          await this.compensate(change.undo, 'view');
          throw error;
        }
      }
      resort.meLiked = await this.likeService.checkLikeExistence(
        this.likeInput(memberId, resortId),
      );
    }
    return resort;
  }

  public getResorts(
    memberId: MongoId | null,
    input: ResortsInquiry,
  ): Promise<Resorts> {
    return this.listResorts(memberId, input, {
      resortStatus: { $in: visibleStatuses },
      ...this.searchMatch(input.search),
    });
  }

  public getAllResortsByAdmin(input: AllResortsInquiry): Promise<Resorts> {
    const match = this.searchMatch(input.search);
    if (input.search?.resortStatus)
      match.resortStatus = input.search.resortStatus;
    return this.listResorts(null, input, match);
  }

  public async updateResortByAdmin(input: ResortUpdate): Promise<Resort> {
    const values = this.pickContent(input);
    if (input.resortStatus !== undefined)
      values.resortStatus = input.resortStatus;
    try {
      const resort = await this.resortModel
        .findOneAndUpdate(
          { _id: input._id },
          { $set: values },
          { new: true, runValidators: true },
        )
        .lean<Resort>()
        .exec();
      if (!resort) throw new NotFoundException('Resort not found');
      return resort;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) throw this.duplicateResortError();
      throw error;
    }
  }

  public async removeResortByAdmin(resortId: MongoId): Promise<Resort> {
    const resort = await this.resortModel
      .findOneAndDelete({ _id: resortId })
      .lean<Resort>()
      .exec();
    if (!resort) throw new NotFoundException('Resort not found');
    return resort;
  }

  public async likeTargetResort(
    memberId: MongoId,
    resortId: MongoId,
  ): Promise<Resort> {
    let resort = await this.assertVisibleResort(resortId);
    const input = this.likeInput(memberId, resortId);
    const change = await this.likeService.toggleLikeWithChange(input);
    if (change.modifier !== 0) {
      try {
        resort = await this.resortStatsEditor({
          _id: resortId,
          targetKey: 'resortLikes',
          modifier: change.modifier,
        });
      } catch (error) {
        await this.compensate(change.undo, 'like');
        throw error;
      }
    }
    resort.meLiked = await this.likeService.checkLikeExistence(input);
    return resort;
  }

  public getFavoriteResorts(
    memberId: MongoId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts> {
    return this.likeService.getFavoriteResorts(memberId, input);
  }

  public getVisitedResorts(
    memberId: MongoId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts> {
    return this.viewService.getVisitedResorts(memberId, input);
  }

  public async resortStatsEditor(input: {
    _id: MongoId;
    targetKey: ResortCounter;
    modifier: number;
  }): Promise<Resort> {
    const { _id, targetKey, modifier } = input;
    if (
      !['resortViews', 'resortLikes', 'resortComments'].includes(targetKey) ||
      !Number.isInteger(modifier) ||
      ![-1, 1].includes(modifier)
    ) {
      throw new BadRequestException('Invalid resort counter change');
    }
    const match: Record<string, unknown> = { _id };
    if (modifier > 0) match.resortStatus = { $in: visibleStatuses };
    // Deleted resort records still receive decrements when comments are removed.
    if (modifier < 0) match[targetKey] = { $gte: -modifier };
    const resort = await this.resortModel
      .findOneAndUpdate(
        match,
        { $inc: { [targetKey]: modifier } },
        { new: true },
      )
      .lean<Resort>()
      .exec();
    if (!resort)
      throw new ConflictException('Resort counter could not be updated');
    return resort;
  }

  private pickContent(
    input: ResortInput | ResortUpdate,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of contentFields) {
      if (input[key] !== undefined) result[key] = input[key];
    }
    return result;
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private duplicateResortError(): ConflictException {
    return new ConflictException(
      'A resort with this title, location, address and level already exists',
    );
  }

  private searchMatch(search?: ResortSearch | null): Record<string, unknown> {
    const match: Record<string, unknown> = {};
    if (!search) return match;
    if (search.memberId)
      match.memberId = validateMongoObjectId(search.memberId);
    if (search.locationList?.length)
      match.resortLocation = { $in: search.locationList };
    if (search.levelList?.length) match.resortLevel = { $in: search.levelList };
    if (search.facilities?.length)
      match.resortFacilities = { $all: search.facilities };
    if (search.pricesRange) {
      const { start, end } = search.pricesRange;
      if (start > end)
        throw new BadRequestException('Price range start must not exceed end');
      match.resortPricePerDay = { $gte: start, $lte: end };
    }
    if (search.text) {
      const escaped = search.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.resortTitle = { $regex: escaped, $options: 'i' };
    }
    return match;
  }

  private async listResorts(
    memberId: MongoId | null,
    input: ResortsInquiry | AllResortsInquiry,
    match: Record<string, unknown>,
  ): Promise<Resorts> {
    if (
      !Number.isInteger(input.page) ||
      input.page < 1 ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > 100
    ) {
      throw new BadRequestException('Invalid resort pagination');
    }
    const sortKey = input.sort ?? 'createdAt';
    const direction = input.direction ?? Direction.DESC;
    if (
      !availableResortSorts.includes(sortKey) ||
      ![Direction.ASC, Direction.DESC].includes(direction)
    ) {
      throw new BadRequestException('Invalid resort sort');
    }
    const result = await this.resortModel
      .aggregate<Resorts>([
        { $match: match },
        { $sort: { [sortKey]: direction, _id: direction } },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              ...ownerStages,
              lookupAuthMemberLiked(memberId, '$_id', LikeGroup.RESORT),
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    return result[0] ?? { list: [], metaCounter: [] };
  }

  private likeInput(memberId: MongoId, resortId: MongoId): LikeInput {
    return {
      memberId,
      likeRefId: resortId,
      likeGroup: LikeGroup.RESORT,
    } as unknown as LikeInput;
  }

  private async compensate(
    undo: () => Promise<void>,
    interaction: string,
  ): Promise<void> {
    try {
      await undo();
    } catch {
      this.logger.error(
        `Resort ${interaction} compensation failed; counters may need reconciliation`,
      );
    }
  }
}
