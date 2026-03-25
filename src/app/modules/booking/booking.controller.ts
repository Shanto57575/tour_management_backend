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

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const booking = await BookingService.cancelBookingService(
    req.params.id,
    decodedToken.userId,
    req.body.cancellationReason,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking cancelled successfully",
    data: booking,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const booking = await BookingService.updateBookingStatusService(
    req.params.id,
    req.body.status,
    decodedToken.userId,
    req.body.reason,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking status updated successfully",
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
  const bookingId = req.params.bookingId ?? req.params.id;
  const requestor = req.user as JwtPayload;
  const bookings = await BookingService.getBookingByIdService(bookingId, requestor);
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

export const BookingController = {
  createBooking,
  cancelBooking,
  updateBookingStatus,
  getAllBookings,
  getSingleBooking,
  getUserBookings,
};
