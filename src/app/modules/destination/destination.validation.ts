import { Types } from "mongoose";
import z from "zod";

export const createDestinationZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name should not exceed 100 characters"),

  summary: z
    .string({ invalid_type_error: "Summary must be string" })
    .max(300, "Summary should not exceed 300 characters")
    .optional(),

  description: z
    .string({ invalid_type_error: "Description must be string" })
    .optional(),

  startingPrice: z
    .number({ invalid_type_error: "Starting price must be a number" })
    .min(0, "Starting price must be 0 or greater")
    .optional(),

  duration: z
    .string({ invalid_type_error: "Duration must be string" })
    .optional(),

  district: z
    .string({ invalid_type_error: "District must be string" })
    .optional(),

  attractions: z
    .array(z.string({ invalid_type_error: "Each attraction must be a string" }))
    .optional(),

  bestTimeToVisit: z
    .string({ invalid_type_error: "Best time to visit must be string" })
    .optional(),

  division: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId for division",
  }),

  isFeatured: z.boolean().optional(),
});

export const updateDestinationZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name should not exceed 100 characters")
    .optional(),

  summary: z
    .string({ invalid_type_error: "Summary must be string" })
    .max(300, "Summary should not exceed 300 characters")
    .optional(),

  description: z
    .string({ invalid_type_error: "Description must be string" })
    .optional(),

  startingPrice: z
    .number({ invalid_type_error: "Starting price must be a number" })
    .min(0, "Starting price must be 0 or greater")
    .optional(),

  duration: z
    .string({ invalid_type_error: "Duration must be string" })
    .optional(),

  district: z
    .string({ invalid_type_error: "District must be string" })
    .optional(),

  attractions: z
    .array(z.string({ invalid_type_error: "Each attraction must be a string" }))
    .optional(),

  bestTimeToVisit: z
    .string({ invalid_type_error: "Best time to visit must be string" })
    .optional(),

  division: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId for division",
    })
    .optional(),

  isFeatured: z.boolean().optional(),

  deleteImageUrls: z.array(z.string().url()).optional(),
});
