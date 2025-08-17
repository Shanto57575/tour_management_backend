/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";
import { SSLService } from "../sslCommerz/sslCommerz.service";

const initPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bookingId = req.params.bookingId;

    const result = await PaymentService.initPaymentService(bookingId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment done Successfully",
      data: result,
    });
  }
);

const successPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await PaymentService.successPayment(
      query as Record<string, string>
    );
    if (result.success) {
      res.redirect(
        `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
      );
    }
  }
);

const failPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await PaymentService.failPayment(
      query as Record<string, string>
    );
    if (!result.success) {
      res.redirect(
        `${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
      );
    }
  }
);

const cancelPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await PaymentService.cancelPayment(
      query as Record<string, string>
    );
    if (!result.success) {
      res.redirect(
        `${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
      );
    }
  }
);

const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const result = await PaymentService.getInvoiceDownloadUrlService(paymentId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Invoice download URL retrieved Successfully",
      data: result,
    });
  }
);

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  console.log(`SSL COMMERZ IPN URL BODY==>${req.body}`);
  await SSLService.validatePayment(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "payment validated Successfully",
    data: null,
  });
});

export const paymentController = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
  validatePayment,
};
