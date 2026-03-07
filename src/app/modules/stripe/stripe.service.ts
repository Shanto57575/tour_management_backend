import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { stripe } from "./stripe.config";
import { ICreatePaymentIntent, IStripePaymentIntent } from "./stripe.interface";

const createPaymentIntent = async (
  payload: ICreatePaymentIntent,
): Promise<IStripePaymentIntent> => {
  try {
    // Stripe requires amount in the smallest currency unit
    // For BDT (Bangladeshi Taka) — Stripe does NOT support BDT natively.
    // We use USD or convert to USD. Adjust currency as needed.
    // If you want to process in USD, convert amount from BDT as needed.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payload.amount * 100), // Convert to smallest unit (e.g., cents for USD)
      currency: payload.currency ?? "usd",
      metadata: {
        bookingId: payload.bookingId,
        userId: payload.userId,
        transactionId: payload.transactionId,
      },
      // Idempotency: using transactionId as idempotency key is handled at call site
    });

    if (!paymentIntent.client_secret) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to create payment intent",
      );
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    const message =
      error instanceof Error ? error.message : "Stripe PaymentIntent error";
    throw new AppError(httpStatus.BAD_REQUEST, message);
  }
};

export const StripeService = {
  createPaymentIntent,
};
