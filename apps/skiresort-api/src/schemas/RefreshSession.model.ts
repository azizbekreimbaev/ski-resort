import { Schema, Types } from 'mongoose';

export interface RefreshSession {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  tokenHash: string;
  consumedHashes: string[];
  expiresAt: Date;
  revokedAt: Date | null;
  revocationReason: string | null;
  rotatedAt: Date | null;
}

const RefreshSessionSchema = new Schema<RefreshSession>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    consumedHashes: { type: [String], default: [], index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    revocationReason: { type: String, default: null },
    rotatedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'refreshSessions' },
);

// Retain expired records for seven days so expiration remains distinguishable.
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 604800 });
export default RefreshSessionSchema;
