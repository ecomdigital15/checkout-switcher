import { GraphqlQueryError, BillingInterval, BillingReplacementBehavior } from "@shopify/shopify-api";
import shopify from "./shopify.js";

export const billingConfig = {
  "Launch Plan": {
    trialDays: 21,
    amount: 69,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately
  },
};