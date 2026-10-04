import { normalizeEquipmentSize } from './equipment-size';
import { EquipmentCategory as C } from '../../libs/enums/equipment.enum';

describe('Equipment canonical size', () => {
  it.each([
    [C.BOOTS, '235', '23.5'],
    [C.BOOTS, '240 MM', '24.0'],
    [C.BOOTS, '23.5 CM', '23.5'],
    [C.BOOTS, '２３５', '23.5'],
    [C.CLOTHING, 'Extra Large', 'XL'],
    [C.CLOTHING, 'x-large', 'XL'],
    [C.CLOTHING, 'XXL', '2XL'],
    [C.CLOTHING, 'xxxl', '3XL'],
    [C.HELMET, 'm', 'M'],
    [C.HELMET, '52.0 - 56.00 cm', '52-56 CM'],
    [C.SKI, '160cm', '160 CM'],
    [C.SNOWBOARD, '130', '130 CM'],
    [C.POLES, '110.50 CM', '110.5 CM'],
    [C.OTHER, ' one   size ', 'ONE SIZE'],
  ])('normalizes %s %s to %s', (category, input, expected) => {
    expect(normalizeEquipmentSize(category, input)).toBe(expected);
  });
  it.each([
    [C.BOOTS, '23.2'],
    [C.BOOTS, 'EU 38'],
    [C.BOOTS, '0 CM'],
    [C.BOOTS, '1'],
    [C.CLOTHING, '4XL'],
    [C.HELMET, '2XL'],
    [C.HELMET, '56-52 CM'],
    [C.HELMET, '52-52 CM'],
    [C.SKI, '-10 CM'],
    [C.POLES, '100 MM'],
    [C.OTHER, '   '],
  ])('rejects %s %s', (category, input) => {
    expect(() => normalizeEquipmentSize(category, input)).toThrow();
  });
  it.each(Object.values(C))('permits nullable size for %s', (category) => {
    expect(normalizeEquipmentSize(category, null)).toBeNull();
  });
  it.each(['1.0 CM', '100.0 CM', '23.5 CM'])(
    'keeps normalized boot sizes stable without physical size limits: %s',
    (size) => {
      const normalized = normalizeEquipmentSize(C.BOOTS, size);
      expect(normalizeEquipmentSize(C.BOOTS, normalized)).toBe(normalized);
    },
  );
});
