import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Model, Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import {
  AllFaqsInquiry,
  AllFaqSearch,
  FaqInput,
  FaqUpdate,
  FaqsInquiry,
} from '../../libs/dto/faq/faq.input';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { FaqStatus } from '../../libs/enums/faq.enum';
import { Direction } from '../../libs/enums/common.enum';
import { validateMongoObjectId } from '../../libs/config';

const contentFields = ['faqQuestion', 'faqAnswer', 'faqStatus'] as const;

@Injectable()
export class FaqService {
  constructor(
    @InjectModel('Faq') private readonly faqModel: Model<Faq>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
  ) {}

  private async assertAdmin(adminId: Types.ObjectId): Promise<void> {
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

  private content(input: FaqInput | FaqUpdate, update = false) {
    const dto = update
      ? plainToInstance(FaqUpdate, input)
      : plainToInstance(FaqInput, input);
    if (validateSync(dto).length)
      throw new BadRequestException('Invalid Faq input');
    const values = Object.fromEntries(
      contentFields
        .filter((key) => dto[key] !== undefined)
        .map((key) => [key, dto[key]]),
    ) as Partial<Faq>;
    return values;
  }

  async createFaq(adminId: Types.ObjectId, input: FaqInput): Promise<Faq> {
    await this.assertAdmin(adminId);
    const values = this.content(input);
    return (
      await this.faqModel.create({ ...values, memberId: adminId })
    ).toObject();
  }

  async updateFaqByAdmin(
    adminId: Types.ObjectId,
    input: FaqUpdate,
  ): Promise<Faq> {
    await this.assertAdmin(adminId);
    const id = validateMongoObjectId(input._id);
    const values = this.content(input, true);
    if (!Object.keys(values).length)
      throw new BadRequestException('No Faq fields supplied');
    const filter: FilterQuery<Faq> = { _id: id };
    const faq = await this.faqModel
      .findOneAndUpdate(
        filter,
        { $set: values },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();
    if (!faq) {
      throw new NotFoundException('Faq not found');
    }
    return faq;
  }

  async removeFaqByAdmin(adminId: Types.ObjectId, faqId: string): Promise<Faq> {
    await this.assertAdmin(adminId);
    const faq = await this.faqModel
      .findOneAndDelete({ _id: validateMongoObjectId(faqId) })
      .lean()
      .exec();
    if (!faq) throw new NotFoundException('Faq not found');
    return faq;
  }

  async getFaq(faqId: string): Promise<Faq> {
    return this.detail(faqId, false);
  }

  async getFaqByAdmin(adminId: Types.ObjectId, faqId: string): Promise<Faq> {
    await this.assertAdmin(adminId);
    return this.detail(faqId, true);
  }

  private async detail(faqId: string, admin: boolean): Promise<Faq> {
    const faq = await this.faqModel
      .findOne({
        _id: validateMongoObjectId(faqId),
        ...(admin ? {} : { faqStatus: FaqStatus.PUBLISHED }),
      })
      .lean()
      .exec();
    if (!faq) throw new NotFoundException('Faq not found');
    return faq;
  }

  async getFaqs(input: FaqsInquiry): Promise<Faqs> {
    return this.list(input, false);
  }

  async getAllFaqsByAdmin(
    adminId: Types.ObjectId,
    input: AllFaqsInquiry,
  ): Promise<Faqs> {
    await this.assertAdmin(adminId);
    return this.list(input, true);
  }

  private async list(
    input: FaqsInquiry | AllFaqsInquiry,
    admin: boolean,
  ): Promise<Faqs> {
    const dto = admin
      ? plainToInstance(AllFaqsInquiry, input)
      : plainToInstance(FaqsInquiry, input);
    if (validateSync(dto).length)
      throw new BadRequestException('Invalid Faq inquiry');
    const filter: FilterQuery<Faq> = {};
    if (!admin) filter.faqStatus = FaqStatus.PUBLISHED;
    else if (dto.search instanceof AllFaqSearch && dto.search.faqStatus)
      filter.faqStatus = dto.search.faqStatus;
    if (dto.search?.text) {
      const text = dto.search.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['faqQuestion', 'faqAnswer'].map((field) => ({
        [field]: { $regex: text, $options: 'i' },
      }));
    }
    const direction = dto.direction ?? Direction.DESC;
    const [result] = await this.faqModel
      .aggregate<Faqs>([
        { $match: filter },
        { $sort: { [dto.sort ?? 'createdAt']: direction, _id: direction } },
        {
          $facet: {
            list: [
              { $skip: (dto.page - 1) * dto.limit },
              { $limit: dto.limit },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    return result ?? { list: [], metaCounter: [] };
  }
}
