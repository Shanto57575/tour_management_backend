/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  REFUND_STATUS,
} from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from "http-status-codes";
import Stripe from "stripe";
import { StripeService } from "../stripe/stripe.service";
import { getTransactionId } from "../../utils/transactionId";
import { stripe } from "../stripe/stripe.config";
import { Role } from "../user/user.interface";

const createPaymentIntentService = async (
  bookingId: string,
  method: PAYMENT_METHOD,
  userId: string,
) => {
  const booking = await Booking.findById(bookingId).lean();

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (String(booking.user) !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment is only allowed for pending bookings",
    );
  }

  const existingPayment = await Payment.findOne({ booking: bookingId });

  if (existingPayment?.status === PAYMENT_STATUS.PAID) {
    throw new AppError(httpStatus.BAD_REQUEST, "This booking is already paid");
  }

  const paymentPayload: Record<string, unknown> = {
    booking: booking._id,
    amount: booking.totalPrice,
    currency: "BDT",
    method,
    status: PAYMENT_STATUS.UNPAID,
    paidAt: undefined,
    refund: undefined,
  };

  let clientSecret: string | null = null;
  let stripeIntent: { clientSecret: string; paymentIntentId: string } | null = null;

  if (method === PAYMENT_METHOD.CARD) {
    stripeIntent = await StripeService.createPaymentIntent({
      amount: booking.totalPrice,
      currency: "bdt",
      bookingId: String(booking._id),
      userId,
      transactionId: existingPayment?.transactionId ?? getTransactionId(),
    });

    clientSecret = stripeIntent.clientSecret;
    paymentPayload.paymentGatewayData = {
      paymentIntentId: stripeIntent.paymentIntentId,
      provider: PAYMENT_METHOD.CARD,
    };
  }

  const transactionId =
    method === PAYMENT_METHOD.CARD
      ? stripeIntent!.paymentIntentId
      : existingPayment?.transactionId ?? getTransactionId();

  paymentPayload.transactionId = transactionId;

  const payment = existingPayment
    ? await Payment.findByIdAndUpdate(existingPayment._id, paymentPayload, {
        new: true,
        runValidators: true,
      })
    : await Payment.create(paymentPayload);

  return {
    payment,
    clientSecret,
  };
};

/**
 * Internal-only overload used by Stripe webhook (no user context needed).
 * External HTTP callers must use the overload that accepts userId + role.
 */
const confirmPaymentService = async (
  transactionId: string,
  gatewayData?: Record<string, unknown>,
  caller?: { userId: string; role: string },
) => {
  const payment = await Payment.findOne({ transactionId }).populate<{
    booking: { _id: unknown; user: unknown };
  }>("booking", "user");

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  // Ownership check — skip for internal webhook calls (no caller supplied)
  if (caller) {
    const isPrivileged =
      caller.role === Role.ADMIN || caller.role === Role.SUPER_ADMIN;
    const bookingOwnerId = String(
      (payment.booking as { _id: unknown; user: unknown }).user,
    );
    if (!isPrivileged && bookingOwnerId !== caller.userId) {
      throw new AppError(httpStatus.FORBIDDEN, "Access denied");
    }
  }

  if (payment.status === PAYMENT_STATUS.PAID) {
    return payment;
  }

  const session = await Payment.startSession();
  let updatedPayment: Awaited<ReturnType<typeof Payment.findById>> | null = null;

  try {
    await session.withTransaction(async () => {
      updatedPayment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          $set: {
            status: PAYMENT_STATUS.PAID,
            paidAt: new Date(),
            paymentGatewayData: gatewayData,
          },
        },
        { new: true, runValidators: true, session },
      );

      await Booking.findByIdAndUpdate(
        payment.booking,
        { $set: { status: BOOKING_STATUS.CONFIRMED } },
        { runValidators: true, session },
      );
    });

    return updatedPayment;
  } finally {
    await session.endSession();
  }
};

const processRefundService = async (bookingId: string, reason?: string) => {
  const payment = await Payment.findOne({ booking: bookingId });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.status !== PAYMENT_STATUS.PAID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Refund is only allowed for paid payments",
    );
  }

  if (payment.refund?.status === REFUND_STATUS.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment is already refunded");
  }

  if (payment.refund?.status === REFUND_STATUS.PENDING) {
    return payment;
  }

  if (payment.method === PAYMENT_METHOD.CARD) {
    await stripe.refunds.create({ payment_intent: payment.transactionId });
  }

  return Payment.findByIdAndUpdate(
    payment._id,
    {
      $set: {
        refund: {
          amount: payment.amount,
          reason,
          refundedAt: new Date(),
          status: REFUND_STATUS.PENDING,
        },
      },
    },
    { new: true, runValidators: true },
  );
};

const handlePaymentSuccess = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> => {
  await confirmPaymentService(paymentIntent.id, {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    metadata: paymentIntent.metadata,
  });
};

const handlePaymentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> => {
  await Payment.findOneAndUpdate(
    { transactionId: paymentIntent.id },
    {
      $set: {
        status: PAYMENT_STATUS.FAILED,
        paymentGatewayData: {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata,
        },
      },
    },
    { runValidators: true },
  );
};

const handleRefundCompleted = async (charge: Stripe.Charge) => {
  if (typeof charge.payment_intent !== "string") {
    return;
  }

  await Payment.findOneAndUpdate(
    { transactionId: charge.payment_intent },
    {
      $set: {
        status: PAYMENT_STATUS.REFUNDED,
        "refund.amount": charge.amount_refunded / 100,
        "refund.refundedAt": new Date(),
        "refund.status": REFUND_STATUS.COMPLETED,
      },
    },
    { runValidators: true },
  );
};

const handleRefundUpdated = async (refund: Stripe.Refund) => {
  if (!refund.payment_intent || typeof refund.payment_intent !== "string") {
    return;
  }

  const refundStatus =
    refund.status === "failed"
      ? REFUND_STATUS.FAILED
      : refund.status === "succeeded"
        ? REFUND_STATUS.COMPLETED
        : REFUND_STATUS.PENDING;

  await Payment.findOneAndUpdate(
    { transactionId: refund.payment_intent },
    {
      $set: {
        status:
          refundStatus === REFUND_STATUS.COMPLETED
            ? PAYMENT_STATUS.REFUNDED
            : PAYMENT_STATUS.PAID,
        refund: {
          amount: refund.amount / 100,
          reason: refund.reason ?? undefined,
          refundedAt: new Date(),
          status: refundStatus,
        },
      },
    },
    { runValidators: true },
  );
};

const getInvoiceDownloadUrlService = async (
  paymentId: string,
  caller: { userId: string; role: string },
) => {
  const payment = await Payment.findById(paymentId)
    .select("invoiceUrl booking")
    .populate<{ booking: { user: unknown } }>("booking", "user");

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const isPrivileged =
    caller.role === Role.ADMIN || caller.role === Role.SUPER_ADMIN;
  const bookingOwnerId = String(
    (payment.booking as { user: unknown }).user,
  );
  if (!isPrivileged && bookingOwnerId !== caller.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  if (!payment.invoiceUrl) {
    throw new AppError(httpStatus.NOT_FOUND, "No Invoice Found");
  }

  return payment.invoiceUrl;
};

export const PaymentService = {
  createPaymentIntentService,
  confirmPaymentService,
  processRefundService,
  handlePaymentSuccess,
  handlePaymentFailed,
  handleRefundCompleted,
  handleRefundUpdated,
  getInvoiceDownloadUrlService,
};
