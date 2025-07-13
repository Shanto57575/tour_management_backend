import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z
    .string({ invalid_type_error: "Email must be string" })
    .email({ message: "Invalid email address format" })
    .min(5, { message: "Email must be at least 5 characters long" })
    .max(100, { message: "Email cannot exceed 100 characters" }),
  password: z
    .string({ invalid_type_error: "Password must be string" })
    .min(8, { message: "password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
    }),
  phone: z
    .string({ invalid_type_error: "phone number must be string" })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      message:
        "Phone number must be a valid Bangladesh number starting with 01 and be 11 digits long. You may optionally add +88 or 88 in front",
    })
    .optional(),
  address: z
    .string({ invalid_type_error: "address must be string" })
    .max(200, { message: "address cannot exceed 200 characters" })
    .optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  password: z
    .string({ invalid_type_error: "Password must be string" })
    .min(8, { message: "password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
    })
    .optional(),
  phone: z
    .string({ invalid_type_error: "phone number must be string" })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      message:
        "Phone number must be a valid Bangladesh number starting with 01 and be 11 digits long. You may optionally add +88 or 88 in front",
    })
    .optional(),
  address: z
    .string({ invalid_type_error: "address must be string" })
    .max(200, { message: "address cannot exceed 200 characters" })
    .optional(),
  // .enum(["ADMIN", "GUIDE", "USER", "SUPER_ADMIN"])
  role: z.enum(Object.values(Role) as [string]).optional(),
  isActive: z.enum(Object.values(IsActive) as [string]),
  isDeleted: z.boolean({
    invalid_type_error: "IsDeleted must be true or false",
  }),
  isVerified: z.boolean({
    invalid_type_error: "isVerified must be true or false",
  }),
});
