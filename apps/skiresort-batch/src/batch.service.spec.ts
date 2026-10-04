import 'reflect-metadata';
import { Types } from 'mongoose';
import { SCHEDULE_CRON_OPTIONS } from '@nestjs/schedule/dist/schedule.constants';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import {
  MemberStatus,
  MemberType,
} from '../../skiresort-api/src/libs/enums/member.enum';
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS } from './lib/config';

describe('Member-only scheduled batch', () => {
  it('rolls back only active Agent member ranks', async () => {
    const exec = jest.fn().mockResolvedValue({});
    const model = { updateMany: jest.fn().mockReturnValue({ exec }) };
    await new BatchService(
      model as unknown as ConstructorParameters<typeof BatchService>[0],
    ).batchRollback();
    expect(model.updateMany).toHaveBeenCalledTimes(1);
    expect(model.updateMany).toHaveBeenCalledWith(
      { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.AGENT },
      { memberRank: 0 },
    );
    expect(exec).toHaveBeenCalledTimes(1);
  });

  it('keeps the existing Agent ranking formula and awaits every update', async () => {
    const agentId = new Types.ObjectId();
    let finish: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const model = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: agentId,
            memberProperties: 2,
            memberArticles: 3,
            memberLikes: 4,
            memberViews: 5,
          },
        ]),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue(pending),
    };
    let completed = false;
    const run = new BatchService(
      model as unknown as ConstructorParameters<typeof BatchService>[0],
    )
      .batchTopAgents()
      .then(() => {
        completed = true;
      });
    await Promise.resolve();
    await Promise.resolve();
    expect(completed).toBe(false);
    expect(model.find).toHaveBeenCalledWith({
      memberType: MemberType.AGENT,
      memberStatus: MemberStatus.ACTIVE,
      memberRank: 0,
    });
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(agentId, {
      memberRank: 30,
    });
    finish();
    await run;
    expect(completed).toBe(true);
  });

  it('exposes only the retained rollback and Agent ranking cron methods', () => {
    expect(
      Reflect.getMetadata(
        SCHEDULE_CRON_OPTIONS,
        Object.getOwnPropertyDescriptor(
          BatchController.prototype,
          'batchRollback',
        )?.value as object,
      ),
    ).toEqual({ name: BATCH_ROLLBACK, cronTime: '00 00 01 * * *' });
    expect(
      Reflect.getMetadata(
        SCHEDULE_CRON_OPTIONS,
        Object.getOwnPropertyDescriptor(
          BatchController.prototype,
          'batchTopAgents',
        )?.value as object,
      ),
    ).toEqual({ name: BATCH_TOP_AGENTS, cronTime: '40 00 01 * * *' });
    expect(Object.getOwnPropertyNames(BatchController.prototype)).not.toContain(
      'batchTopProperties',
    );
    expect(Object.getOwnPropertyNames(BatchService.prototype)).not.toContain(
      'batchTopProperties',
    );
    expect(Reflect.getMetadata('self:paramtypes', BatchService)).toEqual([
      { index: 0, param: 'MemberModel' },
    ]);
  });

  it('retains the root greeting without database or scheduler startup', () => {
    expect(
      new BatchService(
        {} as unknown as ConstructorParameters<typeof BatchService>[0],
      ).getHello(),
    ).toBe('Welcome to SKIRESORT BATCH  server!');
  });
});
