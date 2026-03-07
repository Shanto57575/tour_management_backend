/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { Tour } from "../tour/tour.model";
import { Payment } from "../payment/payment.model";
import { StripeService } from "../stripe/stripe.service";
import { QueryBuilder } from "../../utils/queryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { getTransactionId } from "../../utils/transactionId";
import { PAYMENT_STATUS } from "../payment/payment.interface";

const createBookingService = async (
  payload: Partial<IBooking>,
  userId: string,
) => {
  const transactionId = getTransactionId();
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user?.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please update your profile to book a tour",
      );
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
      throw new AppError(httpStatus.BAD_REQUEST, "No Tour cost Found!");
    }

    const amount = Number(tour.costFrom) * Number(payload.guestCount);

    const booking = await Booking.create(
      [
        {
          user: userId,
          ...payload,
        },
      ],
      { session },
    );

    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          transactionId,
          amount,
        },
      ],
      { session },
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      {
        payment: payment[0]._id,
      },
      { new: true, runValidators: true, session },
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    // Create Stripe PaymentIntent — card data never touches our server
    const stripeResult = await StripeService.createPaymentIntent({
      amount,
      bookingId: String(booking[0]._id),
      userId,
      transactionId,
    });

    // Store paymentIntentId for webhook correlation
    await Payment.findByIdAndUpdate(
      payment[0]._id,
      { paymentGatewayData: { paymentIntentId: stripeResult.paymentIntentId } },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    session.endSession();

    return {
      clientSecret: stripeResult.clientSecret,
      booking: updatedBooking,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getUserBookingsService = async (userData: JwtPayload) => {
  const isUserExists = await User.findById(userData.userId);
  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Found");
  }
  const userBookings = await Booking.find({ user: userData.userId })
    .populate(
      "tour",
      "title slug costFrom location maxGuest startDate endDate images",
    )
    .populate("payment", "amount status transactionId invoiceUrl");
  if (!userBookings) {
    throw new AppError(httpStatus.BAD_REQUEST, "No Booking Found!");
  }
  return userBookings;
};

const getBookingByIdService = async (bookingId: string) => {
  return await Booking.findById(bookingId);
};

const updateBookingsStatusService = async (
  bookingId: string,
  status: string,
) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: status,
      },
      { new: true, runValidators: true, session },
    );

    if (updatedBooking) {
      let paymentStatus = undefined;
      if (status === "COMPLETE") paymentStatus = PAYMENT_STATUS.PAID;
      else if (status === "CANCEL") paymentStatus = PAYMENT_STATUS.CANCELLED;
      else if (status === "FAILED") paymentStatus = PAYMENT_STATUS.FAILED;

      if (paymentStatus) {
        await Payment.findOneAndUpdate(
          { booking: bookingId },
          { status: paymentStatus },
          { runValidators: true, session },
        );
      }
    }

    await session.commitTransaction();
    session.endSession();
    return updatedBooking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllBookingsService = async (query: Record<string, string>) => {
  let initialCondition = {};

  if (query.searchTerm) {
    const users = await User.find({
      $or: [
        { name: { $regex: query.searchTerm, $options: "i" } },
        { email: { $regex: query.searchTerm, $options: "i" } },
      ],
    }).select("_id");

    const userIds = users.map((u) => u._id);

    const payments = await Payment.find({
      transactionId: { $regex: query.searchTerm, $options: "i" },
    }).select("_id");

    const paymentIds = payments.map((p) => p._id);

    const orConditions: any[] = [];

    if (userIds.length) {
      orConditions.push({ user: { $in: userIds } });
    }

    if (paymentIds.length) {
      orConditions.push({ payment: { $in: paymentIds } });
    }

    initialCondition =
      orConditions.length > 0 ? { $or: orConditions } : { _id: null };

    delete query.searchTerm;
  }

  const queryBuilder = new QueryBuilder(Booking.find(initialCondition), query);

  let dataQuery = queryBuilder.filter().search([]).fields();

  if (query.sort !== "price" && query.sort !== "-price") {
    dataQuery = dataQuery.sort().paginate();
  }

  let data = await dataQuery.modelQuery
    .populate("user", "name email phone address")
    .populate("tour", "title costFrom createdAt")
    .populate("payment", "amount status transactionId");

  const meta = await queryBuilder.getMeta();

  if (query.sort === "price" || query.sort === "-price") {
    data.sort((a: any, b: any) => {
      const amountA = a.payment?.amount || 0;
      const amountB = b.payment?.amount || 0;
      return query.sort === "price" ? amountA - amountB : amountB - amountA;
    });

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    data = data.slice((page - 1) * limit, page * limit);
  }

  return {
    meta,
    bookings: data,
  };
};

/**
 * Re-initiates a Stripe PaymentIntent for an existing PENDING/UNPAID booking.
 * Used by the "Pay Now" button in My Bookings when the user didn't complete checkout.
 */
const reInitPaymentService = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId)
    .populate("tour", "title costFrom images location startDate endDate")
    .populate("payment", "amount transactionId status");

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (String(booking.user) !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const payment = booking.payment as any;

  if (!payment || payment.status === PAYMENT_STATUS.PAID) {
    throw new AppError(httpStatus.BAD_REQUEST, "This booking is already paid");
  }

  // Create a fresh PaymentIntent for the same amount
  const stripeResult = await StripeService.createPaymentIntent({
    amount: payment.amount,
    bookingId,
    userId,
    transactionId: payment.transactionId,
  });

  // Update stored paymentIntentId
  await Payment.findByIdAndUpdate(payment._id, {
    paymentGatewayData: { paymentIntentId: stripeResult.paymentIntentId },
  });

  return {
    clientSecret: stripeResult.clientSecret,
    booking,
  };
};

export const BookingService = {
  createBookingService,
  updateBookingsStatusService,
  getBookingByIdService,
  getUserBookingsService,
  getAllBookingsService,
  reInitPaymentService,
};
