"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name cannot exceed 50 characters" }),
    email: zod_1.default
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email address format" })
        .min(5, { message: "Email must be at least 5 characters long" })
        .max(100, { message: "Email cannot exceed 100 characters" }),
    password: zod_1.default
        .string({ invalid_type_error: "Password must be string" })
        .min(8, { message: "password must be at least 8 characters long" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
    }),
    phone: zod_1.default
        .string({ invalid_type_error: "phone number must be string" })
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
        message: "Phone number must be a valid Bangladesh number starting with 01 and be 11 digits long. You may optionally add +88 or 88 in front",
    })
        .optional(),
    address: zod_1.default
        .string({ invalid_type_error: "address must be string" })
        .max(200, { message: "address cannot exceed 200 characters" })
        .optional(),
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name cannot exceed 50 characters" })
        .optional(),
    phone: zod_1.default
        .string({ invalid_type_error: "phone number must be string" })
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
        message: "Phone number must be a valid Bangladesh number starting with 01 and be 11 digits long. You may optionally add +88 or 88 in front",
    })
        .optional(),
    address: zod_1.default
        .string({ invalid_type_error: "address must be string" })
        .max(200, { message: "address cannot exceed 200 characters" })
        .optional(),
    role: zod_1.default.enum(Object.values(user_interface_1.Role)).optional(),
    isActive: zod_1.default.enum(Object.values(user_interface_1.IsActive)).optional(),
    isDeleted: zod_1.default
        .boolean({ invalid_type_error: "IsDeleted must be true or false" })
        .optional(),
    isVerified: zod_1.default
        .boolean({ invalid_type_error: "isVerified must be true or false" })
        .optional(),
});
