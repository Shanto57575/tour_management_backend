/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { Tour } from "../tour/tour.model";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { QueryBuilder } from "../../utils/queryBuilder";
import { bookingSearchableFields } from "./booking.constant";
import { JwtPayload } from "jsonwebtoken";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const createBookingService = async (
  payload: Partial<IBooking>,
  userId: string
) => {
  const transactionId = getTransactionId();
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user?.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please update your profile to book a tour"
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
      { session }
    );

    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          transactionId,
          amount,
        },
      ],
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      {
        payment: payment[0]._id,
      },
      { new: true, runValidators: true, session }
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    const userAddress = (updatedBooking?.user as any).address;
    const userEmail = (updatedBooking?.user as any).email;
    const userPhoneNumber = (updatedBooking?.user as any).phone;
    const userName = (updatedBooking?.user as any).name;

    const sslPayload: ISSLCommerz = {
      address: userAddress,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      name: userName,
      amount,
      transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction();
    session.endSession();

    return {
      paymentUrl: sslPayment.GatewayPageURL,
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
  const userBookings = await Booking.find({ user: userData.userId });
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
  status: string
) => {
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: status,
    },
    { new: true, runValidators: true }
  );
  return updatedBooking;
};

const getAllBookingsService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Booking.find(), query);

  const allBookings = queryBuilder
    .filter()
    .search(bookingSearchableFields)
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    allBookings.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    bookings: data,
  };
};

export const BookingService = {
  createBookingService,
  updateBookingsStatusService,
  getBookingByIdService,
  getUserBookingsService,
  getAllBookingsService,
};
