import { model, Schema } from "mongoose";
import { IGuideProfile } from "./guideProfile.interface";

const guideProfileSchema = new Schema<IGuideProfile>(
  {
    user:        { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    application: { type: Schema.Types.ObjectId, ref: "GuideApplication", required: true },

    avgRating:    { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      five:  { type: Number, default: 0 },
      four:  { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two:   { type: Number, default: 0 },
      one:   { type: Number, default: 0 },
    },

    // ─── Tour Stats ────────────────────────────────────────────────
    completedTours:  { type: Number, default: 0 },
    cancelledTours:  { type: Number, default: 0 },
    ongoingTourId:   { type: Schema.Types.ObjectId, ref: "Tour", default: null },

    // ─── Availability ──────────────────────────────────────────────
    isAvailable: { type: Boolean, default: true },
    isActive:    { type: Boolean, default: true }, // admin can deactivate

    // ─── Response Rate (updated when guide accepts/declines requests) ─
    responseRate:    { type: Number, default: 100, min: 0, max: 100 }, // percent
    totalRequests:   { type: Number, default: 0 },
    acceptedRequests:{ type: Number, default: 0 },

    // ─── Featured / Badges ────────────────────────────────────────
    isFeatured:  { type: Boolean, default: false },
    badges: {
      type: [String],
      enum: ["TOP-RATED", "EXPERIENCED", "QUICK-RESPONDER", "LOCAL-EXPERT", "ECO-FRIENDLY"],
      default: [],
    },

    // ─── Last Active ──────────────────────────────────────────────
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

guideProfileSchema.index({ user: 1 }, { unique: true });
guideProfileSchema.index({ avgRating: -1 });
guideProfileSchema.index({ completedTours: -1 });
guideProfileSchema.index({ isAvailable: 1, isActive: 1 });
guideProfileSchema.index({ isFeatured: 1 });

export const GuideProfile = model<IGuideProfile>("GuideProfile", guideProfileSchema);