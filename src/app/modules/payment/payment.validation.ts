import mongoose from "mongoose";
import z from "zod";
import { PAYMENT_METHOD } from "./payment.interface";

const objectIdSchema = (fieldName: string) =>
  z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: `Invalid ObjectId for ${fieldName}`,
  });

export const createPaymentIntentZodSchema = z.object({
  bookingId: objectIdSchema("booking"),
  method: z.enum([
    PAYMENT_METHOD.CARD,
    PAYMENT_METHOD.BKASH,
    PAYMENT_METHOD.NAGAD,
  ]),
});

export const confirmPaymentZodSchema = z.object({
  transactionId: z
    .string({ invalid_type_error: "transactionId must be string" })
    .min(1, "transactionId is required"),
  gatewayData: z.unknown().optional(),
});

export const processRefundZodSchema = z.object({
  bookingId: objectIdSchema("booking"),
  reason: z
    .string({ invalid_type_error: "refund reason must be string" })
    .min(3, "refund reason must be at least 3 characters")
    .optional(),
});