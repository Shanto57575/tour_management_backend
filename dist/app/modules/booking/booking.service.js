"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const booking_model_1 = require("./booking.model");
const tour_model_1 = require("../tour/tour.model");
const payment_model_1 = require("../payment/payment.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const queryBuilder_1 = require("../../utils/queryBuilder");
const booking_constant_1 = require("./booking.constant");
const transactionId_1 = require("../../utils/transactionId");
const createBookingService = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, transactionId_1.getTransactionId)();
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.phone) || !(user === null || user === void 0 ? void 0 : user.address)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Please update your profile to book a tour");
        }
        const tour = yield tour_model_1.Tour.findById(payload.tour).select("costFrom");
        if (!(tour === null || tour === void 0 ? void 0 : tour.costFrom)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No Tour cost Found!");
        }
        const amount = Number(tour.costFrom) * Number(payload.guestCount);
        const booking = yield booking_model_1.Booking.create([
            Object.assign({ user: userId }, payload),
        ], { session });
        const payment = yield payment_model_1.Payment.create([
            {
                booking: booking[0]._id,
                transactionId,
                amount,
            },
        ], { session });
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(booking[0]._id, {
            payment: payment[0]._id,
        }, { new: true, runValidators: true, session })
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");
        const userAddress = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address;
        const userEmail = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email;
        const userPhoneNumber = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone;
        const userName = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name;
        const sslPayload = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount,
            transactionId,
        };
        const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        yield session.commitTransaction();
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getUserBookingsService = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.User.findById(userData.userId);
    if (!isUserExists) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Not Found");
    }
    const userBookings = yield booking_model_1.Booking.find({ user: userData.userId });
    if (!userBookings) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No Booking Found!");
    }
    return userBookings;
});
const getBookingByIdService = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield booking_model_1.Booking.findById(bookingId);
});
const updateBookingsStatusService = (bookingId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(bookingId, {
        status: status,
    }, { new: true, runValidators: true });
    return updatedBooking;
});
const getAllBookingsService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(booking_model_1.Booking.find(), query);
    const allBookings = queryBuilder
        .filter()
        .search(booking_constant_1.bookingSearchableFields)
        .fields()
        .sort()
        .paginate();
    const [data, meta] = yield Promise.all([
        allBookings.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        meta,
        bookings: data,
    };
});
exports.BookingService = {
    createBookingService,
    updateBookingsStatusService,
    getBookingByIdService,
    getUserBookingsService,
    getAllBookingsService,
};
