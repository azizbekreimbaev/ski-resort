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
  FaqsInquiry,
} from '../../libs/dto/faq/faq.input';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
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

  public async createFaq(
    adminId: Types.ObjectId,
    input: FaqInput,
  ): Promise<Faq> {
    await this.assertAdmin(adminId);
    const values = this.content(input);
    const result = await this.faqModel.create({ ...values, memberId: adminId });
    return result.toObject();
  }

  public async getFaq(faqId: string): Promise<Faq> {
    return await this.detail(faqId, false);
  }

  public async getFaqs(input: FaqsInquiry): Promise<Faqs> {
    return await this.list(input, false);
  }

  public async getAllFaqsByAdmin(
    adminId: Types.ObjectId,
    input: AllFaqsInquiry,
  ): Promise<Faqs> {
    await this.assertAdmin(adminId);
    return await this.list(input, true);
  }

  public async getFaqByAdmin(
    adminId: Types.ObjectId,
    faqId: string,
  ): Promise<Faq> {
    await this.assertAdmin(adminId);
    return await this.detail(faqId, true);
  }

  public async updateFaqByAdmin(
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

  public async removeFaqByAdmin(
    adminId: Types.ObjectId,
    faqId: string,
  ): Promise<Faq> {
    await this.assertAdmin(adminId);
    const faq = await this.faqModel
      .findOneAndDelete({ _id: validateMongoObjectId(faqId) })
      .lean()
      .exec();
    if (!faq) throw new NotFoundException('Faq not found');
    return faq;
  }

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

  private content(input: FaqInput | FaqUpdate, update = false): Partial<Faq> {
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

  private async detail(faqId: string, admin: boolean): Promise<Faq> {
    const search: FilterQuery<Faq> = {
      _id: validateMongoObjectId(faqId),
      ...(admin ? {} : { faqStatus: FaqStatus.PUBLISHED }),
    };
    const faq = await this.faqModel.findOne(search).lean().exec();
    if (!faq) throw new NotFoundException('Faq not found');
    return faq;
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
    const match: FilterQuery<Faq> = {};
    if (!admin) match.faqStatus = FaqStatus.PUBLISHED;
    else if (dto.search instanceof AllFaqSearch && dto.search.faqStatus)
      match.faqStatus = dto.search.faqStatus;
    if (dto.search?.text) {
      const text = dto.search.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.$or = ['faqQuestion', 'faqAnswer'].map((field) => ({
        [field]: { $regex: text, $options: 'i' },
      }));
    }
    const direction = dto.direction ?? Direction.DESC;
    const sort = { [dto.sort ?? 'createdAt']: direction, _id: direction };
    const [result] = await this.faqModel
      .aggregate<Faqs>([
        { $match: match },
        { $sort: sort },
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
