import 'reflect-metadata';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
} from 'graphql';
import { InstructorApplicationResolver } from './instructor-application.resolver';
import { MemberResolver } from '../member/member.resolver';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

describe('Instructor generated GraphQL contracts', () => {
  let moduleRef: TestingModule;
  let schema: GraphQLSchema;
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    schema = await moduleRef
      .get(GraphQLSchemaFactory)
      .create([MemberResolver, InstructorApplicationResolver]);
  });
  afterAll(async () => moduleRef?.close());

  it('exposes new operations without the obsolete Agent query/input', () => {
    const queries = schema.getQueryType()!.getFields();
    expect(queries.getInstructors.type.toString()).toBe('Members!');
    expect(queries.getInstructors.args[0].type.toString()).toBe(
      'InstructorsInquiry!',
    );
    expect(queries.getAgents).toBeUndefined();
    expect(schema.getType('AgentsInquiry')).toBeUndefined();
    expect(schema.getType('AISearch')).toBeUndefined();
    expect(queries.getMyInstructorApplication.type.toString()).toBe(
      'InstructorApplication',
    );
    expect(Object.keys(schema.getMutationType()!.getFields())).toEqual(
      expect.arrayContaining([
        'signup',
        'login',
        'updateMember',
        'updateInstructorProfile',
        'createInstructorApplication',
        'approveInstructorApplicationByAdmin',
        'rejectInstructorApplicationByAdmin',
      ]),
    );
  });

  it('keeps signup role optional and exposes exactly target roles', () => {
    const input = schema.getType('MemberInput') as GraphQLInputObjectType;
    expect(input.getFields().memberType.type.toString()).toBe('MemberType');
    expect(
      (schema.getType('MemberType') as GraphQLEnumType)
        .getValues()
        .map((value) => value.name)
        .sort(),
    ).toEqual(['ADMIN', 'INSTRUCTOR', 'USER']);
  });

  it('uses correct audience spelling and nullability across all contracts', () => {
    for (const name of [
      'Member',
      'InstructorProfileUpdate',
      'InstructorApplicationInput',
      'InstructorApplication',
    ]) {
      const fields = (
        schema.getType(name) as GraphQLObjectType | GraphQLInputObjectType
      ).getFields();
      expect(fields.instructorAudience.type.toString()).toBe(
        name === 'Member' || name === 'InstructorProfileUpdate'
          ? 'InstructorAudience'
          : 'InstructorAudience!',
      );
      expect(fields.instructoAudience).toBeUndefined();
    }
    expect(
      (schema.getType('InstructorAudience') as GraphQLEnumType)
        .getValues()
        .map((value) => value.name),
    ).toEqual(['KIDS', 'ADULTS', 'FAMILY', 'PRIVATE']);
    expect(
      (schema.getType('MemberUpdate') as GraphQLInputObjectType).getFields()
        .instructorAudience,
    ).toBeUndefined();
  });

  it('does not accept client application identity/status/review fields or prices', () => {
    const fields = (
      schema.getType('InstructorApplicationInput') as GraphQLInputObjectType
    ).getFields();
    for (const name of [
      'memberId',
      'applicationStatus',
      'reviewedBy',
      'reviewedAt',
      'instructorPrice1Week',
    ])
      expect(fields[name]).toBeUndefined();
  });

  it('rejects the removed AGENT enum before invoking signup', async () => {
    const signup = jest.fn();
    const result = await graphql({
      schema,
      source:
        'mutation($input: MemberInput!) { signup(input: $input) { _id } }',
      variableValues: {
        input: {
          memberNick: 'user',
          memberPhone: 'phone',
          memberPassword: 'pass',
          memberType: 'AGENT',
        },
      },
      rootValue: { signup },
    });
    expect(result.errors?.length).toBeGreaterThan(0);
    expect(signup).not.toHaveBeenCalled();
  });
});
