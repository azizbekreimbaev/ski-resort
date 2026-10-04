import 'reflect-metadata';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLObjectType,
  graphql,
} from 'graphql';
import type { GraphQLSchema } from 'graphql';
import { ResortResolver } from './resort.resolver';
import { MemberResolver } from '../member/member.resolver';
import { BoardArticleResolver } from '../board-article/board-article.resolver';

jest.mock('../../libs/config', () => ({
  validateMongoObjectId: jest.fn(),
  availableInstructorSorts: [],
  availableMemberSorts: [],
  availableBoardArticleSorts: [],
}));
jest.mock('./resort.service', () => ({ ResortService: class {} }));

describe('Resort generated GraphQL schema', () => {
  let moduleRef: TestingModule;
  let schema: GraphQLSchema;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    schema = await moduleRef
      .get(GraphQLSchemaFactory)
      .create([ResortResolver, MemberResolver, BoardArticleResolver]);
  });

  afterAll(async () => moduleRef?.close());

  it('exposes the intended resort operations and string IDs', () => {
    const queries = schema.getQueryType()?.getFields();
    const mutations = schema.getMutationType()?.getFields();
    expect(Object.keys(queries ?? {})).toEqual(
      expect.arrayContaining([
        'getResort',
        'getResorts',
        'getAllResortsByAdmin',
        'getFavoriteResorts',
        'getVisitedResorts',
      ]),
    );
    expect(Object.keys(mutations ?? {})).toEqual(
      expect.arrayContaining([
        'createResort',
        'updateResortByAdmin',
        'removeResortByAdmin',
        'likeTargetResort',
      ]),
    );
    expect(queries?.getResort.args[0].name).toBe('resortId');
    expect(queries?.getResort.args[0].type.toString()).toBe('String!');
    expect(queries?.getResorts.type.toString()).toBe('Resorts!');
  });

  it('requires an update object containing _id, rather than an ID string as input', async () => {
    const source = `mutation UpdateResort($input: ResortUpdate!) {
      updateResortByAdmin(input: $input) { _id }
    }`;
    const updateField = schema
      .getMutationType()!
      .getFields().updateResortByAdmin;
    const originalResolve = updateField.resolve;
    const resolve = jest.fn(
      (_source: unknown, args: { input: { _id: string } }) => ({
        _id: args.input._id,
      }),
    );
    updateField.resolve = resolve;
    try {
      const invalid = await graphql({
        schema,
        source,
        variableValues: { input: '6ac1c176c0a836d7637ea8df' },
      });
      expect(invalid.errors?.[0].message).toContain(
        'Expected type "ResortUpdate" to be an object',
      );
      expect(resolve).not.toHaveBeenCalled();

      const valid = await graphql({
        schema,
        source,
        variableValues: {
          input: { _id: '6ac1c176c0a836d7637ea8df', resortStatus: 'SOLD_OUT' },
        },
      });
      expect(valid.errors).toBeUndefined();
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(valid.data?.updateResortByAdmin).toEqual({
        _id: '6ac1c176c0a836d7637ea8df',
      });
    } finally {
      updateField.resolve = originalResolve;
    }
  });

  it('matches resort field types and nullability', () => {
    const resort = schema.getType('Resort') as GraphQLObjectType;
    expect(resort).toBeInstanceOf(GraphQLObjectType);
    const fields = resort.getFields();
    expect(fields.resortPricePerDay.type.toString()).toBe('Float!');
    expect(fields.resortMinDays.type.toString()).toBe('Int!');
    expect(fields.resortLocation.type.toString()).toBe('ResortLocation!');
    expect(fields.resortImages.type.toString()).toBe('[String!]!');
    expect(fields.resortLevel.type.toString()).toBe('ResortLevel');
    expect(fields.resortFacilities.type.toString()).toBe('[ResortFacilities!]');
    expect(fields.resortDesc.type.toString()).toBe('String');
    expect(fields.deletedAt.type.toString()).toBe('DateTime');
    expect(fields.memberData.type.toString()).toBe('Member');
    expect(fields.resortRank).toBeUndefined();
  });

  it('exposes exactly the requested locations and facilities', () => {
    const locations = schema.getType('ResortLocation') as GraphQLEnumType;
    const facilities = schema.getType('ResortFacilities') as GraphQLEnumType;
    expect(locations).toBeInstanceOf(GraphQLEnumType);
    expect(facilities).toBeInstanceOf(GraphQLEnumType);
    expect(locations.getValues().map(({ name }) => name)).toEqual([
      'PYEONGCHANG',
      'JEONGSEON',
      'HONGCHEON',
      'CHUNCHEON',
      'WONJU',
      'HOENGSEONG',
      'YANGYANG',
      'GWANGJU_GYEONGGI',
      'ICHEON',
      'POCHEON',
      'MUJU',
    ]);
    expect(facilities.getValues().map(({ name }) => name)).toEqual([
      'SKI_LIFT',
      'EQUIPMENT_RENTAL',
      'SKI_SCHOOL',
      'RESTAURANT',
      'CAFE',
      'ACCOMMODATION',
      'PARKING',
      'SHUTTLE_BUS',
      'LOCKER',
      'FIRST_AID',
      'SLED_PARK',
    ]);
  });

  it('keeps managed fields out of inputs and defaults the minimum stay', () => {
    const input = schema.getType('ResortInput') as GraphQLInputObjectType;
    const fields = input.getFields();
    expect(fields.resortMinDays.defaultValue).toBe(2);
    expect(fields.resortPricePerDay.type.toString()).toBe('Float!');
    expect(fields.resortLocation.type.toString()).toBe('ResortLocation!');
    expect(fields.resortFacilities.type.toString()).toBe('[ResortFacilities!]');
    expect(fields.memberId).toBeUndefined();
    expect(fields.resortStatus).toBeUndefined();
    expect(fields.resortLikes).toBeUndefined();
    expect(fields.createdAt).toBeUndefined();
    const update = schema.getType('ResortUpdate') as GraphQLInputObjectType;
    expect(update.getFields()._id.type.toString()).toBe('String!');
    expect(update.getFields().resortStatus.type.toString()).toBe(
      'ResortStatus',
    );
    expect(update.getFields().memberId).toBeUndefined();
    expect(update.getFields().resortLocation.type.toString()).toBe(
      'ResortLocation',
    );
    expect(update.getFields().resortFacilities.type.toString()).toBe(
      '[ResortFacilities!]',
    );
  });

  it.each(['ResortSearch', 'AllResortSearch'])(
    'uses enum filters in %s',
    (typeName) => {
      const search = schema.getType(typeName) as GraphQLInputObjectType;
      expect(search.getFields().locationList.type.toString()).toBe(
        '[ResortLocation!]',
      );
      expect(search.getFields().facilities.type.toString()).toBe(
        '[ResortFacilities!]',
      );
    },
  );

  it('preserves the existing member and community operations and member fields', () => {
    const queries = schema.getQueryType()?.getFields();
    const mutations = schema.getMutationType()?.getFields();
    expect(queries?.getMember.type.toString()).toBe('Member!');
    expect(queries?.getInstructors.type.toString()).toBe('Members!');
    expect(queries?.getBoardArticles.type.toString()).toBe('BoardArticles!');
    expect(mutations?.signup.type.toString()).toBe('Member!');
    expect(mutations?.createBoardArticle.type.toString()).toBe('BoardArticle!');
    const member = schema.getType('Member') as GraphQLObjectType;
    expect(member.getFields().memberProperties.type.toString()).toBe('Int!');
    expect(member.getFields().memberRank.type.toString()).toBe('Int!');
  });
});
