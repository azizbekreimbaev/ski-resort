import { Schema } from 'mongoose';
import { FaqStatus } from '../libs/enums/faq.enum';

const FaqSchema = new Schema(
  {
    faqQuestion: { type: String, required: true, trim: true },
    faqAnswer: { type: String, required: true, trim: true },
    faqStatus: {
      type: String,
      enum: FaqStatus,
      required: true,
      default: FaqStatus.DRAFT,
    },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  },
  { collection: 'faqs', timestamps: true, versionKey: false },
);
export default FaqSchema;
