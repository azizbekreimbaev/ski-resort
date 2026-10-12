import type { FunctionDeclaration } from '@google/genai';
import {
  EquipmentAudience,
  EquipmentCategory,
} from '../../libs/enums/equipment.enum';
import {
  ResortFacilities,
  ResortLevel,
  ResortLocation,
} from '../../libs/enums/resort.enum';

const text = { type: 'string', maxLength: 200 };
const id = { type: 'string', pattern: '^[a-fA-F0-9]{24}$' };
const range = {
  type: 'object',
  properties: {
    start: { type: 'number', minimum: 0 },
    end: { type: 'number', minimum: 0 },
  },
  required: ['start', 'end'],
  additionalProperties: false,
};
const enumArray = (values: string[]) => ({
  type: 'array',
  maxItems: 20,
  items: { type: 'string', enum: values },
});

export const assistantTools: FunctionDeclaration[] = [
  {
    name: 'searchFaqs',
    description:
      'Search published SkiResort FAQs. text is an optional short keyword, not the entire question. Returns up to five records; not an exhaustive inventory.',
    parametersJsonSchema: {
      type: 'object',
      properties: { text },
      additionalProperties: false,
    },
  },
  {
    name: 'searchResorts',
    description:
      'Search publicly visible SkiResort resorts by title keyword or filters. Returns up to five records, including their actual status; do not infer booking availability.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        text,
        locationList: enumArray(Object.values(ResortLocation)),
        levelList: enumArray(Object.values(ResortLevel)),
        facilities: enumArray(Object.values(ResortFacilities)),
        pricesRange: range,
      },
      additionalProperties: false,
    },
  },
  {
    name: 'searchEquipments',
    description:
      'Search public equipment by name keyword or filters. Rental price filters require rentalDurationHours; sizeList requires exactly one category. Returns up to five records. Stock quantity does not establish real-time availability.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        text,
        resortId: id,
        categoryList: enumArray(Object.values(EquipmentCategory)),
        audienceList: enumArray(Object.values(EquipmentAudience)),
        sizeList: { type: 'array', maxItems: 20, items: text },
        equipmentBrand: text,
        equipmentPurchasable: { type: 'boolean' },
        rentalDurationHours: {
          type: 'integer',
          minimum: 1,
          maximum: 2147483647,
        },
        rentalPricesRange: range,
        purchasePricesRange: range,
      },
      additionalProperties: false,
    },
  },
  {
    name: 'searchEvents',
    description:
      'Search published SkiResort events by title/description keyword or resort ID. Returns up to five records; use dates to distinguish past and upcoming events.',
    parametersJsonSchema: {
      type: 'object',
      properties: { text, resortId: id },
      additionalProperties: false,
    },
  },
];
