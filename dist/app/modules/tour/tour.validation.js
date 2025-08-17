"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTourZodSchema = exports.createTourZodSchema = exports.updateTourTypeZodSchema = exports.createTourTypeZodSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = __importDefault(require("zod"));
exports.createTourTypeZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "tour type must be string" })
        .min(2, "tour type should be 2 character long at least")
        .max(50, "tour type should not exceed 50 character"),
});
exports.updateTourTypeZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "tour type must be string" })
        .min(2, "tour type should be 2 character long at least")
        .max(50, "tour type should not exceed 50 character")
        .optional(),
});
exports.createTourZodSchema = zod_1.default.object({
    title: zod_1.default
        .string({ invalid_type_error: "title must be string" })
        .min(2, "Title must be 2 characters long")
        .max(50, "Title should not exceed 50 characters"),
    slug: zod_1.default
        .string({ invalid_type_error: "Slug must be string" })
        .min(2, "Slug must be 2 characters long")
        .max(50, "Slug should not exceed 50 characters")
        .optional(),
    description: zod_1.default
        .string({ invalid_type_error: "description must be string" })
        .min(2, { message: "description must be at least 2 characters long" })
        .max(400, { message: "description cannot exceed 400 characters" })
        .optional(),
    location: zod_1.default
        .string({ invalid_type_error: "location must be string" })
        .min(2, "Location must be at least 2 characters long")
        .max(200, "Location cannot exceed 200 characters")
        .optional(),
    costFrom: zod_1.default.number({ invalid_type_error: "cost must be Number" }).optional(),
    startDate: zod_1.default.string().optional().optional(),
    endDate: zod_1.default.string().optional().optional(),
    maxGuest: zod_1.default.number({ invalid_type_error: "guest must be Number" }).optional(),
    minAge: zod_1.default.number({ invalid_type_error: "age must be Number" }).optional(),
    division: zod_1.default.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId for division",
    }),
    tourType: zod_1.default.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId for tour type",
    }),
    images: zod_1.default.array(zod_1.default.string()).optional(),
    included: zod_1.default.array(zod_1.default.string()).optional(),
    excluded: zod_1.default.array(zod_1.default.string()).optional(),
    amenities: zod_1.default.array(zod_1.default.string()).optional(),
    tourPlan: zod_1.default.array(zod_1.default.string()).optional(),
    departureLocation: zod_1.default.string().optional(),
    arrivalLocation: zod_1.default.string().optional(),
});
exports.updateTourZodSchema = zod_1.default.object({
    title: zod_1.default
        .string({ invalid_type_error: "Title must be string" })
        .min(2, "Title must be at least 2 characters long")
        .max(50, "Title should not exceed 50 characters")
        .optional(),
    slug: zod_1.default
        .string({ invalid_type_error: "Slug must be string" })
        .min(2, "Slug must be at least 2 characters long")
        .max(50, "Slug should not exceed 50 characters")
        .optional(),
    description: zod_1.default
        .string({ invalid_type_error: "Description must be string" })
        .min(20, "Description must be at least 20 characters long")
        .max(400, "Description cannot exceed 400 characters")
        .optional(),
    location: zod_1.default
        .string({ invalid_type_error: "Location must be string" })
        .min(2, "Location must be at least 2 characters long")
        .max(200, "Location cannot exceed 200 characters")
        .optional(),
    costFrom: zod_1.default.number({ invalid_type_error: "Cost must be number" }).optional(),
    startDate: zod_1.default.string().optional().optional(),
    endDate: zod_1.default.string().optional().optional(),
    maxGuest: zod_1.default
        .number({ invalid_type_error: "Max guest must be number" })
        .optional(),
    minAge: zod_1.default.number({ invalid_type_error: "Min age must be number" }).optional(),
    division: zod_1.default
        .string()
        .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId for division",
    })
        .optional(),
    tourType: zod_1.default
        .string()
        .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId for tourType",
    })
        .optional(),
    images: zod_1.default.array(zod_1.default.string()).optional(),
    included: zod_1.default.array(zod_1.default.string()).optional(),
    excluded: zod_1.default.array(zod_1.default.string()).optional(),
    amenities: zod_1.default.array(zod_1.default.string()).optional(),
    tourPlan: zod_1.default.array(zod_1.default.string()).optional(),
    departureLocation: zod_1.default.string().optional(),
    arrivalLocation: zod_1.default.string().optional(),
    deleteImages: zod_1.default.array(zod_1.default.string()).optional(),
});
