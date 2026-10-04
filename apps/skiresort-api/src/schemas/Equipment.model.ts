import { Schema } from 'mongoose';
import {
  EquipmentAudience,
  EquipmentCategory,
  EquipmentStatus,
} from '../libs/enums/equipment.enum';
import { normalizeEquipmentSize } from '../components/equipment/equipment-size';

const integer = {
  type: Number,
  required: true,
  min: 0,
  max: 2147483647,
  validate: Number.isInteger,
};
const EquipmentRentalRateSchema = new Schema(
  {
    durationHours: { ...integer, min: 1 },
    price: { type: Number, required: true, min: 0, validate: Number.isFinite },
  },
  { _id: false },
);

const EquipmentSchema = new Schema(
  {
    resortId: { type: Schema.Types.ObjectId, ref: 'Resort', default: null },
    equipmentStatus: {
      type: String,
      enum: EquipmentStatus,
      required: true,
      default: EquipmentStatus.AVAILABLE,
    },
    equipmentCategory: {
      type: String,
      enum: EquipmentCategory,
      required: true,
    },
    equipmentName: { type: String, required: true, trim: true },
    equipmentBrand: {
      type: String,
      trim: true,
      default: null,
      validate: (value: string | null) => value === null || value.length > 0,
    },
    equipmentSize: { type: String, default: null },
    equipmentAudience: {
      type: String,
      enum: EquipmentAudience,
      required: true,
      default: EquipmentAudience.ALL,
    },
    equipmentRentalRates: {
      type: [EquipmentRentalRateSchema],
      required: true,
      default: undefined,
      validate: (rates: { durationHours: number }[]) =>
        Array.isArray(rates) &&
        rates.length > 0 &&
        new Set(rates.map((rate) => rate.durationHours)).size === rates.length,
    },
    equipmentPurchasable: { type: Boolean, required: true, default: false },
    equipmentPurchasePrice: {
      type: Number,
      default: null,
      min: 0,
      validate: (value: number | null) =>
        value === null || Number.isFinite(value),
    },
    equipmentQuantity: integer,
    equipmentImages: { type: [String], default: null },
    equipmentDesc: { type: String, default: null },
    equipmentViews: { ...integer, default: 0 },
    equipmentLikes: { ...integer, default: 0 },
    equipmentComments: { ...integer, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'equipments', versionKey: false },
);

// Document validation supplements the service's final-state validation.
EquipmentSchema.pre('validate', function () {
  try {
    this.equipmentSize = normalizeEquipmentSize(
      this.equipmentCategory,
      this.equipmentSize ?? null,
    );
  } catch {
    this.invalidate('equipmentSize', 'Invalid size for equipment category');
  }
  if (
    this.equipmentPurchasable
      ? this.equipmentPurchasePrice == null
      : this.equipmentPurchasePrice != null
  ) {
    this.invalidate(
      'equipmentPurchasePrice',
      'Purchase price must match purchasable capability',
    );
  }
  if (this.equipmentRentalRates)
    this.equipmentRentalRates.sort((a, b) => a.durationHours - b.durationHours);
});

export default EquipmentSchema;
