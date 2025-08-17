import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";
import { TourRoutes } from "../modules/tour/tour.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { OtpRoutes } from "../modules/otp/otp.routes";
import { StatsRoutes } from "../modules/stats/stats.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    element: UserRoutes,
  },
  {
    path: "/auth",
    element: AuthRoutes,
  },
  {
    path: "/division",
    element: DivisionRoutes,
  },
  {
    path: "/tour",
    element: TourRoutes,
  },
  {
    path: "/booking",
    element: BookingRoutes,
  },
  {
    path: "/payment",
    element: PaymentRoutes,
  },
  {
    path: "/otp",
    element: OtpRoutes,
  },
  {
    path: "/stats",
    element: StatsRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.element);
});
