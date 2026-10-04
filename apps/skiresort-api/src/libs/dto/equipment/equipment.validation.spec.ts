import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EquipmentInput, EquipmentsInquiry } from './equipment.input';
import { EquipmentUpdate } from './equipment.update';

const valid = {
  equipmentCategory: 'BOOTS',
  equipmentName: 'boots',
  equipmentQuantity: 5,
  equipmentRentalRates: [{ durationHours: 3, price: 0 }],
};
describe('Equipment DTO validation', () => {
  it('accepts defaults, nullable optional fields and nested rates', () => {
    expect(
      validateSync(
        plainToInstance(EquipmentInput, {
          ...valid,
          equipmentSize: null,
          equipmentBrand: null,
          resortId: null,
        }),
      ),
    ).toEqual([]);
  });
  it.each([
    { equipmentPurchasable: 'true' },
    { equipmentPurchasable: null },
    { equipmentAudience: null },
    { equipmentStatus: 'RENTED' },
    { equipmentQuantity: null },
    { equipmentQuantity: 1.5 },
    { equipmentName: '  ' },
    { equipmentRentalRates: null },
    { equipmentRentalRates: [] },
    { equipmentRentalRates: [{ durationHours: 2.5, price: 2 }] },
    { equipmentRentalRates: [{ durationHours: 3, price: NaN }] },
    { equipmentImages: [null] },
    { equipmentBrand: '   ' },
  ])('rejects create values %j', (override) => {
    expect(
      validateSync(plainToInstance(EquipmentInput, { ...valid, ...override }))
        .length,
    ).toBeGreaterThan(0);
  });
  it.each([
    'equipmentCategory',
    'equipmentName',
    'equipmentAudience',
    'equipmentStatus',
    'equipmentRentalRates',
    'equipmentQuantity',
    'equipmentPurchasable',
  ])('rejects explicit null update for %s', (key) => {
    expect(
      validateSync(
        plainToInstance(EquipmentUpdate, {
          _id: '123456789012345678901234',
          [key]: null,
        }),
      ).length,
    ).toBeGreaterThan(0);
  });
  it.each([
    { page: 0 },
    { limit: 101 },
    { search: null },
    { sort: 'equipmentPricePerDay' },
    { search: { rentalDurationHours: 0 } },
    { search: { audienceList: ['FAMILY'] } },
    { search: { rentalPricesRange: { start: '1', end: 2 } } },
  ])('validates nested inquiries %j', (override) => {
    expect(
      validateSync(
        plainToInstance(EquipmentsInquiry, { page: 1, limit: 10, ...override }),
      ).length,
    ).toBeGreaterThan(0);
  });
});
