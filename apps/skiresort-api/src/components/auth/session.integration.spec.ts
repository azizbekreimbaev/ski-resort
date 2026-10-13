import { createConnection, Connection, Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { Member } from '../../libs/dto/member/member';
import MemberSchema from '../../schemas/Member.model';
import RefreshSessionSchema, {
  RefreshSession,
} from '../../schemas/RefreshSession.model';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { REFRESH_COOKIE } from './session.config';
import type { SessionContext } from './session.config';

jest.mock('uuid', () => ({ v4: () => 'fixture-image-id' }));
type CookieMock = jest.Mock<Response, [string, string, { expires: Date }]>;

// Explicit opt-in only. Never load .env, MONGO_DEV, MONGO_PROD or AppModule.
const testUri = process.env.SKIRESORT_TEST_MONGO_URI;
const integration = testUri ? describe : describe.skip;

integration('Refresh rotation isolated MongoDB', () => {
  const databaseName = `skiresort_session_test_${new Types.ObjectId().toHexString()}`;
  let connection: Connection;
  let sessions: Model<RefreshSession>;
  let service: SessionService;
  let member: Member;
  const previousEnvironment = { ...process.env };

  const context = (token?: string): SessionContext => ({
    req: {
      method: 'POST',
      headers: {
        'x-csrf-protection': '1',
        ...(token ? { cookie: `${REFRESH_COOKIE}=${token}` } : {}),
      },
    } as Request,
    res: { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response,
  });

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.AUTH_ALLOWED_ORIGINS;
    connection = await createConnection(testUri!, {
      dbName: databaseName,
      autoIndex: false,
    }).asPromise();
    const members = connection.model<Member>('Member', MemberSchema);
    sessions = connection.model<RefreshSession>(
      'RefreshSession',
      RefreshSessionSchema,
    );
    await sessions.createCollection();
    await sessions.createIndexes();
    member = await members.create({
      memberNick: 'fixture',
      memberPhone: 'fixture-phone',
      memberPassword: 'fixture-hash',
    });
    service = new SessionService(
      sessions,
      members,
      new AuthService(
        new JwtService({
          secret: 'isolated-test-key',
          signOptions: { expiresIn: 900 },
        }),
      ),
    );
  }, 30000);

  afterAll(async () => {
    process.env = previousEnvironment;
    if (!connection) return;
    try {
      if (
        connection.name !== databaseName ||
        !/^skiresort_session_test_[a-f\d]{24}$/.test(databaseName)
      )
        throw new Error('Refusing unexpected test database cleanup');
      await connection.dropDatabase();
    } finally {
      await connection.close();
    }
  });

  it('uses real atomic writes and invalidates the winner’s replacement on concurrent reuse', async () => {
    const created = context();
    await service.create(member, created);
    const token = (created.res.cookie as CookieMock).mock.calls[0][1];
    const requests = [context(token), context(token)];
    const results = await Promise.allSettled(
      requests.map((item) => service.refresh(item)),
    );
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.find((result) => result.status === 'rejected'),
    ).toMatchObject({
      reason: { extensions: { code: 'REFRESH_TOKEN_REUSED' } },
    });
    const winner = requests.find(
      (item) => (item.res.cookie as CookieMock).mock.calls.length,
    )!;
    const replacement = (winner.res.cookie as CookieMock).mock.calls[0][1];
    await expect(service.refresh(context(replacement))).rejects.toMatchObject({
      extensions: { code: 'REFRESH_TOKEN_REVOKED' },
    });
    expect(await sessions.countDocuments({ revokedAt: { $ne: null } })).toBe(1);
  });
});
