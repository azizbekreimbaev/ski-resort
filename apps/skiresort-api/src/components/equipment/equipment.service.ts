import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Model, Types } from 'mongoose';
import type { ObjectId } from 'mongoose';
import {
  AllEquipmentsInquiry,
  availableEquipmentSorts,
  EquipmentHistoryInquiry,
  EquipmentInput,
  EquipmentSearch,
  EquipmentsInquiry,
} from '../../libs/dto/equipment/equipment.input';
import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';
import { EquipmentUpdate } from '../../libs/dto/equipment/equipment.update';
import { EquipmentStatus } from '../../libs/enums/equipment.enum';
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
import { EquipmentAudience } from '../../libs/enums/equipment.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Member } from '../../libs/dto/member/member';
import { ResortService } from '../resort/resort.service';
import { normalizeEquipmentSize } from './equipment-size';

type MongoId = Types.ObjectId | ObjectId;
type EquipmentCounter =
  'equipmentViews' | 'equipmentLikes' | 'equipmentComments';

const visibleStatuses = [EquipmentStatus.AVAILABLE];
const contentFields = [
  'resortId',
  'equipmentStatus',
  'equipmentCategory',
  'equipmentName',
  'equipmentBrand',
  'equipmentSize',
  'equipmentAudience',
  'equipmentRentalRates',
  'equipmentPurchasable',
  'equipmentPurchasePrice',
  'equipmentQuantity',
  'equipmentImages',
  'equipmentDesc',
] as const;

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectModel('Equipment') private readonly equipmentModel: Model<Equipment>,
    private readonly likeService: LikeService,
    private readonly viewService: ViewService,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly resortService: ResortService,
  ) {}

  public async createEquipment(
    adminId: MongoId,
    input: EquipmentInput,
  ): Promise<Equipment> {
    await this.assertAdmin(adminId);
    const values = this.normalizeContent(input);
    if (values.resortId)
      await this.resortService.assertVisibleResort(values.resortId as MongoId);
    const equipment = await this.equipmentModel.create(values);
    return this.output(equipment.toObject());
  }

  public async getEquipment(
    memberId: MongoId | null,
    equipmentId: MongoId,
  ): Promise<Equipment> {
    const [equipment] = await this.equipmentModel
      .aggregate<Equipment>([
        {
          $match: {
            _id: equipmentId,
            equipmentStatus: { $in: visibleStatuses },
          },
        },
      ])
      .exec();
    if (!equipment) throw new NotFoundException('Equipment not found');

    equipment.meLiked = [];
    if (memberId) {
      const change = await this.viewService.recordViewWithChange({
        memberId,
        viewRefId: equipmentId,
        viewGroup: ViewGroup.EQUIPMENT,
      } as unknown as ViewInput);
      if (change.record) {
        try {
          const updated = await this.equipmentStatsEditor({
            _id: equipmentId,
            targetKey: 'equipmentViews',
            modifier: 1,
          });
          equipment.equipmentViews = updated.equipmentViews;
        } catch (error) {
          await this.compensate(change.undo, 'view');
          throw error;
        }
      }
      equipment.meLiked = await this.likeService.checkLikeExistence(
        this.likeInput(memberId, equipmentId),
      );
    }
    return this.output(equipment);
  }

  public async equipmentStatsEditor(input: {
    _id: MongoId;
    targetKey: EquipmentCounter;
    modifier: number;
  }): Promise<Equipment> {
    const { _id, targetKey, modifier } = input;
    if (
      !['equipmentViews', 'equipmentLikes', 'equipmentComments'].includes(
        targetKey,
      ) ||
      !Number.isInteger(modifier) ||
      ![-1, 1].includes(modifier)
    ) {
      throw new BadRequestException('Invalid equipment counter change');
    }
    const match: Record<string, unknown> = { _id };
    if (modifier > 0) match.equipmentStatus = { $in: visibleStatuses };
    // Deleted equipment records still receive decrements when comments are removed.
    if (modifier < 0) match[targetKey] = { $gte: -modifier };
    const equipment = await this.equipmentModel
      .findOneAndUpdate(
        match,
        { $inc: { [targetKey]: modifier } },
        { new: true },
      )
      .lean<Equipment>()
      .exec();
    if (!equipment)
      throw new ConflictException('Equipment counter could not be updated');
    return equipment;
  }

  public async getEquipments(
    memberId: MongoId | null,
    input: EquipmentsInquiry,
  ): Promise<Equipments> {
    const match: Record<string, unknown> = {
      equipmentStatus: { $in: visibleStatuses },
    };
    this.shapeMatchQuery(match, input);
    return await this.listEquipments(memberId, input, match);
  }

  private shapeMatchQuery(
    match: Record<string, unknown>,
    input: EquipmentsInquiry | AllEquipmentsInquiry,
  ): void {
    const { search } = input;
    if (search === null) throw new BadRequestException('Search cannot be null');
    if (!search) return;
    if (validateSync(plainToInstance(EquipmentSearch, search)).length)
      throw new BadRequestException('Invalid equipment search');
    if (search.resortId)
      match.resortId = validateMongoObjectId(search.resortId);
    if (search.categoryList?.length)
      match.equipmentCategory = { $in: search.categoryList };
    if (search.audienceList?.length) {
      const audiences = new Set(search.audienceList);
      if (
        audiences.has(EquipmentAudience.KIDS) ||
        audiences.has(EquipmentAudience.ADULTS)
      )
        audiences.add(EquipmentAudience.ALL);
      match.equipmentAudience = { $in: [...audiences] };
    }
    if (search.sizeList?.length) {
      if (search.categoryList?.length !== 1)
        throw new BadRequestException(
          'Size filtering requires exactly one category',
        );
      match.equipmentSize = {
        $in: search.sizeList.map((size) =>
          normalizeEquipmentSize(search.categoryList![0], size),
        ),
      };
    }
    const escape = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (search.equipmentBrand)
      match.equipmentBrand = {
        $regex: '^' + escape(search.equipmentBrand.trim()) + '$',
        $options: 'i',
      };
    if (search.text?.trim())
      match.equipmentName = {
        $regex: escape(search.text.trim()),
        $options: 'i',
      };
    if (search.equipmentPurchasable != null)
      match.equipmentPurchasable = search.equipmentPurchasable;
    const range = (value: { start: number; end: number }) => {
      if (value.start > value.end)
        throw new BadRequestException('Price range start must not exceed end');
      return { $gte: value.start, $lte: value.end };
    };
    if (search.rentalPricesRange && search.rentalDurationHours == null)
      throw new BadRequestException('Rental price filtering requires duration');
    if (search.rentalDurationHours != null) {
      const rate: Record<string, unknown> = {
        durationHours: search.rentalDurationHours,
      };
      if (search.rentalPricesRange)
        rate.price = range(search.rentalPricesRange);
      match.equipmentRentalRates = { $elemMatch: rate };
    }
    if (search.purchasePricesRange) {
      if (search.equipmentPurchasable === false)
        throw new BadRequestException(
          'Purchase price requires purchasable equipment',
        );
      match.equipmentPurchasable = true;
      match.equipmentPurchasePrice = range(search.purchasePricesRange);
    }
  }

  public getFavoriteEquipments(
    memberId: MongoId,
    input: EquipmentHistoryInquiry,
  ): Promise<Equipments> {
    this.validatePagination(input);
    return this.likeService.getFavoriteEquipments(memberId, input);
  }

  public getVisitedEquipments(
    memberId: MongoId,
    input: EquipmentHistoryInquiry,
  ): Promise<Equipments> {
    this.validatePagination(input);
    return this.viewService.getVisitedEquipments(memberId, input);
  }

  public async likeTargetEquipment(
    memberId: MongoId,
    equipmentId: MongoId,
  ): Promise<Equipment> {
    let equipment = await this.assertVisibleEquipment(equipmentId);
    const input = this.likeInput(memberId, equipmentId);
    const change = await this.likeService.toggleLikeWithChange(input);
    if (change.modifier !== 0) {
      try {
        equipment = await this.equipmentStatsEditor({
          _id: equipmentId,
          targetKey: 'equipmentLikes',
          modifier: change.modifier,
        });
      } catch (error) {
        await this.compensate(change.undo, 'like');
        throw error;
      }
    }
    equipment.meLiked = await this.likeService.checkLikeExistence(input);
    return this.output(equipment);
  }

  public async getAllEquipmentsByAdmin(
    adminId: MongoId,
    input: AllEquipmentsInquiry,
  ): Promise<Equipments> {
    await this.assertAdmin(adminId);
    const match: Record<string, unknown> = {};
    this.shapeMatchQuery(match, input);
    if (input.search?.equipmentStatus)
      match.equipmentStatus = input.search.equipmentStatus;
    return await this.listEquipments(null, input, match);
  }

  public async updateEquipmentByAdmin(
    adminId: MongoId,
    input: EquipmentUpdate,
  ): Promise<Equipment> {
    await this.assertAdmin(adminId);
    const original = await this.equipmentModel
      .findOne({ _id: input._id })
      .lean<Equipment>()
      .exec();
    if (!original) throw new NotFoundException('Equipment not found');
    const supplied = this.pickContent(input);
    if (
      input.equipmentPurchasable === false &&
      input.equipmentPurchasePrice === undefined
    )
      supplied.equipmentPurchasePrice = null;
    if (
      input.equipmentPurchasable === true &&
      !original.equipmentPurchasable &&
      input.equipmentPurchasePrice == null
    )
      throw new BadRequestException(
        'Enabling purchase requires price in the same update',
      );
    const normalized = this.normalizeContent({ ...original, ...supplied });
    const values: Record<string, unknown> = {};
    for (const key of Object.keys(supplied)) values[key] = normalized[key];
    const match: Record<string, unknown> = { _id: input._id };
    if (
      input.equipmentCategory !== undefined ||
      input.equipmentSize !== undefined
    ) {
      match.equipmentCategory = original.equipmentCategory;
      match.equipmentSize = original.equipmentSize ?? null;
      values.equipmentSize = normalized.equipmentSize;
    }
    if (
      input.equipmentPurchasable !== undefined ||
      input.equipmentPurchasePrice !== undefined
    ) {
      match.equipmentPurchasable = original.equipmentPurchasable;
      match.equipmentPurchasePrice = original.equipmentPurchasePrice ?? null;
    }
    if (input.resortId != null)
      await this.resortService.assertVisibleResort(
        normalized.resortId as MongoId,
      );
    const equipment = await this.equipmentModel
      .findOneAndUpdate(
        match,
        { $set: values },
        { new: true, runValidators: true },
      )
      .lean<Equipment>()
      .exec();
    if (!equipment)
      throw new ConflictException(
        'Equipment changed or was removed; retry with current values',
      );
    return this.output(equipment);
  }

  public async removeEquipmentByAdmin(
    adminId: MongoId,
    equipmentId: MongoId,
  ): Promise<Equipment> {
    await this.assertAdmin(adminId);
    const equipment = await this.equipmentModel
      .findOneAndDelete({ _id: equipmentId })
      .lean<Equipment>()
      .exec();
    if (!equipment) throw new NotFoundException('Equipment not found');
    return this.output(equipment);
  }

  public async assertVisibleEquipment(
    equipmentId: MongoId,
  ): Promise<Equipment> {
    const equipment = await this.equipmentModel
      .findOne({ _id: equipmentId, equipmentStatus: { $in: visibleStatuses } })
      .lean<Equipment>()
      .exec();
    if (!equipment) throw new NotFoundException('Equipment not found');
    return this.output(equipment);
  }

  public async commentRemoved(equipmentId: MongoId): Promise<void> {
    try {
      await this.equipmentStatsEditor({
        _id: equipmentId,
        targetKey: 'equipmentComments',
        modifier: -1,
      });
    } catch (error) {
      // Missing targets have no remaining counter; existing targets still require compensation.
      if (
        error instanceof ConflictException &&
        !(await this.equipmentModel.findOne({ _id: equipmentId }).lean().exec())
      )
        return;
      throw error;
    }
  }

  private async assertAdmin(adminId: MongoId): Promise<void> {
    const member = await this.memberModel
      .findOne({
        _id: adminId,
        memberType: MemberType.ADMIN,
        memberStatus: MemberStatus.ACTIVE,
      })
      .lean()
      .exec();
    if (!member) throw new ForbiddenException('Active ADMIN required');
  }

  private normalizeContent(
    input: EquipmentInput | EquipmentUpdate | Record<string, unknown>,
  ): Record<string, unknown> {
    const values = this.pickContent(input as EquipmentInput);
    const candidate = plainToInstance(EquipmentInput, {
      ...values,
      resortId:
        values.resortId == null
          ? null
          : validateMongoObjectId(values.resortId).toHexString(),
    });
    if (validateSync(candidate).length)
      throw new BadRequestException('Invalid equipment input');
    const rates = candidate.equipmentRentalRates;
    if (new Set(rates.map((rate) => rate.durationHours)).size !== rates.length)
      throw new BadRequestException('Duplicate rental duration');
    const purchasable = candidate.equipmentPurchasable;
    const price = candidate.equipmentPurchasePrice ?? null;
    if (purchasable ? price === null : price !== null)
      throw new BadRequestException(
        'Purchase price must match purchasable capability',
      );
    return {
      ...this.pickContent(candidate),
      resortId:
        candidate.resortId == null
          ? null
          : validateMongoObjectId(candidate.resortId),
      equipmentName: candidate.equipmentName.trim(),
      equipmentBrand: candidate.equipmentBrand?.trim() ?? null,
      equipmentSize: normalizeEquipmentSize(
        candidate.equipmentCategory,
        candidate.equipmentSize ?? null,
      ),
      equipmentRentalRates: rates
        .map((rate) => ({
          durationHours: rate.durationHours,
          price: rate.price,
        }))
        .sort((a, b) => a.durationHours - b.durationHours),
      equipmentPurchasePrice: price,
    };
  }

  private output(equipment: Equipment): Equipment {
    return {
      ...equipment,
      equipmentRentalRates: [...equipment.equipmentRentalRates].sort(
        (a, b) => a.durationHours - b.durationHours,
      ),
      meLiked: equipment.meLiked ?? [],
    };
  }

  private validatePagination(input: EquipmentHistoryInquiry): void {
    if (
      !Number.isInteger(input.page) ||
      input.page < 1 ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > 100
    )
      throw new BadRequestException('Invalid equipment pagination');
  }

  private async listEquipments(
    memberId: MongoId | null,
    input: EquipmentsInquiry | AllEquipmentsInquiry,
    match: Record<string, unknown>,
  ): Promise<Equipments> {
    if (
      !Number.isInteger(input.page) ||
      input.page < 1 ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > 100
    ) {
      throw new BadRequestException('Invalid equipment pagination');
    }
    const sortKey = input.sort ?? 'createdAt';
    const direction = input.direction ?? Direction.DESC;
    if (
      !availableEquipmentSorts.includes(sortKey) ||
      ![Direction.ASC, Direction.DESC].includes(direction)
    ) {
      throw new BadRequestException('Invalid equipment sort');
    }
    const sort = { [sortKey]: direction, _id: direction };
    const result = await this.equipmentModel
      .aggregate<Equipments>([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId, '$_id', LikeGroup.EQUIPMENT),
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    return {
      list: (result[0]?.list ?? []).map((item) => this.output(item)),
      metaCounter: result[0]?.metaCounter ?? [],
    };
  }

  private pickContent(
    input: EquipmentInput | EquipmentUpdate,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of contentFields) {
      if (input[key] !== undefined) result[key] = input[key];
    }
    return result;
  }

  private likeInput(memberId: MongoId, equipmentId: MongoId): LikeInput {
    return {
      memberId,
      likeRefId: equipmentId,
      likeGroup: LikeGroup.EQUIPMENT,
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
        `Equipment ${interaction} compensation failed; counters may need reconciliation`,
      );
    }
  }
}
