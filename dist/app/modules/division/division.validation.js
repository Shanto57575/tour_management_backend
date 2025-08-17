"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDivisionZodSchema = exports.createDivisionZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDivisionZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name cannot exceed 50 characters" }),
    slug: zod_1.default
        .string({ invalid_type_error: "slug must be string" })
        .min(3, { message: "slug must be at least 3 characters long" })
        .max(30, { message: "slug cannot exceed 30 characters" })
        .optional(),
    thumbnail: zod_1.default
        .string({ invalid_type_error: "thumbnail url must be string" })
        .optional(),
    description: zod_1.default
        .string({ invalid_type_error: "description must be string" })
        .min(2, { message: "description must be at least 2 characters long" })
        .max(200, { message: "description cannot exceed 200 characters" })
        .optional(),
});
exports.updateDivisionZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(50, { message: "Name cannot exceed 50 characters" })
        .optional(),
    slug: zod_1.default
        .string({ invalid_type_error: "slug must be string" })
        .min(3, { message: "slug must be at least 3 characters long" })
        .max(30, { message: "slug cannot exceed 30 characters" })
        .optional(),
    thumbnail: zod_1.default
        .string({ invalid_type_error: "thumbnail url must be string" })
        .optional(),
    description: zod_1.default
        .string({ invalid_type_error: "description must be string" })
        .min(2, { message: "description must be at least 2 characters long" })
        .max(200, { message: "description cannot exceed 200 characters" })
        .optional(),
});
