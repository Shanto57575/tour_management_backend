"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const division_route_1 = require("../modules/division/division.route");
const tour_route_1 = require("../modules/tour/tour.route");
const booking_route_1 = require("../modules/booking/booking.route");
const payment_route_1 = require("../modules/payment/payment.route");
const otp_routes_1 = require("../modules/otp/otp.routes");
const stats_route_1 = require("../modules/stats/stats.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        element: user_route_1.UserRoutes,
    },
    {
        path: "/auth",
        element: auth_route_1.AuthRoutes,
    },
    {
        path: "/division",
        element: division_route_1.DivisionRoutes,
    },
    {
        path: "/tour",
        element: tour_route_1.TourRoutes,
    },
    {
        path: "/booking",
        element: booking_route_1.BookingRoutes,
    },
    {
        path: "/payment",
        element: payment_route_1.PaymentRoutes,
    },
    {
        path: "/otp",
        element: otp_routes_1.OtpRoutes,
    },
    {
        path: "/stats",
        element: stats_route_1.StatsRoutes,
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.element);
});
