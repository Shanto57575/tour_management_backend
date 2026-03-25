import { model, Schema } from "mongoose";
import { ITour, ITourPlan, ITourType } from "./tour.interface";
import slugify from "slugify";

// ─── Tour Type Schema ─────────────────────────────────────────
const tourTypeSchema = new Schema<ITourType>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true, versionKey: false },
);

export const TourType = model<ITourType>("TourType", tourTypeSchema);

// ─── Tour Plan Sub-document ───────────────────────────────────
const tourPlanSchema = new Schema<ITourPlan>(
  {
    day:         { type: Number, required: true },
    title:       { type: String, required: true },
    description: { type: String },
    meals:       { type: [String], default: [] }, // ["breakfast", "lunch", "dinner"]
  },
  { _id: false },
);

// ─── Main Tour Schema ─────────────────────────────────────────
const tourSchema = new Schema<ITour>(
  {
    // ─── Core Info ────────────────────────────────────────────
    title:       { type: String, required: true },
    slug:        { type: String, unique: true },
    description: { type: String },
    images:      { type: [String], default: [] },
    tags:        { type: [String], default: [] },

    // ─── Location ─────────────────────────────────────────────
    division:           { type: Schema.Types.ObjectId, ref: "Division", required: true },
    district:           { type: Schema.Types.ObjectId, ref: "District", required: true },
    destination:        { type: Schema.Types.ObjectId, ref: "Destination", required: true },
    departureLocation:  { type: String },
    arrivalLocation:    { type: String },

    // ─── Guide & Type ─────────────────────────────────────────
    guide:    { type: Schema.Types.ObjectId, ref: "User" },
    tourType: { type: Schema.Types.ObjectId, ref: "TourType", required: true },

    // ─── Pricing ──────────────────────────────────────────────
    pricePerPerson: { type: Number, required: true },
    discount:       { type: Number, default: 0 },   // percentage e.g. 10 = 10%

    // ─── Schedule ─────────────────────────────────────────────
    startDate:      { type: Date },
    endDate:        { type: Date },
    durationDays:   { type: Number },               // 3
    durationNights: { type: Number },               // 2

    // ─── Group & Guests ───────────────────────────────────────
    maxGuest:   { type: Number },
    minAge:     { type: Number },
    bookedCount:{ type: Number, default: 0 },
    groupType:  { type: String, enum: ["private", "group", "both"], default: "group" },

    // ─── Details ──────────────────────────────────────────────
    difficulty: { type: String, enum: ["easy", "moderate", "hard"] },
    languages:  { type: [String], default: ["English"] },
    included:   { type: [String], default: [] },
    excluded:   { type: [String], default: [] },
    amenities:  { type: [String], default: [] },
    tourPlan:   { type: [tourPlanSchema], default: [] },
    cancellationPolicy: { type: String },

    // ─── Flags & Status ───────────────────────────────────────
    isFeatured:  { type: Boolean, default: false },
    isTrending:  { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    status:      { type: String, enum: ["active", "inactive"], default: "active" },

    // ─── Reviews (computed, updated by review service) ────────
    averageRating: { type: Number, default: 0 },
    totalReviews:  { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

// ─── Slug Generation ──────────────────────────────────────────
tourSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

tourSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<ITour>;
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  this.setUpdate(update);
  next();
});

// ─── Auto-set isAvailable based on bookedCount ────────────────
tourSchema.pre("save", function (next) {
  if (this.maxGuest && this.bookedCount >= this.maxGuest) {
    this.isAvailable = false;
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────
tourSchema.index({ division: 1 });
tourSchema.index({ district: 1 });
tourSchema.index({ destination: 1 });
tourSchema.index({ tourType: 1 });
tourSchema.index({ status: 1 });
tourSchema.index({ isFeatured: 1 });
tourSchema.index({ isTrending: 1 });
tourSchema.index({ pricePerPerson: 1 });
tourSchema.index({ startDate: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ status: 1, isAvailable: 1, division: 1 }); // compound for filtering

export const Tour = model<ITour>("Tour", tourSchema);