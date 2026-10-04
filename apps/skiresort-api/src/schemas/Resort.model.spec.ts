import { model, Types } from 'mongoose';
import ResortSchema from './Resort.model';
import {
  ResortFacilities,
  ResortLocation,
  ResortStatus,
} from '../libs/enums/resort.enum';

const ResortModel = model('ResortSchemaTest', ResortSchema);
const validResort = {
  resortTitle: ' Alpine Resort ',
  resortLocation: ResortLocation.PYEONGCHANG,
  resortAddress: 'Mountain Road',
  resortPricePerDay: 50.25,
  resortImages: [],
  memberId: new Types.ObjectId(),
};

describe('Resort persistence contract', () => {
  it('enforces global case-insensitive uniqueness on location, title, address and level', () => {
    expect(ResortSchema.indexes()).toContainEqual([
      { resortLocation: 1, resortTitle: 1, resortAddress: 1, resortLevel: 1 },
      expect.objectContaining({
        name: 'unique_resort_identity_with_level',
        unique: true,
        collation: { locale: 'en', strength: 2 },
      }),
    ]);
  });

  it('uses the exact DMM business fields and resorts collection', () => {
    expect(ResortSchema.get('collection')).toBe('resorts');
    expect(Object.keys(ResortSchema.paths).sort()).toEqual(
      [
        '_id',
        'resortStatus',
        'resortTitle',
        'resortLocation',
        'resortAddress',
        'resortPricePerDay',
        'resortMinDays',
        'resortLevel',
        'resortImages',
        'resortFacilities',
        'resortDesc',
        'resortViews',
        'resortLikes',
        'resortComments',
        'memberId',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ].sort(),
    );
    expect(ResortSchema.path('memberId').options.ref).toBe('Member');
  });

  it('sets required server defaults while retaining nullable fields', () => {
    const resort = new ResortModel(validResort);

    expect(resort.validateSync()).toBeUndefined();
    expect(resort.resortTitle).toBe('Alpine Resort');
    expect(resort.resortStatus).toBe(ResortStatus.ACTIVE);
    expect(resort.resortMinDays).toBe(2);
    expect(resort.resortViews).toBe(0);
    expect(resort.resortLikes).toBe(0);
    expect(resort.resortComments).toBe(0);
    expect(resort.resortLevel).toBeNull();
    expect(resort.resortFacilities).toBeNull();
    expect(resort.resortDesc).toBeNull();
    expect(resort.deletedAt).toBeNull();
  });

  it('requires image array presence but permits an empty array', () => {
    const withoutImages: Partial<typeof validResort> = { ...validResort };
    delete withoutImages.resortImages;
    expect(
      new ResortModel(withoutImages).validateSync()?.errors.resortImages,
    ).toBeDefined();
    expect(new ResortModel(validResort).validateSync()).toBeUndefined();
  });

  it.each(Object.values(ResortLocation))(
    'persists location %s and facility enum values',
    (location) => {
      const resort = new ResortModel({
        ...validResort,
        resortLocation: location,
        resortFacilities: Object.values(ResortFacilities),
      });

      expect(resort.validateSync()).toBeUndefined();
      expect(resort.resortLocation).toBe(location);
      expect(resort.resortFacilities).toEqual(Object.values(ResortFacilities));
    },
  );

  it('permits empty facilities and clearing nullable facilities', () => {
    const resort = new ResortModel({
      ...validResort,
      resortFacilities: [],
    });

    expect(resort.validateSync()).toBeUndefined();
    resort.set('resortFacilities', null);
    expect(resort.validateSync()).toBeUndefined();
    expect(resort.resortFacilities).toBeNull();
  });

  it.each([
    { resortMinDays: 1 },
    { resortMinDays: 2.5 },
    { resortPricePerDay: -1 },
    { resortPricePerDay: Infinity },
    { resortStatus: 'SOLD' },
    { resortLevel: 'EXPERT' },
    { resortLocation: 'Gangwon' },
    { resortFacilities: [ResortFacilities.PARKING, 'parking'] },
    { resortViews: 0.5 },
  ])('rejects invalid persisted data %j', (changes) => {
    expect(
      new ResortModel({ ...validResort, ...changes }).validateSync(),
    ).toBeDefined();
  });

  it('does not require nullable fields and rejects missing required fields', () => {
    const withoutMember: Partial<typeof validResort> = { ...validResort };
    delete withoutMember.memberId;
    expect(
      new ResortModel(withoutMember).validateSync()?.errors.memberId,
    ).toBeDefined();
    expect(
      new ResortModel({ ...validResort, resortTitle: '   ' }).validateSync()
        ?.errors.resortTitle,
    ).toBeDefined();
  });
});
