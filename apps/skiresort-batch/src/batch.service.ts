import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { Member } from '../../skiresort-api/src/libs/dto/member/member';
import { MemberStatus, MemberType } from '../../skiresort-api/src/libs/enums/member.enum';
@Injectable()
export class BatchService {
  constructor(
    @InjectModel("Member") private readonly memberModel: Model<Member>
  ) { }

  public async batchRollback(): Promise<void> {
    await this.memberModel
      .updateMany(
        {
          memberStatus: MemberStatus.ACTIVE,
          memberType: MemberType.AGENT,
        },
        { memberRank: 0 },
      )
      .exec();
  }

  public async batchTopAgents(): Promise<void> {
    const agents: Member[] = await this.memberModel
      .find({
        memberType: MemberType.AGENT,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();

    const promisedList = agents.map(async (ele: Member) => {
      const { _id, memberProperties, memberLikes, memberArticles, memberViews } = ele;
      const rank = memberProperties * 4 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
      return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
    });
    await Promise.all(promisedList);
  }


  getHello(): string {
    return 'Welcome to SKIRESORT BATCH  server!';
  }
}
