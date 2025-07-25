import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/init-payment/:bookingId", paymentController.initPayment);
router.post("/success", paymentController.successPayment);
router.post("/fail", paymentController.failPayment);
router.post("/cancel", paymentController.cancelPayment);

export const PaymentRoutes = router;
