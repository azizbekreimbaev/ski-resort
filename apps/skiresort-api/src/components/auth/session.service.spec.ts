import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import type { Request, Response } from 'express';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import type { RefreshSession } from '../../schemas/RefreshSession.model';
import {
  REFRESH_COOKIE,
  SessionContext,
  sessionConfig,
  assertSessionRequest,
  refreshCookie,
} from './session.config';
import { Test } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import type { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import request from 'supertest';
import { SessionResolver } from './session.resolver';
import { MemberResolver } from '../member/member.resolver';
import { MemberService } from '../member/member.service';
import { formatGraphQLError } from '../../libs/graphql-error';
import { LoggingInterceptor } from '../../libs/interceptor/Logging.interceptor';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

const hash = (token: string) =>
  createHash('sha256').update(token).digest('hex');
type CookieMock = jest.Mock<Response, [string, string, { expires: Date }]>;
interface SessionFilter {
  $or?: SessionFilter[];
  _id?: Types.ObjectId;
  memberId?: Types.ObjectId;
  tokenHash?: string;
  consumedHashes?: string;
  revokedAt?: Date | null;
  expiresAt?: { $gt: Date };
}
interface SessionUpdate {
  $set?: Partial<RefreshSession>;
  $push?: { consumedHashes: string };
}
interface AuthResponse {
  data: {
    result: { accessToken: string };
    refreshToken: { accessToken: string };
    login: { accessToken: string };
    logout: boolean;
    chechAuth: string;
  };
  errors?: { extensions: { code: string } }[];
}

// The fixture executes each conditional write synchronously, modeling CAS rather than
// returning canned successes. Real MongoDB concurrency has a separate opt-in suite.
export function sessionFixture() {
  const rows: RefreshSession[] = [];
  const matches = (row: RefreshSession, filter: SessionFilter): boolean => {
    if (filter.$or && !filter.$or.some((part) => matches(row, part)))
      return false;
    if (filter._id && row._id.toString() !== filter._id.toString())
      return false;
    if (
      filter.memberId &&
      row.memberId.toString() !== filter.memberId.toString()
    )
      return false;
    if (filter.tokenHash && row.tokenHash !== filter.tokenHash) return false;
    if (
      filter.consumedHashes &&
      !row.consumedHashes.includes(filter.consumedHashes)
    )
      return false;
    if ('revokedAt' in filter && row.revokedAt !== filter.revokedAt)
      return false;
    if (filter.expiresAt && row.expiresAt <= filter.expiresAt.$gt) return false;
    return true;
  };
  const query = (run: () => unknown) => ({
    exec: () => Promise.resolve(run()),
  });
  const apply = (row: RefreshSession, update: SessionUpdate) => {
    Object.assign(row, update.$set);
    if (update.$push) row.consumedHashes.push(update.$push.consumedHashes);
  };
  const model = {
    create: jest.fn((input: Partial<RefreshSession>) => {
      const row = {
        _id: new Types.ObjectId(),
        consumedHashes: [],
        revokedAt: null,
        revocationReason: null,
        rotatedAt: null,
        ...input,
      } as RefreshSession;
      rows.push(row);
      return Promise.resolve(row);
    }),
    findOne: jest.fn((filter: SessionFilter) =>
      query(() => {
        const row = rows.find((item) => matches(item, filter));
        return row ? { ...row, consumedHashes: [...row.consumedHashes] } : null;
      }),
    ),
    findById: jest.fn((id: Types.ObjectId) =>
      query(() => rows.find((row) => row._id.equals(id)) ?? null),
    ),
    findOneAndUpdate: jest.fn((filter: SessionFilter, update: SessionUpdate) =>
      query(() => {
        const row = rows.find((item) => matches(item, filter));
        if (!row) return null;
        apply(row, update);
        return { ...row };
      }),
    ),
    updateOne: jest.fn((filter: SessionFilter, update: SessionUpdate) =>
      query(() => {
        const row = rows.find((item) => matches(item, filter));
        if (row) apply(row, update);
        return { modifiedCount: row ? 1 : 0 };
      }),
    ),
    updateMany: jest.fn((filter: SessionFilter, update: SessionUpdate) =>
      query(() => {
        rows
          .filter((row) => matches(row, filter))
          .forEach((row) => apply(row, update));
      }),
    ),
  };
  const member = {
    _id: new Types.ObjectId(),
    memberNick: 'fixture',
    memberStatus: MemberStatus.ACTIVE,
    memberType: MemberType.USER,
  } as unknown as Member;
  const members = {
    findById: jest.fn(() => ({ exec: () => Promise.resolve(member) })),
  };
  const auth = new AuthService(
    new JwtService({
      secret: 'isolated-test-key',
      signOptions: { expiresIn: 900 },
    }),
  );
  const service = new SessionService(model as never, members as never, auth);
  return { rows, model, member, members, auth, service };
}

export function browserContext(token?: string) {
  const cookieSpy = jest.fn();
  const clearCookieSpy = jest.fn();
  return {
    req: {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
        'x-csrf-protection': '1',
        ...(token ? { cookie: `${REFRESH_COOKIE}=${token}` } : {}),
      },
    } as Request,
    res: {
      cookie: cookieSpy,
      clearCookie: clearCookieSpy,
    } as unknown as Response,
    cookieSpy,
    clearCookieSpy,
  };
}

