import Stripe from "stripe";
import { envVars } from "../../config/env";

export const stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});
