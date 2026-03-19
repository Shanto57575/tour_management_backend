import { model, Schema } from "mongoose";
import { IDistrict } from "./district.interface";

const districtSchema = new Schema<IDistrict>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
  },
  { timestamps: false, versionKey: false },
);

districtSchema.index({ division: 1 });

export const District = model<IDistrict>("District", districtSchema);