import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { PrismaClient } from '@prisma/client';
import {MongoDBSessionStorage} from '@shopify/shopify-app-session-storage-mongodb';

const DB_PATH = `${process.cwd()}/database.sqlite`;

const MONGO_URL = `mongodb+srv://andre:SniNMwEPTHh0WzpC@cluster190623.hzwjgbg.mongodb.net/`;

import { billingConfig } from "./billing.js";

const prisma = new PrismaClient();
const storage = new PrismaSessionStorage(prisma);
// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
// const billingConfig = {
//   "My Shopify One-Time Charge": {
//     // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
//     amount: 5.0,
//     currencyCode: "USD",
//     interval: BillingInterval.OneTime,
//   },
// };

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: billingConfig, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new MongoDBSessionStorage(MONGO_URL,'shopify',),
});

export default shopify;
