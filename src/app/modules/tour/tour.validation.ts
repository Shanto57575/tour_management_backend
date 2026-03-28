import mongoose from "mongoose";
import z from "zod";

const objectIdSchema = (fieldName: string) =>
  z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: `Invalid ObjectId for ${fieldName}`,
  });

const tourPlanItemZodSchema = z.object({
  day: z.coerce
    .number({ invalid_type_error: "tour plan day must be a number" })
    .int("tour plan day must be an integer")
    .min(1, "tour plan day must be at least 1"),
  title: z
    .string({ invalid_type_error: "tour plan title must be string" })
    .min(1, "tour plan title is required"),
  description: z
    .string({ invalid_type_error: "tour plan description must be string" })
    .optional(),
  meals: z.array(z.string()).optional(),
});

const baseTourZodShape = {
  title: z
    .string({ invalid_type_error: "title must be string" })
    .min(2, "Title must be 2 characters long")
    .max(50, "Title should not exceed 50 characters"),

  slug: z
    .string({ invalid_type_error: "Slug must be string" })
    .min(2, "Slug must be 2 characters long")
    .max(100, "Slug should not exceed 100 characters")
    .optional(),

  description: z
    .string({ invalid_type_error: "description must be string" })
    .min(2, { message: "description must be at least 2 characters long" })
    .max(1000, { message: "description cannot exceed 1000 characters" })
    .optional(),

  pricePerPerson: z.coerce
    .number({ invalid_type_error: "price per person must be a number" })
    .min(0, "price per person cannot be negative"),

  discount: z.coerce
    .number({ invalid_type_error: "discount must be number" })
    .min(0, "discount cannot be negative")
    .max(100, "discount cannot exceed 100")
    .optional(),

  startDate: z.coerce.date().optional(),

  endDate: z.coerce.date().optional(),

  durationDays: z.coerce
    .number({ invalid_type_error: "duration days must be number" })
    .int("duration days must be an integer")
    .min(1, "duration days must be at least 1")
    .optional(),

  durationNights: z.coerce
    .number({ invalid_type_error: "duration nights must be number" })
    .int("duration nights must be an integer")
    .min(0, "duration nights cannot be negative")
    .optional(),

  maxGuest: z.coerce
    .number({ invalid_type_error: "guest must be number" })
    .int("max guest must be an integer")
    .min(1, "max guest must be at least 1")
    .optional(),

  minAge: z.coerce
    .number({ invalid_type_error: "age must be number" })
    .int("min age must be an integer")
    .min(0, "min age cannot be negative")
    .optional(),

  division: objectIdSchema("division"),

  district: objectIdSchema("district"),

  destination: objectIdSchema("destination"),

  guide: objectIdSchema("guide").optional(),

  tourType: objectIdSchema("tour type"),

  images: z.array(z.string()).optional(),

  tags: z.array(z.string()).optional(),

  included: z.array(z.string()).optional(),

  excluded: z.array(z.string()).optional(),

  amenities: z.array(z.string()).optional(),

  languages: z.array(z.string()).optional(),

  tourPlan: z.array(tourPlanItemZodSchema).optional(),

  departureLocation: z.string().optional(),

  arrivalLocation: z.string().optional(),

  cancellationPolicy: z.string().optional(),

  isFeatured: z.boolean().optional(),

  isTrending: z.boolean().optional(),

  isAvailable: z.boolean().optional(),

  difficulty: z.enum(["easy", "moderate", "hard"]).optional(),

  groupType: z.enum(["private", "group", "both"]).optional(),

  status: z.enum(["active", "inactive"]).optional(),
} satisfies z.ZodRawShape;

const validateTourDateRange = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((value, ctx) => {
    const tourData = value as {
      startDate?: Date;
      endDate?: Date;
    };

    if (
      tourData.startDate &&
      tourData.endDate &&
      tourData.startDate > tourData.endDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "end date must be after start date",
      });
    }
  });

export const createTourTypeZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "tour type must be string" })
    .min(2, "tour type should be 2 character long at least")
    .max(50, "tour type should not exceed 50 character"),
});

export const updateTourTypeZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "tour type must be string" })
    .min(2, "tour type should be 2 character long at least")
    .max(50, "tour type should not exceed 50 character")
    .optional(),
});

export const createTourZodSchema = validateTourDateRange(
  z.object(baseTourZodShape),
);

export const updateTourZodSchema = validateTourDateRange(
  z.object({
    ...Object.fromEntries(
      Object.entries(baseTourZodShape).map(([key, value]) => [key, value.optional()]),
    ),
    deleteImages: z
      .preprocess(
        (value) => {
          if (!Array.isArray(value)) return value;
          return value.filter(
            (item) => typeof item === "string" && item.trim().length > 0,
          );
        },
        z.array(z.string()).optional(),
      )
      .optional(),
  }),
);
