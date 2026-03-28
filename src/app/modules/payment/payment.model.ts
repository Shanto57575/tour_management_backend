import { model, Schema } from "mongoose";
import { IPayment, PAYMENT_STATUS } from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    // ─── Core ─────────────────────────────────────────────────
    booking:       { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    transactionId: { type: String, required: true, unique: true },
    amount:        { type: Number, required: true },
    currency:      { type: String, default: "BDT" },

    // ─── Method & Status ──────────────────────────────────────
    method: {
      type: String,
      enum: ["CARD", "BKASH", "NAGAD"],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    paidAt: { type: Date },

    // ─── Gateway ──────────────────────────────────────────────
    paymentGatewayData: { type: Schema.Types.Mixed },
    invoiceUrl:         { type: String },

    // ─── Refund ───────────────────────────────────────────────
    refund: {
      amount:     { type: Number },
      reason:     { type: String },
      refundedAt: { type: Date },
      status:     { type: String, enum: ["PENDING", "COMPLETED", "FAILED"] },
    },
  },
  { timestamps: true, versionKey: false },
);

paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);