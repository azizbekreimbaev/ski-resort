import { Schema } from 'mongoose';
import { InstructorApplicationStatus } from '../libs/enums/instructor-application.enum';
import { InstructorAudience, InstructorLevel } from '../libs/enums/member.enum';

const InstructorApplicationSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    applicationStatus: {
      type: String,
      enum: InstructorApplicationStatus,
      required: true,
      default: InstructorApplicationStatus.PENDING,
    },
    instructorExperienceYears: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    instructorLanguages: {
      type: [String],
      required: true,
      default: undefined,
      validate: (value: string[]) =>
        value.length > 0 &&
        value.every((language) => language.trim().length > 0),
    },
    instructorLevel: { type: String, enum: InstructorLevel, required: true },
    instructorAudience: {
      type: String,
      enum: InstructorAudience,
      required: true,
    },
    instructorResortId: {
      type: Schema.Types.ObjectId,
      ref: 'Resort',
      default: null,
    },
    memberDesc: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Member', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true, collection: 'instructorApplications', versionKey: false },
);

InstructorApplicationSchema.index(
  { memberId: 1 },
  {
    name: 'unique_pending_instructor_application',
    unique: true,
    partialFilterExpression: {
      applicationStatus: InstructorApplicationStatus.PENDING,
    },
  },
);

export default InstructorApplicationSchema;
