import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createOrder(orderData, type) {
  try {
    // const createdOrder = await prisma.order.create({
    //   data: {
    //     shopId: orderData.shopId,
    //     totalValue: orderData.totalValue,
    //     itemValue: orderData.itemValue,
    //     itemQuantity: orderData.itemQuantity,
    //   },
    // });
    const createdOrder = await prisma.order.create({
      data: {
        shopId: orderData.shopId,
        totalValue: orderData.totalValue,
        itemValue: orderData.itemValue,
        itemQuantity: orderData.itemQuantity,
        type: type ? type : "SUBSCRIPTION", // Set the default OrderType value
      },
    });

    console.log("Order created:", createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

export default createOrder;
