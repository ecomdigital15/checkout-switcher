import { DeliveryMethod } from "@shopify/shopify-api";
import shopify from "./shopify.js";

import createOrder from "./save-order.js";

export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);

      const sessionId = await shopify.api.session.getOfflineId(shop);
      const session = await shopify.config.sessionStorage.loadSession(
        sessionId
      );

      console.log(payload);
      console.log(payload.cart_token);
      console.log(payload.id);
      console.log(payload.total_price);
      console.log(payload.total_price_usd);
      // console.log(
      //   payload.billing_address.first_name +
      //     " " +
      //     payload.billing_address.last_name
      // );
      console.log(payload.line_items.length);
      console.log(payload.line_items[0].properties);
      // Check if note_attributes contain checkoutSwitcher: 'upgrade'
      const noteAttribute = payload.note_attributes.find(
        (attribute) =>
          attribute.name === "checkoutSwitcher" && attribute.value === "upgrade"
      );

      const upsellnoteAttribute = payload.note_attributes.find(
        (attribute) =>
          attribute.name === "checkoutSwitcherUpsell" && attribute.value === "upgrade"
      );

      console.log(noteAttribute);

      console.log(upsellnoteAttribute)

      if (noteAttribute || upsellnoteAttribute) {
        // Find line items with _Checkout_Switcher_Upgrade value equal to 'Subscription'
        // const subscriptionItems = payload.line_items.filter(
        //   (item) =>
        //     item.properties?._Checkout_Switcher_Upgrade === "Subscription"
        // );
        const subscriptionItems = payload.line_items.filter((item) => {
          if (item.properties) {
            const checkoutSwitcherAttribute = item.properties.find(
              (attribute) =>
                attribute.name === "_Checkout_Switcher_Upgrade" &&
                attribute.value === "Subscription"
            );
            return checkoutSwitcherAttribute !== undefined;
          }
          return false;
        });

        const upsellsubscriptionItems = payload.line_items.filter((item) => {
          if (item.properties) {
            const checkoutSwitcherAttribute = item.properties.find(
              (attribute) =>
                attribute.name === "_Checkout_Switcher_Upsell" &&
                attribute.value === "Upsell"
            );
            return checkoutSwitcherAttribute !== undefined;
          }
          return false;
        });

        console.log(subscriptionItems);

        console.log(upsellsubscriptionItems);

        // Save each relevant item to the database
        for (const subscriptionItem of subscriptionItems) {
          const orderData = {
            shopId: session.shop, // Replace with the actual shop ID
            totalValue: parseFloat(payload.total_price),
            itemValue: parseFloat(subscriptionItem.price),
            itemQuantity: subscriptionItem.quantity,
          };

          // Save orderData to the database using your model create function
          await createOrder(orderData, "SUBSCRIPTION");
        }

        for (const subscriptionItem of upsellsubscriptionItems) {
          const orderData = {
            shopId: session.shop, // Replace with the actual shop ID
            totalValue: parseFloat(payload.total_price),
            itemValue: parseFloat(subscriptionItem.price),
            itemQuantity: subscriptionItem.quantity,
          };

          // Save orderData to the database using your model create function
          await createOrder(orderData, "UPSELL");
        }

        //update order tag using shopify api
        const order = new shopify.api.rest.Order({ session: session });
        order.id = payload.id;
        order.tags = "CheckoutSwitcher Upsell";
        await order.save({
          update: true,
        });
      }

      // await saveOrder(payload, session);
    },
  },
};
