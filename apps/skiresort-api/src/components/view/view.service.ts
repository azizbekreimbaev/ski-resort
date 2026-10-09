import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { ObjectId } from 'mongoose';
import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';
import { EquipmentHistoryInquiry } from '../../libs/dto/equipment/equipment.input';
import { EquipmentStatus } from '../../libs/enums/equipment.enum';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ResortHistoryInquiry } from '../../libs/dto/resort/resort.input';
import { Resort, Resorts } from '../../libs/dto/resort/resort';
import { TotalCounter } from '../../libs/dto/member/member';
import { lookupAuthMemberLiked, lookupVisit } from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ResortStatus } from '../../libs/enums/resort.enum';
import { Message } from '../../libs/enums/common.enum';

export interface ViewChange {
  record: View | null;
  undo: () => Promise<void>;
}

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

  public async recordView(input: ViewInput): Promise<View | null> {
    return (await this.recordViewWithChange(input)).record;
  }

  public async recordViewWithChange(input: ViewInput): Promise<ViewChange> {
    const search = {
      memberId: input.memberId,
      viewRefId: input.viewRefId,
      viewGroup: input.viewGroup,
    };
    if (await this.viewModel.findOne(search).exec()) {
      return { record: null, undo: () => Promise.resolve() };
    }
    try {
      const created = await this.viewModel.create(input);
      let removal: Promise<void> | undefined;
      return {
        record: created,
        undo: () =>
          (removal ??= this.viewModel
            .deleteOne({ _id: created._id })
            .exec()
            .then(() => undefined)),
      };
    } catch (err) {
      if (
        (err as { code?: number } | null)?.code === 11000 &&
        (await this.viewModel.findOne(search).exec())
      ) {
        return { record: null, undo: () => Promise.resolve() };
      }
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getVisitedResorts(
    memberId: ObjectId | Types.ObjectId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts> {
    const { page, limit } = input;
    const match = { viewGroup: ViewGroup.RESORT, memberId };
    const data = await this.viewModel
      .aggregate<{
        list: { visitedResort: Resort }[];
        metaCounter: TotalCounter[];
      }>([
        { $match: match },
        { $sort: { createdAt: -1, _id: -1 } },
        {
          $lookup: {
            from: 'resorts',
            localField: 'viewRefId',
            foreignField: '_id',
            as: 'visitedResort',
          },
        },
        { $unwind: '$visitedResort' },
        {
          $match: {
            'visitedResort.resortStatus': {
              $in: [ResortStatus.ACTIVE, ResortStatus.SOLD_OUT],
            },
          },
        },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupVisit,
              {
                $unwind: {
                  path: '$visitedResort.memberData',
                  preserveNullAndEmptyArrays: true,
                },
              },
              lookupAuthMemberLiked(
                memberId,
                '$visitedResort._id',
                LikeGroup.RESORT,
              ),
              { $set: { 'visitedResort.meLiked': '$meLiked' } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    const result: Resorts = {
      list: (data[0]?.list ?? []).map((entry) => entry.visitedResort),
      metaCounter: data[0]?.metaCounter ?? [],
    };
    return result;
  }
  public async getVisitedEquipments(
    memberId: ObjectId | Types.ObjectId,
    input: EquipmentHistoryInquiry,
  ): Promise<Equipments> {
    const { page, limit } = input;
    const match = { viewGroup: ViewGroup.EQUIPMENT, memberId };
    const data = await this.viewModel
      .aggregate<{
        list: { visitedEquipment: Equipment }[];
        metaCounter: TotalCounter[];
      }>([
        { $match: match },
        { $sort: { createdAt: -1, _id: -1 } },
        {
          $lookup: {
            from: 'equipments',
            localField: 'viewRefId',
            foreignField: '_id',
            as: 'visitedEquipment',
          },
        },
        { $unwind: '$visitedEquipment' },
        {
          $match: {
            'visitedEquipment.equipmentStatus': {
              $in: [EquipmentStatus.AVAILABLE],
            },
          },
        },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupAuthMemberLiked(
                memberId,
                '$visitedEquipment._id',
                LikeGroup.EQUIPMENT,
              ),
              { $set: { 'visitedEquipment.meLiked': '$meLiked' } },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    const result: Equipments = {
      list: (data[0]?.list ?? []).map((entry) => ({
        ...entry.visitedEquipment,
        equipmentRentalRates: [
          ...entry.visitedEquipment.equipmentRentalRates,
        ].sort((a, b) => a.durationHours - b.durationHours),
      })),
      metaCounter: data[0]?.metaCounter ?? [],
    };
    return result;
  }
}
