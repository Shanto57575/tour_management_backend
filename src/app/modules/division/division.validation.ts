import z from "zod";

export const createDivisionZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  slug: z
    .string({ invalid_type_error: "slug must be string" })
    .min(3, { message: "slug must be at least 3 characters long" })
    .max(30, { message: "slug cannot exceed 30 characters" })
    .optional(),
  thumbnail: z
    .string({ invalid_type_error: "thumbnail url must be string" })
    .optional(),
  description: z
    .string({ invalid_type_error: "description must be string" })
    .min(20, { message: "description must be at least 20 characters long" })
    .max(200, { message: "description cannot exceed 200 characters" })
    .optional(),
});

export const updateDivisionZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .optional(),
  slug: z
    .string({ invalid_type_error: "slug must be string" })
    .min(3, { message: "slug must be at least 3 characters long" })
    .max(30, { message: "slug cannot exceed 30 characters" })
    .optional(),
  thumbnail: z
    .string({ invalid_type_error: "thumbnail url must be string" })
    .optional(),
  description: z
    .string({ invalid_type_error: "description must be string" })
    .min(20, { message: "description must be at least 20 characters long" })
    .max(200, { message: "description cannot exceed 200 characters" })
    .optional(),
});
