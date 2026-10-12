import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { Kind, parse, printSchema } from 'graphql';
import { firstValueFrom, of, throwError } from 'rxjs';
import { Types } from 'mongoose';
import { LoggingInterceptor } from '../../libs/interceptor/Logging.interceptor';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FaqResolver } from '../faq/faq.resolver';
import { AssistantResolver } from './assistant.resolver';
import { AssistantService } from './assistant.service';

jest.mock('uuid', () => ({ v4: () => 'fixture' }));

describe('Assistant GraphQL integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates the operation, history enum, and non-null answer/source fields', async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    try {
      const schema = await module
        .get(GraphQLSchemaFactory)
        .create([FaqResolver, AssistantResolver]);
      const printed = printSchema(schema);
      expect(printed).toContain(
        'askAssistant(input: AssistantInput!): AssistantResponse!',
      );
      expect(printed).toContain('history: [AssistantHistoryInput!]');
      expect(printed).toContain('role: AssistantRole!');
      expect(printed).toContain('answer: String!');
      expect(printed).toContain('sources: [AssistantSource!]!');
      expect(printed).toContain('type: AssistantSourceType!');
      expect(printed).toContain('getFaq(faqId: String!): Faq!');
      expect(schema.getType('AssistantRole')?.toString()).toBe('AssistantRole');
    } finally {
      await module.close();
    }
  });

  it('requires authentication and accepts verified signed-in users', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const handler = AssistantResolver.prototype.askAssistant;
    expect(Reflect.getMetadata('__guards__', handler)).toContain(AuthGuard);
    const auth = {
      verifyAuth: jest.fn().mockRejectedValue(new Error('Invalid token')),
    };
    const guard = new AuthGuard(auth as unknown as AuthService);
    const req = {
      headers: {} as Record<string, string>,
      body: {} as Record<string, unknown>,
    };
    const context = { contextType: 'graphql', getArgByIndex: () => ({ req }) };
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    await expect(guard.canActivate(context)).rejects.toThrow();
    req.headers.authorization = 'Bearer invalid';
    await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    const member = { _id: new Types.ObjectId(), memberNick: 'fixture' };
    auth.verifyAuth.mockResolvedValue(member);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.body.authMember).toEqual(member);
  });

  it('injects the resolver service and delegates the authenticated member ID', async () => {
    const service = {
      askAssistant: jest
        .fn()
        .mockResolvedValue({ answer: 'Answer', sources: [] }),
    };
    const module = await Test.createTestingModule({
      providers: [
        AssistantResolver,
        { provide: AssistantService, useValue: service },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();
    try {
      const member = new Types.ObjectId();
      await expect(
        module
          .get(AssistantResolver)
          .askAssistant({ message: 'Hello' }, member),
      ).resolves.toEqual({ answer: 'Answer', sources: [] });
      expect(service.askAssistant).toHaveBeenCalledWith(member, {
        message: 'Hello',
      });
    } finally {
      await module.close();
    }
  });

  it.each(['success', 'error'])(
    'logs only operation, timing and %s outcome',
    async (outcome) => {
      const log = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);
      const context = {
        getType: () => 'graphql',
        getClass: () => AssistantResolver,
        getHandler: () => 'askAssistant',
        getArgs: () => [
          null,
          {},
          { req: { body: { query: 'private chat query' } } },
          { fieldName: 'askAssistant' },
        ],
      } as unknown as ExecutionContext;
      const result = new LoggingInterceptor().intercept(context, {
        handle: () =>
          outcome === 'success'
            ? of({ answer: 'private answer' })
            : throwError(() => new Error('private failure')),
      });
      if (outcome === 'success') await firstValueFrom(result);
      else
        await expect(firstValueFrom(result)).rejects.toThrow('private failure');
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^askAssistant ${outcome} \\d+ms$`)),
        'ASSISTANT',
      );
      expect(JSON.stringify(log.mock.calls)).not.toContain('private');
    },
  );

  it('redacts mixed operations with aliased assistant fields inside fragments', async () => {
    const log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const document = parse(
      'mutation { otherField ...Chat } fragment Chat on Mutation { chat: askAssistant(input: {message: "private"}) { answer } }',
    );
    const operation = document.definitions.find(
      (node) => node.kind === Kind.OPERATION_DEFINITION,
    );
    const fragment = document.definitions.find(
      (node) => node.kind === Kind.FRAGMENT_DEFINITION,
    );
    const context = {
      getType: () => 'graphql',
      getClass: () => AssistantResolver,
      getHandler: () => 'otherField',
      getArgs: () => [
        null,
        {},
        { req: { body: { query: 'private chat query' } } },
        { fieldName: 'otherField', operation, fragments: { Chat: fragment } },
      ],
    } as unknown as ExecutionContext;
    await firstValueFrom(
      new LoggingInterceptor().intercept(context, {
        handle: () => of('private output'),
      }),
    );
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^otherField success \d+ms$/),
      'ASSISTANT',
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('private');
  });
});
