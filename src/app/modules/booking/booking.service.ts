import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { Tour } from "../tour/tour.model";
import { Payment } from "../payment/payment.model";
import { QueryBuilder } from "../../utils/queryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Role } from "../user/user.interface";

const validateBookingDate = (bookingDate: unknown): Date => {
  const date = new Date(bookingDate as string);
  if (isNaN(date.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid booking date");
  }
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (date <= startOfToday) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Booking date must be in the future",
    );
  }
  return date;
};

const createBookingService = async (
  payload: Partial<IBooking>,
  userId: string,
) => {
  const session = await Booking.startSession();
  let createdBooking: IBooking | null = null;

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const guestCount = Number(payload.guestCount);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      throw new AppError(httpStatus.BAD_REQUEST, "Guest count must be at least 1");
    }

    const bookingDate = validateBookingDate(payload.bookingDate);

    await session.withTransaction(async () => {
      const tour = await Tour.findById(payload.tour)
        .select(
          "status isAvailable maxGuest bookedCount pricePerPerson discount",
        )
        .session(session);

      if (!tour) {
        throw new AppError(httpStatus.NOT_FOUND, "Tour not found");
      }

      if (tour.status !== "active" || !tour.isAvailable) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Tour is not available for booking",
        );
      }

      if (typeof tour.maxGuest !== "number" || tour.maxGuest < 1) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Tour capacity is not configured",
        );
      }

      if (typeof tour.bookedCount !== "number") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Tour inventory is not configured",
        );
      }

      if (typeof tour.pricePerPerson !== "number") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Tour price is not configured",
        );
      }

      const remainingSeats = Math.max(tour.maxGuest - tour.bookedCount, 0);

      if (guestCount > remainingSeats) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Only ${remainingSeats} seats remaining`,
        );
      }

      const discount = Number(tour.discount ?? 0);
      const totalPrice = Number(
        (
          (tour.pricePerPerson - (tour.pricePerPerson * discount) / 100) *
          guestCount
        ).toFixed(2),
      );

      const updatedTour = await Tour.findOneAndUpdate(
        {
          _id: tour._id,
          status: "active",
          isAvailable: true,
          $expr: {
            $gte: [{ $subtract: ["$maxGuest", "$bookedCount"] }, guestCount],
          },
        },
        {
          $inc: { bookedCount: guestCount },
          ...(tour.bookedCount + guestCount >= tour.maxGuest
            ? { $set: { isAvailable: false } }
            : {}),
        },
        { new: true, session },
      );

      if (!updatedTour) {
        const latestTour = await Tour.findById(payload.tour)
          .select("status isAvailable maxGuest bookedCount")
          .lean();

        if (!latestTour || latestTour.status !== "active" || !latestTour.isAvailable) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Tour is not available for booking",
          );
        }

        const latestRemainingSeats = Math.max(
          Number(latestTour.maxGuest ?? 0) - Number(latestTour.bookedCount ?? 0),
          0,
        );

        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Only ${latestRemainingSeats} seats remaining`,
        );
      }

      const [booking] = await Booking.create(
        [
          {
            user: userId,
            tour: payload.tour,
            guestCount,
            bookingDate,
            pricePerPerson: tour.pricePerPerson,
            discount,
            totalPrice,
            contactInfo: payload.contactInfo,
            specialRequests: payload.specialRequests,
            status: BOOKING_STATUS.PENDING,
          },
        ],
        { session },
      );

      createdBooking = await Booking.findById(booking._id)
        .session(session)
        .populate("tour", "title slug pricePerPerson discount startDate endDate images")
        .populate("user", "name email");
    });

    return createdBooking;
  } finally {
    await session.endSession();
  }
};

const attachPaymentsToBookings = async <T extends { _id: unknown }>(bookings: T[]) => {
  if (!bookings.length) {
    return [] as (T & { payment: unknown | null })[];
  }

  const payments = await Payment.find({
    booking: { $in: bookings.map((booking) => booking._id) },
  })
    .select("booking amount status transactionId invoiceUrl method refund paidAt")
    .lean();

  const paymentMap = new Map(
    payments.map((payment) => [String(payment.booking), payment]),
  );

  return bookings.map((booking) => ({
    ...booking,
    payment: paymentMap.get(String(booking._id)) ?? null,
  }));
};

const getUserBookingsService = async (userData: JwtPayload) => {
  const isUserExists = await User.findById(userData.userId);
  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Found");
  }

  const userBookings = await Booking.find({ user: userData.userId })
    .populate(
      "tour",
      "title slug pricePerPerson discount maxGuest startDate endDate images",
    )
    .sort({ createdAt: -1 })
    .lean();

  return attachPaymentsToBookings(userBookings);
};

const getBookingByIdService = async (
  bookingId: string,
  requestor: JwtPayload,
) => {
  const booking = await Booking.findById(bookingId)
    .populate(
      "tour",
      "title slug pricePerPerson discount maxGuest startDate endDate images",
    )
    .populate("user", "name email phone")
    .lean();

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  const isPrivileged =
    requestor.role === Role.ADMIN || requestor.role === Role.SUPER_ADMIN;

  if (!isPrivileged && String(booking.user._id ?? booking.user) !== requestor.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Access denied");
  }

  const [bookingWithPayment] = await attachPaymentsToBookings([booking]);

  return bookingWithPayment;
};