describe('Refresh sessions', () => {
  let fixture: ReturnType<typeof sessionFixture>;
  let token: string;
  const env = { ...process.env };
  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.AUTH_ALLOWED_ORIGINS;
    delete process.env.AUTH_COOKIE_DOMAIN;
    fixture = sessionFixture();
    const context = browserContext();
    await fixture.service.create(fixture.member, context);
    token = (context.res.cookie as CookieMock).mock.calls[0][1];
  });
  afterAll(() => {
    process.env = env;
  });

  it('stores only a cryptographic hash and sets the browser cookie', () => {
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(fixture.rows[0].tokenHash).toBe(hash(token));
    expect(JSON.stringify(fixture.rows)).not.toContain(token);
    expect(sessionConfig()).toMatchObject({
      accessSeconds: 900,
      refreshSeconds: 2592000,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/graphql',
      },
    });
  });

  it('rotates, preserves absolute expiry and verifies the new access token', async () => {
    const context = browserContext(token);
    const expires = fixture.rows[0].expiresAt;
    const result = await fixture.service.refresh(context);
    expect((await fixture.auth.verifyAuth(result.accessToken)).memberNick).toBe(
      'fixture',
    );
    const [, replacement, options] = (context.res.cookie as CookieMock).mock
      .calls[0];
    expect(replacement).not.toBe(token);
    expect(options.expires).toEqual(expires);
    expect(fixture.rows[0].consumedHashes).toEqual([hash(token)]);
    await expect(
      fixture.service.refresh(browserContext(replacement)),
    ).resolves.toHaveProperty('accessToken');
  });

  it('revokes the family on reuse while leaving another device alone', async () => {
    const other = browserContext();
    await fixture.service.create(fixture.member, other);
    const rotated = browserContext(token);
    await fixture.service.refresh(rotated);
    await expect(
      fixture.service.refresh(browserContext(token)),
    ).rejects.toMatchObject({ extensions: { code: 'REFRESH_TOKEN_REUSED' } });
    const replacement = (rotated.res.cookie as CookieMock).mock.calls[0][1];
    await expect(
      fixture.service.refresh(browserContext(replacement)),
    ).rejects.toMatchObject({ extensions: { code: 'REFRESH_TOKEN_REVOKED' } });
    await expect(
      fixture.service.refresh(
        browserContext((other.res.cookie as CookieMock).mock.calls[0][1]),
      ),
    ).resolves.toHaveProperty('accessToken');
  });

  it.each(['missing', 'malformed', 'unknown', 'expired', 'revoked'])(
    'reports and clears %s tokens',
    async (kind) => {
      const context = browserContext(
        kind === 'missing'
          ? undefined
          : kind === 'malformed'
            ? 'bad'
            : kind === 'unknown'
              ? 'a'.repeat(43)
              : token,
      );
      if (kind === 'expired') fixture.rows[0].expiresAt = new Date(0);
      if (kind === 'revoked') fixture.rows[0].revokedAt = new Date();
      const code =
        kind === 'expired'
          ? 'REFRESH_TOKEN_EXPIRED'
          : kind === 'revoked'
            ? 'REFRESH_TOKEN_REVOKED'
            : 'REFRESH_TOKEN_INVALID';
      await expect(fixture.service.refresh(context)).rejects.toMatchObject({
        extensions: { code },
      });
      expect(context.clearCookieSpy).toHaveBeenCalledWith(
        REFRESH_COOKIE,
        sessionConfig().cookie,
      );
      expect(context.cookieSpy).not.toHaveBeenCalled();
    },
  );

  it.each([MemberStatus.BLOCK, MemberStatus.DELETE])(
    'denies %s members and revokes all devices',
    async (status) => {
      await fixture.service.create(fixture.member, browserContext());
      fixture.member.memberStatus = status;
      await expect(
        fixture.service.refresh(browserContext(token)),
      ).rejects.toMatchObject({
        extensions: {
          code:
            status === MemberStatus.BLOCK
              ? 'MEMBER_BLOCKED'
              : 'REFRESH_TOKEN_REVOKED',
        },
      });
      expect(fixture.rows.every((row) => row.revokedAt)).toBe(true);
    },
  );

  it('revokes logout and clears the matching cookie idempotently', async () => {
    const context = browserContext(token);
    expect(await fixture.service.logout(context)).toBe(true);
    expect(await fixture.service.logout(context)).toBe(true);
    expect(await fixture.service.logout(browserContext())).toBe(true);
    expect(context.clearCookieSpy).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      sessionConfig().cookie,
    );
    await expect(
      fixture.service.refresh(browserContext(token)),
    ).rejects.toMatchObject({ extensions: { code: 'REFRESH_TOKEN_REVOKED' } });
  });

  it('allows one concurrent rotation and revokes its replacement on duplicate reuse', async () => {
    const contexts = [browserContext(token), browserContext(token)];
    const results = await Promise.allSettled(
      contexts.map((context) => fixture.service.refresh(context)),
    );
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.find((result) => result.status === 'rejected'),
    ).toMatchObject({
      reason: { extensions: { code: 'REFRESH_TOKEN_REUSED' } },
    });
    const winner = contexts.find(
      (context) => (context.res.cookie as CookieMock).mock.calls.length,
    )!;
    const replacement = (winner.res.cookie as CookieMock).mock.calls[0][1];
    await expect(
      fixture.service.refresh(browserContext(replacement)),
    ).rejects.toMatchObject({ extensions: { code: 'REFRESH_TOKEN_REVOKED' } });
  });

  it('does not consume tokens on signing or database errors', async () => {
    jest
      .spyOn(fixture.auth, 'createToken')
      .mockRejectedValue(new Error('unavailable'));
    const context = browserContext(token);
    await expect(fixture.service.refresh(context)).rejects.toThrow(
      'unavailable',
    );
    expect(fixture.rows[0].tokenHash).toBe(hash(token));
    expect(context.clearCookieSpy).not.toHaveBeenCalled();
  });
});

