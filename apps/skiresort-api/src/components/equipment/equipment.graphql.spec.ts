import 'reflect-metadata';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
} from 'graphql';
import { Types } from 'mongoose';
import { EquipmentResolver } from './equipment.resolver';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { MemberType } from '../../libs/enums/member.enum';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));
jest.mock('./equipment.service', () => ({ EquipmentService: class {} }));

describe('Equipment GraphQL contract', () => {
  let moduleRef: TestingModule;
  let schema: GraphQLSchema;
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    schema = await moduleRef
      .get(GraphQLSchemaFactory)
      .create([EquipmentResolver]);
  });
  afterAll(async () => moduleRef.close());
  it('exposes the new package model and intended nullability, without legacy fields', () => {
    const fields = (
      schema.getType('Equipment') as GraphQLObjectType
    ).getFields();
    expect(fields.equipmentRentalRates.type.toString()).toBe(
      '[EquipmentRentalRate!]!',
    );
    expect(fields.equipmentPurchasePrice.type.toString()).toBe('Float');
    expect(fields.equipmentAudience.type.toString()).toBe('EquipmentAudience!');
    expect(fields.equipmentSize.type.toString()).toBe('String');
    expect(fields.meLiked.type.toString()).toBe('[MeLiked!]!');
    expect(fields.equipmentMinDays).toBeUndefined();
    expect(fields.equipmentPricePerDay).toBeUndefined();
    expect(
      (schema.getType('EquipmentStatus') as GraphQLEnumType)
        .getValues()
        .map((value) => value.name),
    ).toEqual(['AVAILABLE', 'MAINTENANCE', 'DELETE']);
    expect(
      schema
        .getQueryType()!
        .getFields()
        .getFavoriteEquipments.args[0].type.toString(),
    ).toBe('EquipmentHistoryInquiry!');
  });
  it.each([
    'createEquipment',
    'updateEquipmentByAdmin',
    'removeEquipmentByAdmin',
    'getAllEquipmentsByAdmin',
  ] as const)('protects %s with existing ADMIN guard', (name) => {
    expect(
      Reflect.getMetadata(
        'roles',
        Object.getOwnPropertyDescriptor(EquipmentResolver.prototype, name)!
          .value as object,
      ),
    ).toEqual([MemberType.ADMIN]);
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        Object.getOwnPropertyDescriptor(EquipmentResolver.prototype, name)!
          .value as object,
      ),
    ).toEqual([RolesGuard]);
  });
  it.each(['getEquipment', 'getEquipments'] as const)(
    'permits optional auth on %s',
    (name) => {
      expect(
        Reflect.getMetadata(
          GUARDS_METADATA,
          Object.getOwnPropertyDescriptor(EquipmentResolver.prototype, name)!
            .value as object,
        ),
      ).toEqual([WithoutGuard]);
    },
  );
  it.each([
    'likeTargetEquipment',
    'getFavoriteEquipments',
    'getVisitedEquipments',
  ] as const)('requires authentication for %s', (name) => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        Object.getOwnPropertyDescriptor(EquipmentResolver.prototype, name)!
          .value as object,
      ),
    ).toEqual([AuthGuard]);
  });
  it('forwards current admin identity and validated string IDs to the service', async () => {
    const service = {
      getAllEquipmentsByAdmin: jest.fn(),
      updateEquipmentByAdmin: jest.fn(),
      removeEquipmentByAdmin: jest.fn(),
    };
    const resolver = new EquipmentResolver(service as never);
    const id = new Types.ObjectId(),
      admin = new Types.ObjectId();
    const input = { _id: id.toHexString(), equipmentQuantity: 0 };
    await resolver.updateEquipmentByAdmin(input, admin);
    expect(service.updateEquipmentByAdmin).toHaveBeenCalledWith(
      admin,
      expect.objectContaining({ _id: id }),
    );
    await resolver.getAllEquipmentsByAdmin(
      { page: 1, limit: 10, search: {} },
      admin,
    );
    expect(service.getAllEquipmentsByAdmin).toHaveBeenCalledWith(
      admin,
      expect.objectContaining({ page: 1 }),
    );
    await resolver.removeEquipmentByAdmin(id.toHexString(), admin);
    expect(service.removeEquipmentByAdmin).toHaveBeenCalledWith(admin, id);
    expect(() => resolver.removeEquipmentByAdmin('bad', admin)).toThrow();
  });
  it.each([
    { equipmentRentalRates: [{ durationHours: 3.5, price: 1 }] },
    { equipmentStatus: 'RENTED' },
    { equipmentPurchasable: 'true' },
    { equipmentRentalRates: [{ durationHours: 3, price: 1, hourlyPrice: 1 }] },
  ])(
    'rejects invalid GraphQL input before resolver execution %j',
    async (extra) => {
      const field = schema.getMutationType()!.getFields().createEquipment;
      const original = field.resolve;
      const resolve = jest.fn();
      field.resolve = resolve;
      try {
        const result = await graphql({
          schema,
          source:
            'mutation($input: EquipmentInput!) { createEquipment(input: $input) { _id } }',
          variableValues: {
            input: {
              equipmentCategory: 'BOOTS',
              equipmentName: 'Boots',
              equipmentQuantity: 5,
              equipmentRentalRates: [{ durationHours: 3, price: 1 }],
              ...extra,
            },
          },
        });
        expect(result.errors?.length).toBeGreaterThan(0);
        expect(resolve).not.toHaveBeenCalled();
      } finally {
        field.resolve = original;
      }
    },
  );
});
