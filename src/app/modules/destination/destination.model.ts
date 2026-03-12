import { model, Schema } from "mongoose";
import slugify from "slugify";
import { IDestination } from "./destination.interface";

const destinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    summary: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    startingPrice: {
      type: Number,
      min: 0,
    },

    duration: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    attractions: {
      type: [String],
      default: [],
    },

    bestTimeToVisit: {
      type: String,
      trim: true,
    },

    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// create slug
destinationSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});


// update slug if name changes
destinationSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<IDestination>;

  if (update.name) {
    update.slug = slugify(update.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  this.setUpdate(update);

  next();
});


export const Destination = model<IDestination>(
  "Destination",
  destinationSchema
);