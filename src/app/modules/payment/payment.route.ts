import { Router } from "express";
import { paymentController } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  confirmPaymentZodSchema,
  createPaymentIntentZodSchema,
} from "./payment.validation";

const router = Router();

router.post(
  "/intent",
  checkAuth(...Object.values(Role)),
  validateRequest(createPaymentIntentZodSchema),
  paymentController.createPaymentIntent,
);

router.post(
  "/confirm",
  checkAuth(...Object.values(Role)),
  validateRequest(confirmPaymentZodSchema),
  paymentController.confirmPayment,
);

router.get(
  "/invoice/:paymentId",
  checkAuth(...Object.values(Role)),
  paymentController.getInvoiceDownloadUrl,
);

export const PaymentRoutes = router;
