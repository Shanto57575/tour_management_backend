export interface ICreatePaymentIntent {
  amount: number; // in BDT (will be converted to paisa/smallest unit)
  currency?: string; // default: 'bdt'
  bookingId: string;
  userId: string;
  transactionId: string;
}

export interface IStripePaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}
