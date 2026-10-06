import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AllResortsInquiry, ResortInput, ResortsInquiry } from './resort.input';
import { ResortUpdate } from './resort.update';
import {
  ResortFacilities,
  ResortLocation,
  ResortStatus,
} from '../../enums/resort.enum';

const validResort = {
  resortTitle: 'Alpine Resort',
  resortLocation: ResortLocation.PYEONGCHANG,
  resortAddress: 'Mountain Road',
  resortPricePerDay: 75.5,
  resortImages: [],
};

describe('Resort input validation', () => {
  it('defaults the minimum stay to one and permits empty arrays', () => {
    const input = plainToInstance(ResortInput, {
      ...validResort,
      resortFacilities: [],
    });

    expect(validateSync(input)).toEqual([]);
    expect(input.resortMinDays).toBe(1);
  });

  it.each(Object.values(ResortLocation))(
    'accepts the resort location %s and all facilities',
    (location) => {
      const input = plainToInstance(ResortInput, {
        ...validResort,
        resortLocation: location,
        resortFacilities: Object.values(ResortFacilities),
      });

      expect(validateSync(input)).toEqual([]);
    },
  );

  it.each([
    ['resortLocation', 'Gangwon'],
    ['resortFacilities', [ResortFacilities.PARKING, 'parking']],
  ])('rejects unsupported create %s values', (field, value) => {
    const input = plainToInstance(ResortInput, {
      ...validResort,
      [field]: value,
    });

    expect(validateSync(input).some((error) => error.property === field)).toBe(
      true,
    );
  });

  it.each([-1, NaN, Infinity])('rejects invalid daily price %s', (price) => {
    const input = plainToInstance(ResortInput, {
      ...validResort,
      resortPricePerDay: price,
    });

    expect(
      validateSync(input).some(
        (error) => error.property === 'resortPricePerDay',
      ),
    ).toBe(true);
  });

  it.each([1, 2, 3])('accepts minimum stay %s on create and update', (days) => {
    const input = plainToInstance(ResortInput, { ...validResort, resortMinDays: days });
    const update = plainToInstance(ResortUpdate, {
      _id: '507f1f77bcf86cd799439011', resortMinDays: days,
    });
    expect(validateSync(input)).toEqual([]);
    expect(validateSync(update)).toEqual([]);
  });

  it.each([0, -1, 1.5, null])('rejects invalid minimum stay on update %s', (days) => {
    const update = plainToInstance(ResortUpdate, {
      _id: '507f1f77bcf86cd799439011', resortMinDays: days,
    });
    expect(validateSync(update).some((error) => error.property === 'resortMinDays')).toBe(true);
  });
  it.each([0, -1, 1.5, null])('rejects invalid minimum stay %s', (days) => {
    const input = plainToInstance(ResortInput, {
      ...validResort,
      resortMinDays: days,
    });

    expect(
      validateSync(input).some((error) => error.property === 'resortMinDays'),
    ).toBe(true);
  });

  it.each(['resortTitle', 'resortLocation', 'resortAddress'])(
    'rejects whitespace-only %s',
    (field) => {
      const input = plainToInstance(ResortInput, {
        ...validResort,
        [field]: ' \t\n ',
      });

      expect(
        validateSync(input).some((error) => error.property === field),
      ).toBe(true);
    },
  );

  it('rejects non-string array elements', () => {
    const input = plainToInstance(ResortInput, {
      ...validResort,
      resortImages: [123],
      resortFacilities: [false],
    });

    expect(validateSync(input).map((error) => error.property)).toEqual(
      expect.arrayContaining(['resortImages', 'resortFacilities']),
    );
  });

  it('validates nested filters and ordered fractional price ranges', () => {
    const valid = plainToInstance(ResortsInquiry, {
      page: 1,
      limit: 20,
      search: { pricesRange: { start: 1.5, end: 2.75 } },
    });
    const reversed = plainToInstance(ResortsInquiry, {
      page: 1,
      limit: 20,
      search: { pricesRange: { start: 3, end: 2 } },
    });
    const invalid = plainToInstance(ResortsInquiry, {
      page: 1,
      limit: 20,
      search: { memberId: 'invalid', levelList: ['EXPERT'] },
    });

    expect(validateSync(valid)).toEqual([]);
    expect(validateSync(reversed)[0]?.property).toBe('search');
    expect(
      validateSync(invalid)[0]?.children?.map((error) => error.property),
    ).toEqual(expect.arrayContaining(['memberId', 'levelList']));
  });

  it.each([ResortsInquiry, AllResortsInquiry])(
    'validates location and facility enums in %p search',
    (Inquiry) => {
      const valid = plainToInstance(Inquiry, {
        page: 1,
        limit: 20,
        search: {
          locationList: Object.values(ResortLocation),
          facilities: Object.values(ResortFacilities),
        },
      });
      const invalid = plainToInstance(Inquiry, {
        page: 1,
        limit: 20,
        search: {
          locationList: [ResortLocation.PYEONGCHANG, 'Gangwon'],
          facilities: [ResortFacilities.PARKING, 'parking'],
        },
      });

      expect(validateSync(valid)).toEqual([]);
      expect(
        validateSync(invalid)[0]?.children?.map((error) => error.property),
      ).toEqual(expect.arrayContaining(['locationList', 'facilities']));
    },
  );

  it('defaults omitted search and limits page size without limiting page number', () => {
    const input = plainToInstance(ResortsInquiry, { page: 101, limit: 100 });
    expect(validateSync(input)).toEqual([]);
    expect(input.search).toEqual({});

    expect(
      validateSync(
        plainToInstance(ResortsInquiry, { page: 0, limit: 101 }),
      ).map((error) => error.property),
    ).toEqual(expect.arrayContaining(['page', 'limit']));
  });

  it('rejects invalid sort fields and accepts admin status filters', () => {
    expect(
      validateSync(
        plainToInstance(ResortsInquiry, {
          page: 1,
          limit: 20,
          sort: 'propertyPrice',
        }),
      )[0]?.property,
    ).toBe('sort');
    expect(
      validateSync(
        plainToInstance(AllResortsInquiry, {
          page: 1,
          limit: 20,
          search: { resortStatus: ResortStatus.DELETE },
        }),
      ),
    ).toEqual([]);
  });
});

