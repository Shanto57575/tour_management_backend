import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";
import slugify from "slugify";

const divisionSchema = new Schema<IDivision>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

divisionSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

divisionSchema.pre("findOneAndUpdate", function (next) {
  const division = this.getUpdate() as Partial<IDivision>;

  if (division.name) {
    division.slug = slugify(division.name, { lower: true, strict: true });
  }

  this.setUpdate(division);

  next();
});
export const Division = model<IDivision>("Division", divisionSchema);
