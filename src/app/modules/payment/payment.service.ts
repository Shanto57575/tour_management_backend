/* eslint-disable @typescript-eslint/no-explicit-any */
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from "http-status-codes";
import Stripe from "stripe";

/**
 * Handles a successful Stripe payment.
 * Triggered by `payment_intent.succeeded` webhook event.
 * Idempotent — bails early if payment is already marked PAID.
 */
const handlePaymentSuccess = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> => {
  const { bookingId, transactionId } = paymentIntent.metadata;

  if (!bookingId || !transactionId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing metadata on PaymentIntent",
    );
  }

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    // Idempotency guard — skip if already processed
    const existingPayment = await Payment.findOne({
      transactionId,
    }).session(session);

    if (!existingPayment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found");
    }

    if (existingPayment.status === PAYMENT_STATUS.PAID) {
      await session.abortTransaction();
      session.endSession();
      return; // Already processed — idempotent exit
    }

    // Update payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      existingPayment._id,
      {
        status: PAYMENT_STATUS.PAID,
        paymentGatewayData: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        },
      },
      { new: true, runValidators: true, session },
    );

    if (!updatedPayment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment update failed");
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: BOOKING_STATUS.COMPLETE },
      { new: true, runValidators: true, session },
    )
      .populate("tour", "title")
      .populate("user", "name email");

    if (!updatedBooking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking Not Found");
    }

    // Generate Invoice PDF
    const invoiceData: IInvoiceData = {
      bookingDate: updatedBooking.createdAt as Date,
      guestCount: updatedBooking.guestCount,
      transactionId: updatedPayment.transactionId,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedBooking.tour as unknown as ITour).title,
      userName: (updatedBooking.user as unknown as IUser).name,
    };

    const pdfBuffer = await generatePdf(invoiceData);
    const cloudinaryResult = await uploadBufferToCloudinary(
      pdfBuffer,
      "invoice",
    );

    if (!cloudinaryResult) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error uploading pdf",
      );
    }

    await Payment.findByIdAndUpdate(
      updatedPayment._id,
      { invoiceUrl: cloudinaryResult.secure_url },
      { runValidators: true, session },
    );

    // Send confirmation email
    await sendEmail({
      to: (updatedBooking.user as unknown as IUser).email,
      subject: "Your Booking Invoice",
      templateName: "invoice",
      templateData: invoiceData,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Handles a failed Stripe payment.
 * Triggered by `payment_intent.payment_failed` webhook event.
 */
const handlePaymentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> => {
  const { bookingId, transactionId } = paymentIntent.metadata;

  if (!bookingId || !transactionId) return;

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    await Payment.findOneAndUpdate(
      { transactionId },
      {
        status: PAYMENT_STATUS.FAILED,
        paymentGatewayData: {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        },
      },
      { runValidators: true, session },
    );

    await Booking.findByIdAndUpdate(
      bookingId,
      { status: BOOKING_STATUS.FAILED },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getInvoiceDownloadUrlService = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("invoiceUrl");

  if (!payment) {
    throw new AppError(404, "payment not found");
  }

  if (!payment.invoiceUrl) {
    throw new AppError(404, "No Invoice Found");
  }

  return payment.invoiceUrl;
};

export const PaymentService = {
  handlePaymentSuccess,
  handlePaymentFailed,
  getInvoiceDownloadUrlService,
};
