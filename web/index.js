// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import { MongoClient } from "mongodb";
import path from "path";
import multer from "multer";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import shopCreator from "./shop-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import { billingConfig } from "./billing.js";
import { PrismaClient } from "@prisma/client";
// @ts-ignore
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dpiuf0rhr', 
  api_key: '497548686426128', 
  api_secret: 'LbflZauzskF_5A3w-NpE_PY-z1s' 
});

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const prisma = new PrismaClient();

// Define the storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/icons"); // Store uploaded icons in the 'uploads/icons' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Create a multer middleware
const upload = multer({ storage: storage });

const uri =
  "mongodb+srv://andre:SniNMwEPTHh0WzpC@cluster190623.hzwjgbg.mongodb.net/shopify?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  // Add other SSL options if necessary (sslCA, sslKey, sslCert, etc.)
});

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/web/frontend/dist`
    : `${process.cwd()}/web/frontend/`;

const app = express();

app.use("/public", express.static(`${process.cwd()}/public`));

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  // Request payment if required
  async (req, res, next) => {
    const plans = Object.keys(billingConfig);
    const session = res.locals.shopify.session;
    const shopData = await shopify.api.rest.Shop.all({
      session: session,
    });
    console.log(shopData.data);
    // console.log(shopData.data[0].plan_name)
    // console.log(shopData.data[0].email)
    // console.log(shopData.data[0].plan_display_name)
    await shopCreator(
      session.shop,
      shopData.data[0].email,
      shopData.data[0].shop_owner
    );
    try {
      const hasPayment = await shopify.api.billing.check({
        session,
        plans: plans,
        isTest:
          shopData.data[0].plan_name === "affiliate" ||
          shopData.data[0].plan_name === "partner_test"
            ? true
            : false,
      });

      if (hasPayment) {
        next();
      } else {
        res.redirect(
          await shopify.api.billing.request({
            session,
            plan: plans[0],
            isTest:
              shopData.data[0].plan_name === "affiliate" ||
              shopData.data[0].plan_name === "partner_test" ||
              shopData.data[0].plan_name === "plus_partner_sandbox"
                ? true
                : false,
          })
        );
      }
    } catch (e) {
      console.log(e);
      next();
    }
  },
  shopify.redirectToShopifyOrAppRoot()
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

async function updateExistingOrders() {
  const existingOrders = await prisma.order.findMany();

  for (const order of existingOrders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { type: "SUBSCRIPTION" },
    });
  }
}

app.get("/api/update/order", async (req, res) => {

  updateExistingOrders()
    .catch((error) => {
      console.error(error);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
});

app.get("/api/test", async (req, res) => {
  res.status(200).send("done");
  try {
    await client.connect();

    const db = client.db();
    const shopsCollection = db.collection("Shop");

    // Update existing shop documents to add the 'icons' field
    await shopsCollection.updateMany({}, { $set: { icons: [] } });

    console.log("Database update completed.");
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await client.close();
  }
});

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.post("/api/upload-icon", upload.single("icon"), async (_req, res) => {
  const { title } = _req.body;
  console.log(res.locals.shopify.session);
  const shopId = res.locals.shopify.session.shop;
  let iconUrl = _req.file.path; // Get the uploaded icon file path

  try {
    const single_icon=await cloudinary.uploader.upload(iconUrl);
    iconUrl=single_icon.secure_url;
    const icon = await prisma.icon.create({
      data: {
        title,
        iconUrl,
        shop: {
          connect: { name: shopId }, // Connect the icon to the specified shop
        },
      },
    });

    const shopIcons = await prisma.shop.findUnique({
      where: { name: shopId },
      include: { icons: true },
    });

    const metafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });
    metafield.namespace = "checkout";
    metafield.key = "uspi";
    metafield.value = JSON.stringify(shopIcons.icons);
    metafield.type = "json";
    await metafield.save({
      update: true,
    });

    const appUrlmetafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });
    appUrlmetafield.namespace = "checkout";
    appUrlmetafield.key = "appUrl";
    appUrlmetafield.value = process.env.HOST;
    appUrlmetafield.type = "single_line_text_field";
    await appUrlmetafield.save({
      update: true,
    });

    res.status(201).send(icon);
  } catch (error) {
    console.error("Error creating icon:", error);
    res.status(500).send("Error creating icon");
  }
});

app.delete("/api/icons/:id", async (_req, res) => {
  const { id } = _req.params;
  const shopId = res.locals.shopify.session.shop;
  try {
    const deletedIcon = await prisma.icon.delete({
      where: { id },
    });

    const shopIcons = await prisma.shop.findUnique({
      where: { name: shopId },
      include: { icons: true },
    });

    const metafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });
    metafield.namespace = "checkout";
    metafield.key = "uspi";
    metafield.value = JSON.stringify(shopIcons.icons);
    metafield.type = "json";
    await metafield.save({
      update: true,
    });

    res.status(200).json(deletedIcon);
  } catch (error) {
    console.error("Error deleting icon:", error);
    res.status(500).json({ error: "Error deleting icon" });
  }
});

app.get("/api/icons", async (_req, res) => {
  const shopId = res.locals.shopify.session.shop;
  try {
    const shopIcons = await prisma.shop.findUnique({
      where: { name: shopId },
      include: { icons: true },
    });

    if (!shopIcons) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const metafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });
    metafield.namespace = "checkout";
    metafield.key = "uspi";
    metafield.value = JSON.stringify(shopIcons.icons);
    metafield.type = "json";
    await metafield.save({
      update: true,
    });

    const appUrlmetafield = new shopify.api.rest.Metafield({
      session: res.locals.shopify.session,
    });
    appUrlmetafield.namespace = "checkout";
    appUrlmetafield.key = "appUrl";
    appUrlmetafield.value = process.env.HOST;
    appUrlmetafield.type = "single_line_text_field";
    await appUrlmetafield.save({
      update: true,
    });

    res.status(200).json(shopIcons.icons);
  } catch (error) {
    console.error("Error retrieving icons:", error);
    res.status(500).json({ error: "Error retrieving icons" });
  }
});

// app.get("/api/analytics/count", async (req, res) => {
//   try {
//     const shopId = res.locals.shopify.session.shop;
//     const orders = await prisma.order.findMany({
//       where: {
//         shopId: shopId,
//       },
//     });

//     let totalRevenue = 0;
//     let totalProductsUpgraded = 0;

//     for (const order of orders) {
//       const { itemValue, itemQuantity } = order;
//       totalRevenue += itemValue * itemQuantity;
//       totalRevenue = parseFloat(totalRevenue.toFixed(2));
//       totalProductsUpgraded += itemQuantity;
//     }

//     const analyticsData = {
//       totalRevenue,
//       totalProductsUpgraded,
//     };

//     res.status(200).json(analyticsData);
//   } catch (error) {
//     console.error("Error retrieving analytics data:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while retrieving analytics data" });
//   }
// });

app.get("/api/analytics/count", async (req, res) => {
  try {
    console.log('GET')
    const shopId = res.locals.shopify.session.shop;
    const orders = await prisma.order.findMany({
      where: {
        shopId: shopId,
      },
    });

    let subscriptionRevenue = 0;
    let upsellRevenue = 0;
    let totalSubscriptionProducts = 0;
    let totalUpsellProducts = 0;

    for (const order of orders) {
      const { itemValue, itemQuantity, type } = order;
      const orderRevenue = itemValue * itemQuantity;

      if (type === "SUBSCRIPTION") {
        subscriptionRevenue += orderRevenue;
        totalSubscriptionProducts += itemQuantity;
      } else if (type === "UPSELL") {
        upsellRevenue += orderRevenue;
        totalUpsellProducts += itemQuantity;
      }
    }

    const analyticsData = {
      subscriptionRevenue: parseFloat(subscriptionRevenue.toFixed(2)),
      upsellRevenue: parseFloat(upsellRevenue.toFixed(2)),
      totalSubscriptionProducts,
      totalUpsellProducts,
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error retrieving analytics data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving analytics data" });
  }
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
