import { ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { EquipmentService } from './equipment.service';
import { EquipmentInput } from '../../libs/dto/equipment/equipment.input';
import {
  EquipmentAudience as A,
  EquipmentCategory as C,
  EquipmentStatus as S,
} from '../../libs/enums/equipment.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction } from '../../libs/enums/common.enum';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));
const q = (value: unknown) => ({
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(value),
});
const id = new Types.ObjectId(),
  admin = new Types.ObjectId();
const input = (): EquipmentInput => ({
  equipmentCategory: C.BOOTS,
  equipmentName: ' Boots ',
  equipmentSize: '235',
  equipmentQuantity: 5,
  equipmentRentalRates: [
    { durationHours: 24, price: 35 },
    { durationHours: 3, price: 15 },
  ],
});
const record = () => ({
  ...input(),
  _id: id,
  equipmentName: 'Boots',
  equipmentSize: '23.5',
  equipmentStatus: S.AVAILABLE,
  equipmentAudience: A.ALL,
  equipmentPurchasable: false,
  equipmentPurchasePrice: null,
  resortId: null,
  equipmentViews: 0,
  equipmentLikes: 0,
  equipmentComments: 1,
  meLiked: [],
});

describe('Equipment catalog service', () => {
  let model: {
    create: jest.Mock<unknown, [Record<string, unknown>]>;
    findOne: jest.Mock<unknown, unknown[]>;
    findOneAndUpdate: jest.Mock<unknown, unknown[]>;
    findOneAndDelete: jest.Mock<unknown, unknown[]>;
    aggregate: jest.Mock<
      unknown,
      [{ $match?: Record<string, unknown>; $sort?: Record<string, unknown> }[]]
    >;
  };
  let members: { findOne: jest.Mock };
  let resort: { assertVisibleResort: jest.Mock };
  let likes: Record<string, jest.Mock>;
  let views: Record<string, jest.Mock>;
  let service: EquipmentService;
  beforeEach(() => {
    model = {
      create: jest
        .fn<unknown, [Record<string, unknown>]>()
        .mockImplementation((data) =>
          Promise.resolve({ toObject: () => ({ ...record(), ...data }) }),
        ),
      findOne: jest
        .fn<unknown, unknown[]>()
        .mockImplementation(() => q(record())),
      findOneAndUpdate: jest
        .fn<unknown, unknown[]>()
        .mockImplementation(() => q(record())),
      findOneAndDelete: jest
        .fn<unknown, unknown[]>()
        .mockImplementation(() => q(record())),
      aggregate: jest
        .fn<
          unknown,
          [
            {
              $match?: Record<string, unknown>;
              $sort?: Record<string, unknown>;
            }[],
          ]
        >()
        .mockImplementation(() =>
          q([{ list: [record()], metaCounter: [{ total: 1 }] }]),
        ),
    };
    members = {
      findOne: jest.fn().mockImplementation(() =>
        q({
          memberType: MemberType.ADMIN,
          memberStatus: MemberStatus.ACTIVE,
        }),
      ),
    };
    resort = { assertVisibleResort: jest.fn().mockResolvedValue({}) };
    likes = {
      toggleLikeWithChange: jest
        .fn()
        .mockResolvedValue({ modifier: 1, undo: jest.fn() }),
      checkLikeExistence: jest.fn().mockResolvedValue([]),
      getFavoriteEquipments: jest
        .fn()
        .mockResolvedValue({ list: [], metaCounter: [] }),
    };
    views = {
      recordViewWithChange: jest
        .fn()
        .mockResolvedValue({ record: {}, undo: jest.fn() }),
      getVisitedEquipments: jest
        .fn()
        .mockResolvedValue({ list: [], metaCounter: [] }),
    };
    service = new EquipmentService(
      model as never,
      likes as never,
      views as never,
      members as never,
      resort as never,
    );
  });
  afterEach(() => jest.restoreAllMocks());

  it('creates normalized size variants and sorted packages with no duplicate precheck', async () => {
    const result = await service.createEquipment(admin, input());
    expect(result.equipmentSize).toBe('23.5');
    expect(
      result.equipmentRentalRates.map((rate) => rate.durationHours),
    ).toEqual([3, 24]);
    expect(model.create.mock.calls[0][0]).toMatchObject({
      equipmentAudience: A.ALL,
      equipmentPurchasable: false,
      equipmentPurchasePrice: null,
      equipmentStatus: S.AVAILABLE,
    });
    await service.createEquipment(admin, input());
    expect(model.create).toHaveBeenCalledTimes(2);
    expect(model.findOne).not.toHaveBeenCalled();
  });
  it.each([
    {
      equipmentRentalRates: [
        { durationHours: 3, price: 15 },
        { durationHours: 3, price: 20 },
      ],
    },
    { equipmentRentalRates: [] },
    { equipmentPurchasable: true },
    { equipmentPurchasePrice: 25 },
    { equipmentPurchasable: true, equipmentPurchasePrice: Infinity },
    { equipmentQuantity: -1 },
  ])('rejects invalid final create state %j', async (extra) => {
    await expect(
      service.createEquipment(admin, {
        ...input(),
        ...extra,
      }),
    ).rejects.toThrow();
    expect(model.create).not.toHaveBeenCalled();
  });
  it.each(['create', 'list', 'update', 'remove'])(
    'requires current ACTIVE ADMIN for %s',
    async (action) => {
      members.findOne.mockReturnValue(q(null));
      const work =
        action === 'create'
          ? service.createEquipment(admin, input())
          : action === 'list'
            ? service.getAllEquipmentsByAdmin(admin, {
                page: 1,
                limit: 10,
                search: {},
              })
            : action === 'update'
              ? service.updateEquipmentByAdmin(admin, {
                  _id: id,
                  equipmentQuantity: 7,
                })
              : service.removeEquipmentByAdmin(admin, id);
      await expect(work).rejects.toBeInstanceOf(ForbiddenException);
      expect(members.findOne).toHaveBeenCalledWith({
        _id: admin,
        memberType: MemberType.ADMIN,
        memberStatus: MemberStatus.ACTIVE,
      });
    },
  );
  it('checks supplied resort associations and clears them with null', async () => {
    await service.createEquipment(admin, {
      ...input(),
      resortId: id.toHexString(),
    });
    expect(resort.assertVisibleResort).toHaveBeenCalledWith(id);
    resort.assertVisibleResort.mockClear();
    await service.updateEquipmentByAdmin(admin, {
      _id: id,
      resortId: null,
      equipmentBrand: null,
      equipmentSize: null,
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { resortId: null, equipmentBrand: null, equipmentSize: null },
    });
    expect(resort.assertVisibleResort).not.toHaveBeenCalled();
  });
  it('rejects an invalid resort before persistence', async () => {
    resort.assertVisibleResort.mockRejectedValue(new Error('Resort not found'));
    await expect(
      service.createEquipment(admin, {
        ...input(),
        resortId: id.toHexString(),
      }),
    ).rejects.toThrow('Resort not found');
    expect(model.create).not.toHaveBeenCalled();
  });
  it('enables purchase with zero price and protects dependent fields', async () => {
    await service.updateEquipmentByAdmin(admin, {
      _id: id,
      equipmentPurchasable: true,
      equipmentPurchasePrice: 0,
    });
    expect(model.findOneAndUpdate.mock.calls[0][0]).toMatchObject({
      equipmentPurchasable: false,
      equipmentPurchasePrice: null,
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { equipmentPurchasable: true, equipmentPurchasePrice: 0 },
    });
  });
  it('disabling purchase clears price and preserves unrelated fields', async () => {
    model.findOne.mockReturnValue(
      q({
        ...record(),
        equipmentPurchasable: true,
        equipmentPurchasePrice: 25,
      }),
    );
    await service.updateEquipmentByAdmin(admin, {
      _id: id,
      equipmentPurchasable: false,
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { equipmentPurchasable: false, equipmentPurchasePrice: null },
    });
  });
  it.each([
    { equipmentPurchasable: true },
    { equipmentPurchasePrice: 20 },
    { equipmentCategory: C.CLOTHING },
  ])('rejects invalid partial update %j', async (extra) => {
    await expect(
      service.updateEquipmentByAdmin(admin, { _id: id, ...extra }),
    ).rejects.toThrow();
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });
  it('normalizes changed category/size with compare predicates and reports concurrent changes', async () => {
    model.findOneAndUpdate.mockReturnValue(q(null));
    await expect(
      service.updateEquipmentByAdmin(admin, {
        _id: id,
        equipmentCategory: C.SKI,
        equipmentSize: '160cm',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(model.findOneAndUpdate.mock.calls[0][0]).toMatchObject({
      equipmentCategory: C.BOOTS,
      equipmentSize: '23.5',
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { equipmentCategory: C.SKI, equipmentSize: '160 CM' },
    });
  });
  it('replaces rates without deriving daily or hourly prices', async () => {
    await service.updateEquipmentByAdmin(admin, {
      _id: id,
      equipmentRentalRates: [
        { durationHours: 6, price: 3 },
        { durationHours: 3, price: 20 },
      ],
    });
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: {
        equipmentRentalRates: [
          { durationHours: 3, price: 20 },
          { durationHours: 6, price: 3 },
        ],
      },
    });
  });
  it('matches the selected package price, normalized sizes and inclusive audience', async () => {
    await service.getEquipments(null, {
      page: 1,
      limit: 10,
      search: {
        categoryList: [C.SNOWBOARD],
        audienceList: [A.KIDS],
        sizeList: ['130cm'],
        rentalDurationHours: 6,
        rentalPricesRange: { start: 0, end: 30000 },
        equipmentPurchasable: false,
      },
    });
    expect(model.aggregate.mock.calls[0][0][0].$match).toEqual({
      equipmentStatus: { $in: [S.AVAILABLE] },
      equipmentCategory: { $in: [C.SNOWBOARD] },
      equipmentAudience: { $in: [A.KIDS, A.ALL] },
      equipmentSize: { $in: ['130 CM'] },
      equipmentRentalRates: {
        $elemMatch: { durationHours: 6, price: { $gte: 0, $lte: 30000 } },
      },
      equipmentPurchasable: false,
    });
    expect(model.aggregate.mock.calls[0][0][1]).toEqual({
      $sort: { createdAt: Direction.DESC, _id: Direction.DESC },
    });
  });
  it('escapes literal name and brand searches and ALL-only audience', async () => {
    await service.getEquipments(null, {
      page: 1,
      limit: 10,
      search: { text: '[boots]', equipmentBrand: 'S.*', audienceList: [A.ALL] },
    });
    expect(model.aggregate.mock.calls[0][0][0].$match).toMatchObject({
      equipmentName: { $regex: '\\[boots\\]', $options: 'i' },
      equipmentBrand: { $regex: '^S\\.\\*$', $options: 'i' },
      equipmentAudience: { $in: [A.ALL] },
    });
  });
  it.each([
    { sizeList: ['M'] },
    { rentalPricesRange: { start: 0, end: 30 } },
    { rentalDurationHours: 6, rentalPricesRange: { start: 30, end: 0 } },
    { equipmentPurchasable: false, purchasePricesRange: { start: 0, end: 30 } },
  ])('rejects ambiguous search %j', async (search) => {
    await expect(
      service.getEquipments(null, { page: 1, limit: 10, search }),
    ).rejects.toThrow();
  });
  it('admin listing includes all statuses and purchase range implies purchasable', async () => {
    await service.getAllEquipmentsByAdmin(admin, {
      page: 1,
      limit: 10,
      search: { purchasePricesRange: { start: 0, end: 30 } },
    });
    expect(model.aggregate.mock.calls[0][0][0].$match).toEqual({
      equipmentPurchasable: true,
      equipmentPurchasePrice: { $gte: 0, $lte: 30 },
    });
  });
  it.each([{ page: 0 }, { limit: 101 }, { sort: 'equipmentPricePerDay' }])(
    'rejects invalid list inquiry %j',
    async (override) => {
      await expect(
        service.getEquipments(null, {
          page: 1,
          limit: 10,
          search: {},
          ...override,
        }),
      ).rejects.toThrow();
    },
  );
  it('returns empty arrays and permanently removes only equipment', async () => {
    model.aggregate.mockReturnValue(q([]));
    expect(
      await service.getEquipments(null, { page: 1, limit: 10, search: {} }),
    ).toEqual({ list: [], metaCounter: [] });
    await service.removeEquipmentByAdmin(admin, id);
    expect(model.findOneAndDelete).toHaveBeenCalledWith({ _id: id });
    model.findOneAndDelete.mockReturnValue(q(null));
    await expect(service.removeEquipmentByAdmin(admin, id)).rejects.toThrow(
      'Equipment not found',
    );
  });
  it('anonymous detail creates no view and authenticated views use EQUIPMENT group', async () => {
    model.aggregate.mockReturnValue(q([record()]));
    await service.getEquipment(null, id);
    expect(views.recordViewWithChange).not.toHaveBeenCalled();
    model.aggregate.mockReturnValue(q([record()]));
    // Detail aggregation returns records rather than the list facet.
    await service.getEquipment(admin, id);
    expect(views.recordViewWithChange).toHaveBeenCalledWith(
      expect.objectContaining({ viewGroup: ViewGroup.EQUIPMENT }),
    );
    expect(likes.checkLikeExistence).toHaveBeenCalledWith(
      expect.objectContaining({ likeGroup: LikeGroup.EQUIPMENT }),
    );
  });
  it('deduplicated views and likes do not increment counters', async () => {
    model.aggregate.mockReturnValue(q([record()]));
    views.recordViewWithChange.mockResolvedValue({
      record: null,
      undo: jest.fn(),
    });
    likes.toggleLikeWithChange.mockResolvedValue({
      modifier: 0,
      undo: jest.fn(),
    });
    await service.getEquipment(admin, id);
    await service.likeTargetEquipment(admin, id);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });
  it.each(['view', 'like'])(
    'compensates exact %s change and preserves original counter error',
    async (interaction) => {
      model.aggregate.mockReturnValue(q([record()]));
      const undo = jest.fn().mockRejectedValue(new Error('undo failure'));
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      const failure = new Error('counter failure');
      model.findOneAndUpdate.mockReturnValue({
        ...q(null),
        exec: jest.fn().mockRejectedValue(failure),
      });
      views.recordViewWithChange.mockResolvedValue({ record: {}, undo });
      likes.toggleLikeWithChange.mockResolvedValue({ modifier: 1, undo });
      await expect(
        interaction === 'view'
          ? service.getEquipment(admin, id)
          : service.likeTargetEquipment(admin, id),
      ).rejects.toBe(failure);
      expect(undo).toHaveBeenCalledTimes(1);
    },
  );
  it('counter decrements cannot underflow, and removed targets permit comment removal', async () => {
    model.findOneAndUpdate.mockReturnValue(q(null));
    await expect(
      service.equipmentStatsEditor({
        _id: id,
        targetKey: 'equipmentComments',
        modifier: -1,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(model.findOneAndUpdate.mock.calls[0][0]).toMatchObject({
      equipmentComments: { $gte: 1 },
    });
    await expect(service.commentRemoved(id)).rejects.toBeInstanceOf(
      ConflictException,
    );
    model.findOne.mockReturnValue(q(null));
    await expect(service.commentRemoved(id)).resolves.toBeUndefined();
  });
  it('history validates pagination and delegates with authenticated identity', async () => {
    await service.getFavoriteEquipments(admin, { page: 1, limit: 10 });
    await service.getVisitedEquipments(admin, { page: 1, limit: 10 });
    expect(likes.getFavoriteEquipments).toHaveBeenCalledWith(admin, {
      page: 1,
      limit: 10,
    });
    expect(views.getVisitedEquipments).toHaveBeenCalledWith(admin, {
      page: 1,
      limit: 10,
    });
    expect(() =>
      service.getFavoriteEquipments(admin, { page: 0, limit: 10 }),
    ).toThrow();
  });
});
