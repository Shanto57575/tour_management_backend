import { z } from "zod";
import { GuideApplicationStatus } from "./guide.interface";

const parseJsonArray = (value: unknown) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return value;

  const lowered = value.toLowerCase().trim();
  if (lowered === "true") return true;
  if (lowered === "false") return false;

  return value;
};

const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
const nidRegex = /^(?:\d{10}|\d{13}|\d{17})$/;

const isAdult = (dateOfBirth: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age >= 18;
};

const guideBaseSchema = z.object({
  profilePhoto: z.string().optional(),
  profilePhotoPublicId: z.string().optional(),
  dateOfBirth: z
    .coerce.date({
      required_error: "Date of birth is required",
    })
    .refine((value) => value <= new Date(), {
      message: "Date of birth cannot be in the future",
    })
    .refine((value) => isAdult(value), {
      message: "Applicant must be at least 18 years old",
    }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
  }),
  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .regex(bdPhoneRegex, "Enter a valid Bangladeshi phone number"),
  alternatePhone: z.string().optional(),
  presentAddress: z
    .string({ required_error: "Present address is required" })
    .min(2),
  permanentAddress: z
    .string({ required_error: "Permanent address is required" })
    .min(2),

  nidNumber: z
    .string({ required_error: "NID number is required" })
    .trim()
    .regex(nidRegex, "NID must be 10, 13, or 17 digits"),
  nidFrontPhoto: z.string().optional(),
  nidBackPhoto: z.string().optional(),
  nidFrontPublicId: z.string().optional(),
  nidBackPublicId: z.string().optional(),

  division: z.string({ required_error: "Division is required" }),
  district: z.string({ required_error: "District is required" }),
  operatingAreas: z
    .preprocess(parseJsonArray, z.array(z.string().min(1)))
    .optional(),

  languages: z.preprocess(
    parseJsonArray,
    z
      .array(z.string().min(1), { required_error: "Languages are required" })
      .min(1, "At least one language is required"),
  ),
  experienceYears: z.coerce.number().min(0).optional(),
  specializations: z
    .preprocess(
      parseJsonArray,
      z.array(
        z.enum([
          "historical",
          "adventure",
          "eco-tourism",
          "heritage",
          "religious",
          "beach",
          "hill-trekking",
          "city-tour",
          "wildlife",
          "food-tourism",
        ]),
      ),
    )
    .optional(),
  bio: z.string().max(1000).optional(),

  licenseNumber: z.string().optional(),
  licensePhoto: z.string().optional(),
  licensePhotoPublicId: z.string().optional(),
  licenseVerified: z.preprocess(parseBoolean, z.boolean()).optional(),

  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranchName: z.string().optional(),
  bkashNumber: z.string().optional(),
  nagadNumber: z.string().optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

export const createGuideApplicationZodSchema = guideBaseSchema;

export const updateGuideApplicationZodSchema = guideBaseSchema.partial();

export const updateGuideStatusZodSchema = z.object({
  status: z.enum(
    [GuideApplicationStatus.APPROVED, GuideApplicationStatus.REJECTED],
    {
      required_error: "Status is required",
      invalid_type_error: "Status must be APPROVED or REJECTED",
    },
  ),
  reason: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  if (
    data.status === GuideApplicationStatus.REJECTED &&
    (!data.reason || data.reason.length === 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["reason"],
      message: "Reason is required when rejecting an application",
    });
  }
});

export const updateGuideActivationZodSchema = z.object({
  isActive: z.boolean({
    required_error: "isActive is required",
    invalid_type_error: "isActive must be boolean",
  }),
});
