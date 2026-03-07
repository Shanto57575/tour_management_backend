import { model, Schema } from "mongoose";
import { GuideApplicationStatus, IGuideApplication } from "./guide.interface";

const guideApplicationSchema = new Schema<IGuideApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nidPhoto: {
      type: String,
      required: true,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GuideApplicationStatus),
      default: GuideApplicationStatus.PENDING,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

// Add requested indexes for optimizations
guideApplicationSchema.index({ user: 1 });
guideApplicationSchema.index({ status: 1 });
guideApplicationSchema.index({ division: 1 });
guideApplicationSchema.index({ createdAt: 1 });

export const GuideApplication = model<IGuideApplication>(
  "GuideApplication",
  guideApplicationSchema,
);
