import { model, Schema } from "mongoose";
import { GuideApplicationStatus, IGuideApplication } from "./guide.interface";

const statusLogSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(GuideApplicationStatus),
      required: true,
    },
    reason: { type: String, default: null },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const guideApplicationSchema = new Schema<IGuideApplication>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profilePhoto:           { type: String, required: true },
    dateOfBirth:            { type: Date, required: true },
    gender:                 { type: String, enum: ["male", "female", "other"], required: true },
    phone:                  { type: String, required: true },
    alternatePhone:         { type: String },
    presentAddress:         { type: String, required: true },
    permanentAddress:       { type: String, required: true },

    nidNumber:              { type: String, required: true },
    nidFrontPhoto:          { type: String, required: true },
    nidBackPhoto:           { type: String, required: true },

    division:               { type: Schema.Types.ObjectId, ref: "Division", required: true },
    district:               { type: Schema.Types.ObjectId, ref: "District", required: true },
    operatingAreas:         { type: [String], default: [] },

    languages:              { type: [String], required: true },
    experienceYears:        { type: Number, default: 0 },
    specializations:        { type: [String], enum: ["historical", "adventure", "eco-tourism", "heritage", "religious", "beach", "hill-trekking", "city-tour", "wildlife", "food-tourism"] },
    bio:                    { type: String, maxlength: 1000 },

    licenseNumber:          { type: String },
    licensePhoto:           { type: String },
    licenseVerified:        { type: Boolean, default: false },

    bankName:               { type: String },
    bankAccountNumber:      { type: String },
    bankBranchName:         { type: String },
    bkashNumber:            { type: String },
    nagadNumber:            { type: String },

    emergencyContactName:   { type: String },
    emergencyContactPhone:  { type: String },
    emergencyContactRelation: { type: String },

    // ─── Cloudinary Public IDs (for deletion) ─────────────────
    profilePhotoPublicId:   { type: String },
    nidFrontPublicId:       { type: String },
    nidBackPublicId:        { type: String },
    licensePhotoPublicId:   { type: String },

    status: {
      type: String,
      enum: Object.values(GuideApplicationStatus),
      default: GuideApplicationStatus.PENDING,
    },
    submittedAt:            { type: Date, default: Date.now },
    resubmissionCount:      { type: Number, default: 0 },
    nidVerified:            { type: Boolean, default: false },

    statusHistory:          { type: [statusLogSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

// ─── Indexes ──────────────────────────────────────────────────
guideApplicationSchema.index({ user: 1 });
guideApplicationSchema.index({ status: 1 });
guideApplicationSchema.index({ division: 1 });
guideApplicationSchema.index({ district: 1 });
guideApplicationSchema.index({ status: 1, division: 1 });
guideApplicationSchema.index({ createdAt: 1 });

export const GuideApplication = model<IGuideApplication>(
  "GuideApplication",
  guideApplicationSchema,
);
