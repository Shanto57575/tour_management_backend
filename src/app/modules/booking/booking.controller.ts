import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { BookingService } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const booking = await BookingService.createBookingService(
    req.body,
    decodedToken.userId,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const userData = req.user as JwtPayload;

  const bookings = await BookingService.getUserBookingsService(userData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: bookings,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId;
  const bookings = await BookingService.getBookingByIdService(bookingId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: bookings,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const bookings = await BookingService.getAllBookingsService(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: bookings,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const bookingId = req.params.bookingId as string;

  const bookings = await BookingService.updateBookingsStatusService(
    bookingId,
    status,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: bookings,
  });
});

const reInitPayment = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const { bookingId } = req.params;

  const result = await BookingService.reInitPaymentService(
    bookingId,
    decodedToken.userId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment re-initialized successfully",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getUserBookings,
  updateBookingStatus,
  reInitPayment,
};
