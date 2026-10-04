import { model } from 'mongoose';
import EquipmentSchema from './Equipment.model';
import {
  EquipmentCategory,
  EquipmentStatus,
} from '../libs/enums/equipment.enum';

const EquipmentModel = model('EquipmentSchemaFixture', EquipmentSchema);
const input = () => ({
  equipmentCategory: EquipmentCategory.BOOTS,
  equipmentName: ' Boots ',
  equipmentSize: '235',
  equipmentQuantity: 0,
  equipmentRentalRates: [
    { durationHours: 24, price: 35 },
    { durationHours: 3, price: 15 },
  ],
});

describe('Equipment document schema', () => {
  it('normalizes variant size, package order and catalog defaults without indexes', async () => {
    const doc = new EquipmentModel(input());
    await doc.validate();
    expect(doc.equipmentSize).toBe('23.5');
    expect(doc.equipmentRentalRates.map((rate) => rate.durationHours)).toEqual([
      3, 24,
    ]);
    expect(doc.equipmentRentalRates[0]).not.toHaveProperty('_id');
    expect(doc.equipmentPurchasable).toBe(false);
    expect(doc.equipmentPurchasePrice).toBeNull();
    expect(doc.equipmentImages).toBeNull();
    expect(doc.equipmentStatus).toBe(EquipmentStatus.AVAILABLE);
    expect(EquipmentSchema.indexes()).toEqual([]);
    expect(EquipmentSchema.path('equipmentPricePerDay')).toBeUndefined();
    expect(EquipmentSchema.path('equipmentMinRentalHours')).toBeUndefined();
  });
  it.each([
    { equipmentRentalRates: [] },
    { equipmentRentalRates: null },
    {
      equipmentRentalRates: [
        { durationHours: 3, price: 10 },
        { durationHours: 3, price: 20 },
      ],
    },
    { equipmentRentalRates: [{ durationHours: 0, price: 0 }] },
    { equipmentRentalRates: [{ durationHours: 1.5, price: 0 }] },
    { equipmentRentalRates: [{ durationHours: 3, price: -1 }] },
    { equipmentRentalRates: [{ durationHours: 3, price: Infinity }] },
    { equipmentPurchasable: true },
    { equipmentPurchasePrice: 100 },
    { equipmentQuantity: -1 },
    { equipmentQuantity: 1.5 },
    { equipmentQuantity: 2147483648 },
    { equipmentStatus: 'RENTED' },
    { equipmentSize: 'EU 38' },
    { equipmentBrand: ' ' },
  ])('rejects invalid document %j', async (override) => {
    await expect(
      new EquipmentModel({ ...input(), ...override }).validate(),
    ).rejects.toThrow();
  });
  it('accepts nullable association/size/brand and zero purchase price', async () => {
    await expect(
      new EquipmentModel({
        ...input(),
        resortId: null,
        equipmentSize: null,
        equipmentBrand: null,
        equipmentPurchasable: true,
        equipmentPurchasePrice: 0,
      }).validate(),
    ).resolves.toBeUndefined();
  });
});