describe('Resort update validation', () => {
  const id = '64b000000000000000000001';

  it.each([1, 2])(
    'accepts a minimum stay of %s days on create and update',
    (days) => {
      expect(
        validateSync(
          plainToInstance(ResortInput, {
            ...validResort,
            resortMinDays: days,
          }),
        ),
      ).toEqual([]);
      expect(
        validateSync(
          plainToInstance(ResortUpdate, {
            _id: id,
            resortMinDays: days,
          }),
        ),
      ).toEqual([]);
    },
  );

  it.each([0, -1, 1.5])('rejects invalid update minimum stay %s', (days) => {
    const update = plainToInstance(ResortUpdate, {
      _id: id,
      resortMinDays: days,
    });
    expect(
      validateSync(update).some((error) => error.property === 'resortMinDays'),
    ).toBe(true);
  });

  it('allows omitting fields and clearing nullable fields', () => {
    const update = plainToInstance(ResortUpdate, {
      _id: id,
      resortLevel: null,
      resortFacilities: null,
      resortDesc: null,
    });

    expect(validateSync(update)).toEqual([]);
  });

  it('accepts enum updates and empty facility arrays', () => {
    const update = plainToInstance(ResortUpdate, {
      _id: id,
      resortLocation: ResortLocation.MUJU,
      resortFacilities: Object.values(ResortFacilities),
    });

    expect(validateSync(update)).toEqual([]);
    expect(
      validateSync(
        plainToInstance(ResortUpdate, { _id: id, resortFacilities: [] }),
      ),
    ).toEqual([]);
  });

  it.each([
    ['resortLocation', 'Gangwon'],
    ['resortFacilities', [ResortFacilities.PARKING, 'parking']],
  ])('rejects unsupported update %s values', (field, value) => {
    const update = plainToInstance(ResortUpdate, { _id: id, [field]: value });

    expect(validateSync(update).some((error) => error.property === field)).toBe(
      true,
    );
  });

  it.each([
    'resortStatus',
    'resortTitle',
    'resortLocation',
    'resortAddress',
    'resortPricePerDay',
    'resortMinDays',
    'resortImages',
  ])('rejects clearing required field %s', (field) => {
    const update = plainToInstance(ResortUpdate, { _id: id, [field]: null });

    expect(validateSync(update).some((error) => error.property === field)).toBe(
      true,
    );
  });

  it('rejects malformed IDs and accepts a zero price', () => {
    expect(
      validateSync(plainToInstance(ResortUpdate, { _id: 'invalid' }))[0]
        ?.property,
    ).toBe('_id');
    expect(
      validateSync(
        plainToInstance(ResortUpdate, { _id: id, resortPricePerDay: 0 }),
      ),
    ).toEqual([]);
  });
});
