import 'reflect-metadata';
import {
  BadRequestException,
  ForbiddenException,
  ValidationPipe,
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { ResortResolver } from './resort.resolver';
import type { ResortService } from './resort.service';
import { ResortInput } from '../../libs/dto/resort/resort.input';
import { ResortUpdate } from '../../libs/dto/resort/resort.update';
import { ResortStatus } from '../../libs/enums/resort.enum';
import type { AuthService } from '../auth/auth.service';

jest.mock('uuid', () => ({ v4: () => 'fixture-image-id' }));
jest.mock('./resort.service', () => ({ ResortService: class {} }));

const methodMetadata = (key: string, method: keyof ResortResolver): unknown => {
  const descriptor = Object.getOwnPropertyDescriptor(
    ResortResolver.prototype,
    method,
  );
  return Reflect.getMetadata(key, descriptor?.value as object) as unknown;
};

describe('Resort GraphQL access', () => {
  it.each([
    'createResort',
    'getAllResortsByAdmin',
    'updateResortByAdmin',
    'removeResortByAdmin',
  ] as const)('restricts %s to ADMIN', (method) => {
    expect(methodMetadata('roles', method)).toEqual([MemberType.ADMIN]);
    expect(methodMetadata(GUARDS_METADATA, method)).toEqual([RolesGuard]);
  });

  it.each(['getResort', 'getResorts'] as const)(
    'supports optional authentication for %s',
    (method) => {
      expect(methodMetadata(GUARDS_METADATA, method)).toEqual([WithoutGuard]);
    },
  );

  it.each([
    'likeTargetResort',
    'getFavoriteResorts',
    'getVisitedResorts',
  ] as const)('requires authentication for %s', (method) => {
    expect(methodMetadata(GUARDS_METADATA, method)).toEqual([AuthGuard]);
  });

  it('uses the authenticated member when creating a resort', async () => {
    const service = { createResort: jest.fn().mockResolvedValue({}) };
    const resolver = new ResortResolver(service as unknown as ResortService);
    const memberId = new Types.ObjectId();
    const input = new ResortInput();

    await resolver.createResort(input, memberId);

    expect(service.createResort).toHaveBeenCalledWith(memberId, input);
  });

  it('validates and converts resort ID arguments before service calls', async () => {
    const service = { getResort: jest.fn().mockResolvedValue({}) };
    const resolver = new ResortResolver(service as unknown as ResortService);
    const resortId = new Types.ObjectId();

    await resolver.getResort(resortId.toHexString(), null);

    expect(service.getResort).toHaveBeenCalledWith(null, resortId);
  });

  it('converts the update input ID in the resolver before calling the service', async () => {
    const service = { updateResortByAdmin: jest.fn().mockResolvedValue({}) };
    const resolver = new ResortResolver(service as unknown as ResortService);
    const input: ResortUpdate = {
      _id: '6ac1c176c0a836d7637ea8df',
      resortStatus: ResortStatus.SOLD_OUT,
    };

    await resolver.updateResortByAdmin(input);

    expect(input._id).toBeInstanceOf(Types.ObjectId);
    expect(input._id.toString()).toBe('6ac1c176c0a836d7637ea8df');
    expect(service.updateResortByAdmin).toHaveBeenCalledWith(input);
  });

  it('rejects a malformed update ID through the existing global validation pipe', async () => {
    const pipe = new ValidationPipe();
    await expect(
      pipe.transform(
        { _id: 'invalid' },
        { type: 'body', metatype: ResortUpdate },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each(['getResort', 'removeResortByAdmin', 'likeTargetResort'] as const)(
    'rejects invalid IDs before %s service work',
    (method) => {
      const service = {
        getResort: jest.fn(),
        removeResortByAdmin: jest.fn(),
        likeTargetResort: jest.fn(),
        updateResortByAdmin: jest.fn(),
      };
      const resolver = new ResortResolver(service as unknown as ResortService);

      expect(() => {
        if (method === 'getResort') {
          void resolver.getResort('invalid', null);
        } else if (method === 'likeTargetResort') {
          void resolver.likeTargetResort('invalid', new Types.ObjectId());
        } else {
          void resolver.removeResortByAdmin('invalid');
        }
      }).toThrow(BadRequestException);
      expect(service[method]).not.toHaveBeenCalled();
    },
  );
});

describe('Resort requests through the existing guards', () => {
  const authService = { verifyAuth: jest.fn() };

  const requestContext = (
    method: keyof ResortResolver,
    authorization?: string,
  ) => {
    const request: {
      headers: { authorization?: string };
      body: { authMember?: unknown };
    } = { headers: { authorization }, body: {} };
    const descriptor = Object.getOwnPropertyDescriptor(
      ResortResolver.prototype,
      method,
    );
    const context = {
      contextType: 'graphql',
      getHandler: () => descriptor?.value as () => unknown,
      getArgByIndex: () => ({ req: request }),
    };
    return { context, request };
  };

  beforeEach(() => {
    authService.verifyAuth.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('rejects anonymous resort creation before service work', async () => {
    const guard = new RolesGuard(
      new Reflector(),
      authService as unknown as AuthService,
    );
    const { context } = requestContext('createResort');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(authService.verifyAuth).not.toHaveBeenCalled();
  });

  it.each([MemberType.USER, MemberType.AGENT])(
    'rejects resort catalog writes for %s',
    async (memberType) => {
      const guard = new RolesGuard(
        new Reflector(),
        authService as unknown as AuthService,
      );
      authService.verifyAuth.mockResolvedValue({ memberType });
      const { context } = requestContext('updateResortByAdmin', 'Bearer token');

      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    },
  );

  it('accepts ADMIN and forwards its authenticated identity to creation', async () => {
    const guard = new RolesGuard(
      new Reflector(),
      authService as unknown as AuthService,
    );
    const memberId = new Types.ObjectId();
    const admin = {
      _id: memberId,
      memberType: MemberType.ADMIN,
      memberNick: 'admin',
    };
    authService.verifyAuth.mockResolvedValue(admin);
    const { context, request } = requestContext('createResort', 'Bearer token');
    const service = { createResort: jest.fn().mockResolvedValue({}) };
    const resolver = new ResortResolver(service as unknown as ResortService);
    const input = new ResortInput();

    expect(await guard.canActivate(context)).toBe(true);
    expect(request.body.authMember).toBe(admin);
    await resolver.createResort(input, admin._id);
    expect(service.createResort).toHaveBeenCalledWith(memberId, input);
  });

  it('allows anonymous catalog reads through optional authentication', async () => {
    const guard = new WithoutGuard(authService as unknown as AuthService);
    const { context, request } = requestContext('getResorts');

    expect(await guard.canActivate(context)).toBe(true);
    expect(request.body.authMember).toBeNull();
    expect(authService.verifyAuth).not.toHaveBeenCalled();
  });

  it('requires a token for resort likes and history', async () => {
    const guard = new AuthGuard(authService as unknown as AuthService);
    const { context } = requestContext('likeTargetResort');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('accepts an authenticated user for resort likes', async () => {
    const guard = new AuthGuard(authService as unknown as AuthService);
    const user = { memberType: MemberType.USER, memberNick: 'user' };
    authService.verifyAuth.mockResolvedValue(user);
    const { context, request } = requestContext(
      'likeTargetResort',
      'Bearer token',
    );

    expect(await guard.canActivate(context)).toBe(true);
    expect(request.body.authMember).toBe(user);
  });
});
