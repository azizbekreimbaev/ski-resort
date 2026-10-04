import 'reflect-metadata';
import { Types } from 'mongoose';
import { SCHEDULE_CRON_OPTIONS } from '@nestjs/schedule/dist/schedule.constants';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import {
  MemberStatus,
  MemberType,
} from '../../skiresort-api/src/libs/enums/member.enum';
import { BATCH_ROLLBACK, BATCH_TOP_INSTRUCTORS } from './lib/config';

describe('Member-only scheduled batch', () => {
  it('rolls back only active Instructor member ranks', async () => {
    const exec = jest.fn().mockResolvedValue({});
    const model = { updateMany: jest.fn().mockReturnValue({ exec }) };
    await new BatchService(
      model as unknown as ConstructorParameters<typeof BatchService>[0],
    ).batchRollback();
    expect(model.updateMany).toHaveBeenCalledTimes(1);
    expect(model.updateMany).toHaveBeenCalledWith(
      { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.INSTRUCTOR },
      { memberRank: 0 },
    );
    expect(exec).toHaveBeenCalledTimes(1);
  });

  it('keeps the existing Instructor ranking formula and awaits every update', async () => {
    const instructorId = new Types.ObjectId();
    let finish: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const model = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: instructorId,
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
      .batchTopInstructors()
      .then(() => {
        completed = true;
      });
    await Promise.resolve();
    await Promise.resolve();
    expect(completed).toBe(false);
    expect(model.find).toHaveBeenCalledWith({
      memberType: MemberType.INSTRUCTOR,
      memberStatus: MemberStatus.ACTIVE,
      memberRank: 0,
    });
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(instructorId, {
      memberRank: 22,
    });
    finish();
    await run;
    expect(completed).toBe(true);
  });

  it('exposes only the retained rollback and Instructor ranking cron methods', () => {
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
          'batchTopInstructors',
        )?.value as object,
      ),
    ).toEqual({ name: BATCH_TOP_INSTRUCTORS, cronTime: '40 00 01 * * *' });
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
