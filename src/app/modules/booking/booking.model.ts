// booking.schema.ts
import { model, Schema } from "mongoose";
import { BOOKING_STATUS, IBooking } from "./booking.interface";

const bookingSchema = new Schema<IBooking>(
  {
    // ─── Core References ──────────────────────────────────────
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true },

    // ─── Booking Details ──────────────────────────────────────
    guestCount:  { type: Number, required: true, min: 1 },
    bookingDate: { type: Date, required: true },

    // ─── Price Snapshot (locked at booking time) ──────────────
    pricePerPerson: { type: Number, required: true },
    discount:       { type: Number, default: 0 },
    totalPrice:     { type: Number, required: true },

    // ─── Contact Info ─────────────────────────────────────────
    contactInfo: {
      name:  { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },

    // ─── Special Requests ─────────────────────────────────────
    specialRequests: { type: String },

    // ─── Status ───────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },

    // ─── Cancellation ─────────────────────────────────────────
    cancelledAt:        { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true, versionKey: false },
);

bookingSchema.index({ user: 1 });
bookingSchema.index({ tour: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ tour: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
bookingSchema.index({ tour: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

export const Booking = model<IBooking>("Booking", bookingSchema);