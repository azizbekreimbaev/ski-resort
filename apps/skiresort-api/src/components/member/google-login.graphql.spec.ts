import 'reflect-metadata';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MemberResolver } from './member.resolver';
import { GoogleLoginInput } from '../../libs/dto/member/member.input';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

describe('Google login GraphQL contract', () => {
  it('preserves login/signup and exposes the new input without private identity fields', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    try {
      const schema = await moduleRef
        .get(GraphQLSchemaFactory)
        .create([MemberResolver]);
      const mutations = schema.getMutationType()!.getFields();
      expect(mutations.googleLogin.type.toString()).toBe('Member!');
      expect(mutations.googleLogin.args[0].type.toString()).toBe(
        'GoogleLoginInput!',
      );
      expect(mutations.login.args[0].type.toString()).toBe('LoginInput!');
      expect(mutations.signup.args[0].type.toString()).toBe('MemberInput!');
      const input = (
        schema.getType('GoogleLoginInput') as GraphQLInputObjectType
      ).getFields();
      expect(input.idToken.type.toString()).toBe('String!');
      expect(input.memberNick.type.toString()).toBe('String');
      expect(input.memberPhone.type.toString()).toBe('String');
      expect(input.memberType).toBeUndefined();
      const member = (
        schema.getType('Member') as GraphQLObjectType
      ).getFields();
      expect(member.firebaseUid).toBeUndefined();
      expect(member.memberPassword).toBeUndefined();
      expect(member.memberPhone.type.toString()).toBe('String!');
    } finally {
      await moduleRef.close();
    }
  });

  it('accepts token-only login and rejects invalid profile input', async () => {
    expect(
      await validate(plainToInstance(GoogleLoginInput, { idToken: 'token' })),
    ).toHaveLength(0);
    const errors = await validate(
      plainToInstance(GoogleLoginInput, {
        idToken: '',
        memberNick: 'ab',
        memberPhone: '',
      }),
    );
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['idToken', 'memberNick', 'memberPhone']),
    );
  });
});
