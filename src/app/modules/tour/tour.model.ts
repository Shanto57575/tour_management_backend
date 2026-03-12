import { model, Schema } from "mongoose";
import { ITour, ITourType } from "./tour.interface";
import slugify from "slugify";

const tourTypeSchema = new Schema<ITourType>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

export const TourType = model<ITourType>("TourType", tourTypeSchema);

const tourSchema = new Schema<ITour>(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
    },

    images: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
    },

    costFrom: {
      type: Number,
    },

    discount: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    included: {
      type: [String],
      default: [],
    },

    excluded: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      default: [],
    },

    tourPlan: {
      type: [String],
      default: [],
    },

    maxGuest: {
      type: Number,
    },

    minAge: {
      type: Number,
    },

    departureLocation: {
      type: String,
    },

    arrivalLocation: {
      type: String,
    },

    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },

    destination: {
      type: Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    tourType: {
      type: Schema.Types.ObjectId,
      ref: "TourType",
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

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

export const Tour = model<ITour>("Tour", tourSchema);
