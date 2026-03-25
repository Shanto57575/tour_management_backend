import { Types } from "mongoose";

export enum PAYMENT_METHOD {
  CARD = "CARD",
  BKASH = "BKASH",
  NAGAD = "NAGAD",
}

export enum PAYMENT_STATUS {
  PAID = "PAID",
  UNPAID = "UNPAID",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum REFUND_STATUS {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface IRefund {
  amount?: number;
  reason?: string;
  refundedAt?: Date;
  status?: REFUND_STATUS;
}

export interface IPaymentGatewayData {
  paymentIntentId?: string;
  provider?: PAYMENT_METHOD;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

export interface IPayment {
  booking: Types.ObjectId;
  transactionId: string;
  amount: number;
  currency?: string;
  method: PAYMENT_METHOD;
  paidAt?: Date;
  paymentGatewayData?: IPaymentGatewayData;
  invoiceUrl?: string;
  refund?: IRefund;
  status: PAYMENT_STATUS;
}
