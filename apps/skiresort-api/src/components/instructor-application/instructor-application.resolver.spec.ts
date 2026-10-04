import 'reflect-metadata';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';
import { InstructorApplicationResolver } from './instructor-application.resolver';
import { MemberResolver } from '../member/member.resolver';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import {
  InstructorAudience,
  InstructorLevel,
  MemberType,
} from '../../libs/enums/member.enum';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));
const method = (name: keyof InstructorApplicationResolver) =>
  Object.getOwnPropertyDescriptor(
    InstructorApplicationResolver.prototype,
    name,
  )!.value as object;

describe('Instructor GraphQL authorization and identity forwarding', () => {
  const adminOperations = [
    'getAllInstructorApplicationsByAdmin',
    'getInstructorApplicationByAdmin',
    'approveInstructorApplicationByAdmin',
    'rejectInstructorApplicationByAdmin',
  ] as const;

  it.each(adminOperations)('uses existing ADMIN role guard for %s', (name) => {
    expect(Reflect.getMetadata('roles', method(name))).toEqual([
      MemberType.ADMIN,
    ]);
    expect(Reflect.getMetadata(GUARDS_METADATA, method(name))).toEqual([
      RolesGuard,
    ]);
  });

  it('uses USER submission, authenticated own status, and INSTRUCTOR profile permissions', () => {
    expect(
      Reflect.getMetadata('roles', method('createInstructorApplication')),
    ).toEqual([MemberType.USER]);
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        method('getMyInstructorApplication'),
      ),
    ).toEqual([AuthGuard]);
    expect(
      Reflect.getMetadata(
        'roles',
        Object.getOwnPropertyDescriptor(
          MemberResolver.prototype,
          'updateInstructorProfile',
        )!.value as object,
      ),
    ).toEqual([MemberType.INSTRUCTOR]);
    expect(
      Reflect.getMetadata(
        'roles',
        Object.getOwnPropertyDescriptor(
          MemberResolver.prototype,
          'chechAuthRoles',
        )!.value as object,
      ),
    ).toEqual([MemberType.INSTRUCTOR, MemberType.USER]);
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        Object.getOwnPropertyDescriptor(
          MemberResolver.prototype,
          'getInstructors',
        )!.value as object,
      ),
    ).toEqual([WithoutGuard]);
  });

  it.each([MemberType.ADMIN, MemberType.INSTRUCTOR])(
    'denies %s submission with actual RolesGuard',
    async (memberType) => {
      const guard = new RolesGuard(new Reflector(), {
        verifyAuth: jest.fn().mockResolvedValue({ memberType }),
      } as never);
      const context = {
        contextType: 'graphql',
        getHandler: () => method('createInstructorApplication'),
        getArgByIndex: () => ({
          req: { headers: { authorization: 'Bearer fixture' }, body: {} },
        }),
      };
      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    },
  );

  it('denies anonymous submission with actual RolesGuard', async () => {
    const verifyAuth = jest.fn();
    const guard = new RolesGuard(new Reflector(), { verifyAuth } as never);
    await expect(
      guard.canActivate({
        contextType: 'graphql',
        getHandler: () => method('createInstructorApplication'),
        getArgByIndex: () => ({ req: { headers: {}, body: {} } }),
      }),
    ).rejects.toThrow(BadRequestException);
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it.each([MemberType.USER, MemberType.INSTRUCTOR])(
    'denies %s review with actual RolesGuard',
    async (memberType) => {
      const guard = new RolesGuard(new Reflector(), {
        verifyAuth: jest.fn().mockResolvedValue({ memberType }),
      } as never);
      await expect(
        guard.canActivate({
          contextType: 'graphql',
          getHandler: () => method('approveInstructorApplicationByAdmin'),
          getArgByIndex: () => ({
            req: { headers: { authorization: 'Bearer fixture' }, body: {} },
          }),
        }),
      ).rejects.toThrow(ForbiddenException);
    },
  );

  it('forwards authenticated applicant and admin IDs, validating scalar IDs', async () => {
    const memberId = new Types.ObjectId();
    const applicationId = new Types.ObjectId();
    const service = {
      createInstructorApplication: jest.fn().mockResolvedValue({}),
      approveInstructorApplicationByAdmin: jest.fn().mockResolvedValue({}),
    };
    const resolver = new InstructorApplicationResolver(service as never);
    const input = {
      instructorExperienceYears: 2,
      instructorLanguages: ['English'],
      instructorLevel: InstructorLevel.ALL,
      instructorAudience: InstructorAudience.KIDS,
    };
    await resolver.createInstructorApplication(input, memberId as never);
    expect(service.createInstructorApplication).toHaveBeenCalledWith(
      memberId,
      input,
    );
    await resolver.approveInstructorApplicationByAdmin(
      applicationId.toHexString(),
      memberId as never,
    );
    expect(service.approveInstructorApplicationByAdmin).toHaveBeenCalledWith(
      memberId,
      applicationId,
    );
    expect(() =>
      resolver.approveInstructorApplicationByAdmin(
        'invalid',
        memberId as never,
      ),
    ).toThrow(BadRequestException);
  });

  it.each([MemberType.USER, MemberType.ADMIN])(
    'denies %s instructor profile access with actual RolesGuard',
    async (memberType) => {
      const guard = new RolesGuard(new Reflector(), {
        verifyAuth: jest.fn().mockResolvedValue({ memberType }),
      } as never);
      const handler = Object.getOwnPropertyDescriptor(
        MemberResolver.prototype,
        'updateInstructorProfile',
      )!.value as object;
      await expect(
        guard.canActivate({
          contextType: 'graphql',
          getHandler: () => handler,
          getArgByIndex: () => ({
            req: { headers: { authorization: 'Bearer fixture' }, body: {} },
          }),
        }),
      ).rejects.toThrow(ForbiddenException);
    },
  );

  it('allows ADMIN review and stores the existing authenticated request context', async () => {
    const admin = { memberType: MemberType.ADMIN, _id: new Types.ObjectId() };
    const request = {
      headers: { authorization: 'Bearer fixture' },
      body: {} as { authMember?: unknown },
    };
    const guard = new RolesGuard(new Reflector(), {
      verifyAuth: jest.fn().mockResolvedValue(admin),
    } as never);
    expect(
      await guard.canActivate({
        contextType: 'graphql',
        getHandler: () => method('approveInstructorApplicationByAdmin'),
        getArgByIndex: () => ({ req: request }),
      }),
    ).toBe(true);
    expect(request.body.authMember).toBe(admin);
  });
});
