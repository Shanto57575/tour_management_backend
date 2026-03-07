import { Router } from "express";
import { paymentController } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.get(
  "/invoice/:paymentId",
  checkAuth(...Object.values(Role)),
  paymentController.getInvoiceDownloadUrl,
);

export const PaymentRoutes = router;
