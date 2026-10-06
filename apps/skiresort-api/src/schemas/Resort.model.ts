import { Schema } from 'mongoose';
import {
  ResortFacilities,
  ResortLevel,
  ResortLocation,
  ResortStatus,
} from '../libs/enums/resort.enum';

export const resortIdentityCollation = { locale: 'en', strength: 2 };

const ResortSchema = new Schema(
  {
    resortStatus: {
      type: String,
      enum: ResortStatus,
      required: true,
      default: ResortStatus.ACTIVE,
    },
    resortTitle: { type: String, required: true, trim: true },
    resortLocation: { type: String, enum: ResortLocation, required: true },
    resortAddress: { type: String, required: true, trim: true },
    resortPricePerDay: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isFinite,
    },
    resortMinDays: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: Number.isInteger,
    },
    resortLevel: { type: String, enum: ResortLevel, default: null },
    resortImages: { type: [String], required: true, default: undefined },
    resortFacilities: {
      type: [{ type: String, enum: ResortFacilities }],
      default: null,
    },
    resortDesc: { type: String, default: null },
    resortViews: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    resortLikes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    resortComments: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'resorts', versionKey: false },
);

ResortSchema.index(
  { resortLocation: 1, resortTitle: 1, resortAddress: 1, resortLevel: 1 },
  {
    unique: true,
    name: 'unique_resort_identity_with_level',
    collation: resortIdentityCollation,
  },
);

export default ResortSchema;
