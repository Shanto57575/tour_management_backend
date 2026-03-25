import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import { stripe } from "../stripe/stripe.config";
import { envVars } from "../../config/env";
import Stripe from "stripe";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  try {
    const decodedToken = req.user as JwtPayload;
    const result = await PaymentService.createPaymentIntentService(
      req.body.bookingId,
      req.body.method,
      decodedToken.userId,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Payment intent created successfully",
      data: result,
    });
  } catch (error: unknown) {
    const mongoError = error as { code?: number };
    if (mongoError?.code === 11000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "A payment already exists for this booking",
      );
    }

    throw error;
  }
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const caller = req.user as JwtPayload;
  const result = await PaymentService.confirmPaymentService(
    req.body.transactionId,
    req.body.gatewayData,
    { userId: caller.userId, role: caller.role },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      envVars.STRIPE.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    res
      .status(400)
      .json({ message: `Webhook signature verification failed: ${message}` });
    return;
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await PaymentService.handlePaymentSuccess(paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await PaymentService.handlePaymentFailed(paymentIntent);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await PaymentService.handleRefundCompleted(charge);
        break;
      }
      case "refund.updated": {
        const refund = event.data.object as Stripe.Refund;
        await PaymentService.handleRefundUpdated(refund);
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const caller = req.user as JwtPayload;
    const result = await PaymentService.getInvoiceDownloadUrlService(
      paymentId,
      { userId: caller.userId, role: caller.role },
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Invoice download URL retrieved Successfully",
      data: result,
    });
  },
);

export const paymentController = {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getInvoiceDownloadUrl,
};
