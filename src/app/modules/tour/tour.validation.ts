import mongoose from "mongoose";
import z from "zod";

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

export const createTourZodSchema = z.object({
  title: z
    .string({ invalid_type_error: "title must be string" })
    .min(2, "Title must be 2 characters long")
    .max(50, "Title should not exceed 50 characters"),

  slug: z
    .string({ invalid_type_error: "Slug must be string" })
    .min(2, "Slug must be 2 characters long")
    .max(50, "Slug should not exceed 50 characters")
    .optional(),

  description: z
    .string({ invalid_type_error: "description must be string" })
    .min(20, { message: "description must be at least 20 characters long" })
    .max(200, { message: "description cannot exceed 200 characters" })
    .optional(),

  location: z
    .string({ invalid_type_error: "location must be string" })
    .min(2, "Location must be at least 2 characters long")
    .max(200, "Location cannot exceed 200 characters")
    .optional(),

  costFrom: z.number({ invalid_type_error: "cost must be Number" }).optional(),

  startDate: z.string().optional().optional(),

  endDate: z.string().optional().optional(),

  maxGuest: z.number({ invalid_type_error: "guest must be Number" }).optional(),

  minAge: z.number({ invalid_type_error: "age must be Number" }).optional(),

  division: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId for division",
  }),

  tourType: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId for tour type",
  }),

  images: z.array(z.string()).optional(),

  included: z.array(z.string()).optional(),

  excluded: z.array(z.string()).optional(),

  amenities: z.array(z.string()).optional(),

  tourPlan: z.array(z.string()).optional(),
});

export const updateTourZodSchema = z.object({
  title: z
    .string({ invalid_type_error: "Title must be string" })
    .min(2, "Title must be at least 2 characters long")
    .max(50, "Title should not exceed 50 characters")
    .optional(),

  slug: z
    .string({ invalid_type_error: "Slug must be string" })
    .min(2, "Slug must be at least 2 characters long")
    .max(50, "Slug should not exceed 50 characters")
    .optional(),

  description: z
    .string({ invalid_type_error: "Description must be string" })
    .min(20, "Description must be at least 20 characters long")
    .max(200, "Description cannot exceed 200 characters")
    .optional(),

  location: z
    .string({ invalid_type_error: "Location must be string" })
    .min(2, "Location must be at least 2 characters long")
    .max(200, "Location cannot exceed 200 characters")
    .optional(),

  costFrom: z.number({ invalid_type_error: "Cost must be number" }).optional(),

  startDate: z.string().optional().optional(),

  endDate: z.string().optional().optional(),

  maxGuest: z
    .number({ invalid_type_error: "Max guest must be number" })
    .optional(),

  minAge: z.number({ invalid_type_error: "Min age must be number" }).optional(),

  division: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId for division",
    })
    .optional(),

  tourType: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId for tourType",
    })
    .optional(),

  images: z.array(z.string()).optional(),

  included: z.array(z.string()).optional(),

  excluded: z.array(z.string()).optional(),

  amenities: z.array(z.string()).optional(),

  tourPlan: z.array(z.string()).optional(),
});
