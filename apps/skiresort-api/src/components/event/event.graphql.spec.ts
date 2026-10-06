import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { Reflector } from '@nestjs/core';
import { EventResolver } from './event.resolver';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthService } from '../auth/auth.service';
import { MemberType } from '../../libs/enums/member.enum';

jest.mock('uuid', () => ({ v4: () => 'fixture' }));

describe('Event GraphQL contracts and guards', () => {
  it('generates Event operations, nullability and update omission semantics', async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    try {
      const schema = await module
        .get(GraphQLSchemaFactory)
        .create([EventResolver]);
      const printed = printSchema(schema);
      expect(printed).toContain(
        'uploadEventImages(files: [Upload!]!): [String!]!',
      );
      expect(printed).toContain('getEvent(eventId: String!): Event!');
      expect(printed).toContain('eventStatus: EventStatus = DRAFT');
      const update = printed.split('input EventUpdate {')[1].split('}')[0];
      expect(update).toContain('_id: String!');
      expect(update).not.toContain('= DRAFT');
      expect(printed).toContain('resortId: String');
    } finally {
      await module.close();
    }
  });

  it.each([
    'createEvent',
    'updateEventByAdmin',
    'removeEventByAdmin',
    'getEventByAdmin',
    'getAllEventsByAdmin',
    'uploadEventImages',
  ])(
    'guards %s with ADMIN and denies anonymous/wrong-role requests',
    async (name) => {
      // Inspect decorator metadata; the method is never invoked unbound.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const handler = EventResolver.prototype[name as keyof EventResolver];
      expect(Reflect.getMetadata('roles', handler)).toEqual([MemberType.ADMIN]);
      expect(Reflect.getMetadata('__guards__', handler)).toContain(RolesGuard);
      const auth = {
        verifyAuth: jest.fn(() =>
          Promise.resolve({ memberType: MemberType.USER }),
        ),
      };
      const guard = new RolesGuard(
        new Reflector(),
        auth as unknown as AuthService,
      );
      const req = { headers: {} as Record<string, string>, body: {} };
      const context = {
        contextType: 'graphql',
        getHandler: () => handler,
        getArgByIndex: () => ({ req }),
      };
      jest.spyOn(console, 'log').mockImplementation(() => undefined);
      jest.spyOn(console, 'info').mockImplementation(() => undefined);
      try {
        await expect(guard.canActivate(context)).rejects.toThrow();
        req.headers.authorization = 'Bearer fixture';
        await expect(guard.canActivate(context)).rejects.toThrow();
        auth.verifyAuth.mockResolvedValue({ memberType: MemberType.ADMIN });
        await expect(guard.canActivate(context)).resolves.toBe(true);
      } finally {
        jest.restoreAllMocks();
      }
    },
  );
});