describe('Session request security and config', () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env = { ...env, NODE_ENV: 'test' };
    delete process.env.AUTH_ALLOWED_ORIGINS;
  });
  afterAll(() => {
    process.env = env;
  });
  it.each(['origin', 'header', 'method'])('rejects invalid %s', (field) => {
    const { req } = browserContext();
    if (field === 'origin') req.headers.origin = 'http://attacker.example';
    if (field === 'header') delete req.headers['x-csrf-protection'];
    if (field === 'method') req.method = 'GET';
    expect(() => assertSessionRequest(req)).toThrow('CSRF_FAILED');
  });
  it('permits explicit originless API clients and rejects duplicate cookies', () => {
    const { req } = browserContext();
    delete req.headers.origin;
    expect(() => assertSessionRequest(req)).not.toThrow();
    req.headers.cookie = `${REFRESH_COOKIE}=${'a'.repeat(43)}; ${REFRESH_COOKIE}=${'b'.repeat(43)}`;
    expect(refreshCookie(req)).toBeUndefined();
  });
  it('requires exact HTTPS production origins and uses Secure/domain settings', () => {
    process.env.NODE_ENV = 'production';
    expect(() => sessionConfig()).toThrow('AUTH_ALLOWED_ORIGINS');
    process.env.AUTH_ALLOWED_ORIGINS = 'http://example.com';
    expect(() => sessionConfig()).toThrow();
    process.env.AUTH_ALLOWED_ORIGINS = 'https://app.example.com';
    process.env.AUTH_COOKIE_DOMAIN = 'example.com';
    expect(sessionConfig().cookie).toMatchObject({
      secure: true,
      domain: 'example.com',
    });
  });
  it.each(['0', '-1', 'abc', '1.2'])(
    'rejects invalid lifetimes %s',
    (value) => {
      process.env.ACCESS_TOKEN_TTL_SECONDS = value;
      expect(() => sessionConfig()).toThrow('ACCESS_TOKEN_TTL_SECONDS');
      delete process.env.ACCESS_TOKEN_TTL_SECONDS;
      process.env.REFRESH_TOKEN_TTL_SECONDS = value;
      expect(() => sessionConfig()).toThrow('REFRESH_TOKEN_TTL_SECONDS');
    },
  );
});