const cancelBookingService = async (
  bookingId: string,
  userId: string,
  reason?: string,
) => {
  const session = await Booking.startSession();
  let shouldTriggerRefund = false;
  let cancelledBooking: Awaited<ReturnType<typeof Booking.findById>> | null = null;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findOne({ _id: bookingId, user: userId }).session(
        session,
      );

      if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
      }

      if (
        booking.status !== BOOKING_STATUS.PENDING &&
        booking.status !== BOOKING_STATUS.CONFIRMED
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Only pending or confirmed bookings can be cancelled",
        );
      }

      cancelledBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            status: BOOKING_STATUS.CANCELLED,
            cancelledAt: new Date(),
            cancellationReason: reason,
          },
        },
        { new: true, session },
      )
        .populate(
          "tour",
          "title slug pricePerPerson discount maxGuest startDate endDate images",
        )
        .populate("user", "name email");

      await Tour.findByIdAndUpdate(
        booking.tour,
        [
          { $inc: { bookedCount: -booking.guestCount } },
          {
            $set: {
              isAvailable: {
                $and: [
                  { $eq: ["$status", "active"] },
                  {
                    $lt: [
                      { $subtract: ["$bookedCount", booking.guestCount] },
                      "$maxGuest",
                    ],
                  },
                ],
              },
            },
          },
        ],
        { session },
      );

      const payment = await Payment.findOne({ booking: booking._id }).session(session);
      shouldTriggerRefund = payment?.status === PAYMENT_STATUS.PAID;
    });

    if (shouldTriggerRefund) {
      try {
        const { PaymentService } = await import("../payment/payment.service");
        await PaymentService.processRefundService(
          bookingId,
          reason ?? "Booking cancelled by user",
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(
          "Refund failed after cancellation — needs manual review:",
          bookingId,
          err,
        );
      }
    }

    return cancelledBooking;
  } finally {
    await session.endSession();
  }
};

const updateBookingStatusService = async (
  bookingId: string,
  status: BOOKING_STATUS,
  adminUserId: string,
  reason?: string,
) => {
  const session = await Booking.startSession();
  let shouldTriggerRefund = false;
  let updatedBooking: Awaited<ReturnType<typeof Booking.findById>> | null = null;

  const allowedTransitions: Record<BOOKING_STATUS, BOOKING_STATUS[]> = {
    [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
    [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.CANCELLED],
    [BOOKING_STATUS.CANCELLED]: [],
  };

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
      }

      if (booking.status === status) {
        updatedBooking = await Booking.findById(bookingId)
          .session(session)
          .populate(
            "tour",
            "title slug pricePerPerson discount maxGuest startDate endDate images",
          )
          .populate("user", "name email");
        return;
      }

      if (!allowedTransitions[booking.status].includes(status)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot change booking status from ${booking.status} to ${status}`,
        );
      }

      if (status === BOOKING_STATUS.CANCELLED) {
        updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          {
            $set: {
              status: BOOKING_STATUS.CANCELLED,
              cancelledAt: new Date(),
              cancellationReason:
                reason ?? `Cancelled by admin (${adminUserId})`,
            },
          },
          { new: true, session },
        )
          .populate(
            "tour",
            "title slug pricePerPerson discount maxGuest startDate endDate images",
          )
          .populate("user", "name email");

        await Tour.findByIdAndUpdate(
          booking.tour,
          [
            { $inc: { bookedCount: -booking.guestCount } },
            {
              $set: {
                isAvailable: {
                  $and: [
                    { $eq: ["$status", "active"] },
                    {
                      $lt: [
                        { $subtract: ["$bookedCount", booking.guestCount] },
                        "$maxGuest",
                      ],
                    },
                  ],
                },
              },
            },
          ],
          { session },
        );

        const payment = await Payment.findOne({ booking: booking._id }).session(
          session,
        );
        shouldTriggerRefund = payment?.status === PAYMENT_STATUS.PAID;
        return;
      }

      updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            status,
            cancelledAt: undefined,
            cancellationReason: undefined,
          },
        },
        { new: true, session },
      )
        .populate(
          "tour",
          "title slug pricePerPerson discount maxGuest startDate endDate images",
        )
        .populate("user", "name email");
    });

    if (shouldTriggerRefund) {
      try {
        const { PaymentService } = await import("../payment/payment.service");
        await PaymentService.processRefundService(
          bookingId,
          reason ?? `Cancelled by admin (${adminUserId})`,
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(
          "Refund failed after admin cancellation — needs manual review:",
          bookingId,
          err,
        );
      }
    }

    return updatedBooking;
  } finally {
    await session.endSession();
  }
};

const getAllBookingsService = async (query: Record<string, string>) => {
  let initialCondition: Record<string, unknown> = {};

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
    }).select("booking");

    const bookingIdsFromPayments = payments.map((payment) => payment.booking);

    const orConditions: Record<string, unknown>[] = [];

    if (userIds.length) {
      orConditions.push({ user: { $in: userIds } });
    }

    if (bookingIdsFromPayments.length) {
      orConditions.push({ _id: { $in: bookingIdsFromPayments } });
    }

    initialCondition =
      orConditions.length > 0 ? { $or: orConditions } : { _id: null };

    delete query.searchTerm;
  }

  const queryBuilder = new QueryBuilder(Booking.find(initialCondition), query);

  const dataQuery = queryBuilder.filter().search([]).fields().sort().paginate();

  const data = await dataQuery.modelQuery
    .populate("user", "name email phone address")
    .populate("tour", "title pricePerPerson discount createdAt")
    .lean();

  const meta = await queryBuilder.getMeta();

  return {
    meta,
    bookings: await attachPaymentsToBookings(data),
  };
};

export const BookingService = {
  createBookingService,
  cancelBookingService,
  updateBookingStatusService,
  getBookingByIdService,
  getUserBookingsService,
  getAllBookingsService,
};
