import { Schema } from 'mongoose';
import { EventStatus } from '../libs/enums/event.enum';

const EventSchema = new Schema(
  {
    eventTitle: { type: String, required: true, trim: true },
    eventDesc: { type: String, required: true, trim: true },
    eventImages: {
      type: [String],
      required: true,
      default: undefined,
      validate: (images: string[]) =>
        Array.isArray(images) &&
        images.length >= 1 &&
        images.length <= 5 &&
        new Set(images).size === images.length &&
        images.every((path) =>
          /^uploads\/events\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg)$/i.test(path),
        ),
    },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    eventStatus: {
      type: String,
      enum: EventStatus,
      required: true,
      default: EventStatus.DRAFT,
    },
    eventLocation: {
      type: String,
      trim: true,
      default: null,
      validate: (value: string | null) => value === null || value.length > 0,
    },
    resortId: { type: Schema.Types.ObjectId, ref: 'Resort', default: null },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  },
  { collection: 'events', timestamps: true, versionKey: false },
);

EventSchema.pre('validate', function () {
  if (
    this.eventStartDate &&
    this.eventEndDate &&
    this.eventEndDate <= this.eventStartDate
  )
    this.invalidate('eventEndDate', 'Event end must be after start');
});

export default EventSchema;