describe('Session GraphQL browser flow', () => {
  let app: INestApplication;
  let fixture: ReturnType<typeof sessionFixture>;
  let logs: jest.SpyInstance;
  const env = { ...process.env };
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.AUTH_ALLOWED_ORIGINS;
    delete process.env.ACCESS_TOKEN_TTL_SECONDS;
    delete process.env.REFRESH_TOKEN_TTL_SECONDS;
    fixture = sessionFixture();
    const password = await fixture.auth.hashPassword('password');
    fixture.member.memberPassword = password;
    const foundMember = {
      select: () => foundMember,
      exec: () => Promise.resolve(fixture.member),
    };
    const memberModel = {
      findOne: () => foundMember,
      create: () => Promise.resolve(fixture.member),
    };
    const memberService = new MemberService(
      memberModel as never,
      {} as never,
      fixture.auth,
      {} as never,
      {} as never,
      {} as never,
      {
        verifyGoogleToken: jest
          .fn()
          .mockResolvedValue({ uid: 'fixture-google' }),
      },
      fixture.service,
    );
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
          csrfPrevention: true,
          context: ({ req, res }: SessionContext) => ({ req, res }),
          formatError: formatGraphQLError,
        }),
      ],
      providers: [
        MemberResolver,
        SessionResolver,
        { provide: MemberService, useValue: memberService },
        { provide: SessionService, useValue: fixture.service },
        { provide: AuthService, useValue: fixture.auth },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.enableCors({ origin: sessionConfig().origins, credentials: true });
    app.useGlobalInterceptors(new LoggingInterceptor());
    logs = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
    jest.restoreAllMocks();
    process.env = env;
  });
  const send = (query: string, cookie?: string) => {
    const call = request(app.getHttpServer())
      .post('/graphql')
      .set('Origin', 'http://localhost:3000')
      .set('X-CSRF-Protection', '1');
    if (cookie) call.set('Cookie', cookie);
    return call.send({ query }).then((response) => ({
      ...response,
      body: response.body as AuthResponse,
    }));
  };

  it.each([
    'login(input: {memberNick: "fixture", memberPassword: "password"})',
    'signup(input: {memberNick: "fixture", memberPassword: "password", memberPhone: "010"})',
    'googleLogin(input: {idToken: "firebase-token"})',
  ])(
    'creates a cookie during %s and preserves Member.accessToken',
    async (operation) => {
      const response = await send(
        `mutation { result: ${operation} { _id accessToken } }`,
      );
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.result.accessToken).toEqual(expect.any(String));
      const cookie = response.headers['set-cookie'][0];
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/graphql');
      expect(cookie).not.toContain('Domain=');
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000',
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      const renewed = await send(
        'mutation { refreshToken { accessToken } }',
        cookie.split(';')[0],
      );
      expect(renewed.body.errors).toBeUndefined();
      const accessToken = renewed.body.data.refreshToken.accessToken;
      const protectedResponse = await request(
        app.getHttpServer() as import('http').Server,
      )
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query: '{ chechAuth }' });
      expect((protectedResponse.body as AuthResponse).data.chechAuth).toBe(
        'hi fixture',
      );
    },
  );

  it('returns stable refresh/logout errors and clears cookies', async () => {
    const login = await send(
      'mutation { login(input: {memberNick: "fixture", memberPassword: "password"}) { accessToken } }',
    );
    const original = login.headers['set-cookie'][0].split(';')[0];
    const renewed = await send(
      'mutation { refreshToken { accessToken } }',
      original,
    );
    const replacement = renewed.headers['set-cookie'][0].split(';')[0];
    const reused = await send(
      'mutation { refreshToken { accessToken } }',
      original,
    );
    expect(reused.body.errors?.[0].extensions.code).toBe(
      'REFRESH_TOKEN_REUSED',
    );
    expect(reused.headers['set-cookie'][0]).toContain(
      'Expires=Thu, 01 Jan 1970',
    );
    const revoked = await send(
      'mutation { refreshToken { accessToken } }',
      replacement,
    );
    expect(revoked.body.errors?.[0].extensions.code).toBe(
      'REFRESH_TOKEN_REVOKED',
    );
    const logout = await send('mutation { logout }', replacement);
    expect(logout.body.data.logout).toBe(true);
    expect(logout.headers['set-cookie'][0]).toContain('Path=/graphql');
    const missing = await send('mutation { refreshToken { accessToken } }');
    expect(missing.body.errors?.[0].extensions.code).toBe(
      'REFRESH_TOKEN_INVALID',
    );
  });

  it('rejects browser session operations without CSRF headers or with foreign origins', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Origin', 'http://localhost:3000')
      .send({ query: 'mutation { logout }' });
    expect((response.body as AuthResponse).errors?.[0].extensions.code).toBe(
      'CSRF_FAILED',
    );
    const foreign = await request(app.getHttpServer())
      .post('/graphql')
      .set('Origin', 'http://attacker.example')
      .set('X-CSRF-Protection', '1')
      .send({
        query:
          'mutation { login(input: {memberNick: "fixture", memberPassword: "password"}) { accessToken } }',
      });
    expect((foreign.body as AuthResponse).errors?.[0].extensions.code).toBe(
      'CSRF_FAILED',
    );
    expect(foreign.headers['set-cookie']).toBeUndefined();
  });

  it('distinguishes expired/invalid access tokens from permissions and never logs tokens', async () => {
    const jwt = new JwtService({ secret: 'isolated-test-key' });
    const expired = jwt.sign(
      { _id: (fixture.member._id as unknown as Types.ObjectId).toHexString() },
      { expiresIn: -1 },
    );
    const expiredResult = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${expired}`)
      .send({ query: '{ chechAuth }' });
    expect(
      (expiredResult.body as AuthResponse).errors?.[0].extensions.code,
    ).toBe('ACCESS_TOKEN_EXPIRED');
    const missing = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ chechAuth }' });
    expect((missing.body as AuthResponse).errors?.[0].extensions.code).toBe(
      'ACCESS_TOKEN_MISSING',
    );
    const invalid = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer bad-token')
      .send({ query: '{ chechAuth }' });
    expect((invalid.body as AuthResponse).errors?.[0].extensions.code).toBe(
      'ACCESS_TOKEN_INVALID',
    );
    const admin = await fixture.auth.createToken({
      ...fixture.member,
      memberType: MemberType.ADMIN,
    });
    const forbidden = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${admin}`)
      .send({ query: '{ chechAuthRoles }' });
    expect((forbidden.body as AuthResponse).errors?.[0].extensions.code).toBe(
      'FORBIDDEN',
    );
    const logged = JSON.stringify(logs.mock.calls);
    expect(logged).not.toContain(expired);
    expect(logged).not.toContain(admin);
    expect(logged).not.toContain('password');
    expect(logged).not.toContain('firebase-token');
  });
});
