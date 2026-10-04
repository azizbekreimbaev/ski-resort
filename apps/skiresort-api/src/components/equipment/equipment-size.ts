import { BadRequestException } from '@nestjs/common';
import { EquipmentCategory } from '../../libs/enums/equipment.enum';

const labels: Record<string, string> = {
  XS: 'XS',
  XSMALL: 'XS',
  EXTRASMALL: 'XS',
  S: 'S',
  SMALL: 'S',
  M: 'M',
  MEDIUM: 'M',
  L: 'L',
  LARGE: 'L',
  XL: 'XL',
  XLARGE: 'XL',
  EXTRALARGE: 'XL',
  XXL: '2XL',
  '2XL': '2XL',
  XXXL: '3XL',
  '3XL': '3XL',
};
const numeric = '(\\d+(?:\\.\\d+)?)';

export function normalizeEquipmentSize(
  category: EquipmentCategory,
  value: string | null,
): string | null {
  if (value === null) return null;
  if (typeof value !== 'string')
    throw new BadRequestException('Invalid equipment size');
  const size = value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
  const fail = (): never => {
    throw new BadRequestException('Invalid size for equipment category');
  };
  if (!size) return fail();
  if (category === EquipmentCategory.OTHER) return size;
  if (category === EquipmentCategory.BOOTS) {
    const match = new RegExp(`^${numeric}\\s*(CM|MM)?$`).exec(size);
    if (!match) return fail();
    const raw = match[1];
    let centimetres = Number(raw);
    if (match[2] === 'MM') centimetres /= 10;
    else if (!match[2]) {
      const digits = raw.split('.')[0].length;
      if (digits === 3 && !raw.includes('.')) centimetres /= 10;
      else if (!raw.includes('.') && digits !== 2) return fail();
    }
    if (
      !Number.isFinite(centimetres) ||
      centimetres <= 0 ||
      !Number.isInteger(centimetres * 2)
    )
      return fail();
    return centimetres.toFixed(1);
  }
  if (
    category === EquipmentCategory.CLOTHING ||
    category === EquipmentCategory.HELMET
  ) {
    const label = labels[size.replace(/[\s-]/g, '')];
    if (
      label &&
      (category === EquipmentCategory.CLOTHING ||
        !['2XL', '3XL'].includes(label))
    )
      return label;
    if (category === EquipmentCategory.HELMET) {
      const match = new RegExp(`^${numeric}\\s*-\\s*${numeric}\\s*CM$`).exec(
        size,
      );
      if (match) {
        const lower = Number(match[1]),
          upper = Number(match[2]);
        if (
          Number.isFinite(lower) &&
          Number.isFinite(upper) &&
          lower > 0 &&
          upper > lower
        )
          return `${lower}-${upper} CM`;
      }
    }
    return fail();
  }
  if (
    [
      EquipmentCategory.SKI,
      EquipmentCategory.SNOWBOARD,
      EquipmentCategory.POLES,
    ].includes(category)
  ) {
    const match = new RegExp(`^${numeric}\\s*(?:CM)?$`).exec(size);
    const length = match ? Number(match[1]) : NaN;
    if (Number.isFinite(length) && length > 0) return `${length} CM`;
  }
  return fail();
}
