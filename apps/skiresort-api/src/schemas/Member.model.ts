import { Schema } from 'mongoose';
import {
  InstructorAudience,
  InstructorLevel,
  MemberAuthType,
  MemberStatus,
  MemberType,
} from '../libs/enums/member.enum';

const MemberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberAuthType: {
      type: String,
      enum: MemberAuthType,
      default: MemberAuthType.PHONE,
    },

    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberPassword: {
      type: String,
      select: false,
      required: true,
    },

    memberFullName: {
      type: String,
    },

    memberImage: {
      type: String,
      default: '',
    },

    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    instructorResortId: {
      type: Schema.Types.ObjectId,
      ref: 'Resort',
      default: null,
    },
    instructorExperienceYears: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isInteger(value),
      },
    },
    instructorLanguages: {
      type: [String],
      default: null,
      validate: {
        validator: (value: string[] | null) =>
          value == null ||
          value.every((language) => language.trim().length > 0),
      },
    },
    instructorLevel: { type: String, enum: InstructorLevel, default: null },
    instructorAudience: {
      type: String,
      enum: InstructorAudience,
      default: null,
    },
    instructorPrice1Week: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },
    instructorPrice2Weeks: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },
    instructorPrice3Weeks: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },
    instructorPrice4Weeks: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },

    memberProperties: {
      type: Number,
      default: 0,
    },

    memberArticles: {
      type: Number,
      default: 0,
    },

    memberFollowers: {
      type: Number,
      default: 0,
    },

    memberFollowings: {
      type: Number,
      default: 0,
    },

    memberPoints: {
      type: Number,
      default: 0,
    },

    memberLikes: {
      type: Number,
      default: 0,
    },

    memberViews: {
      type: Number,
      default: 0,
    },

    memberComments: {
      type: Number,
      default: 0,
    },

    memberRank: {
      type: Number,
      default: 0,
    },

    memberWarnings: {
      type: Number,
      default: 0,
    },

    memberBlocks: {
      type: Number,
      default: 0,
    },

    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: 'members' },
);

export default MemberSchema;
