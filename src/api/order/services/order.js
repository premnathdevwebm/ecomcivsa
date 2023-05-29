"use strict";
const { createCoreService } = require("@strapi/strapi").factories;
const EventEmitter = require("events");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  calling,
  transcationList,
  shipOrderInvoice,
} = require("../../../plugins/shiprocket");
const sendEmail = require("../../../plugins/sendgrid");
const { message } = require("../../../plugins/twilio");

/**
 * order service
 *
 */

const myEmitter = new EventEmitter();

myEmitter.on("sms", async (arg1, arg2) => {
  try {
    await message(`An order was placed with shipment Id: ${arg1} order Id: ${arg2} check on mail info@civsa.in or support@civsa.in for futher details.`, "+919500923437");
  } catch (error) {
    console.error(error);
  }
});

myEmitter.on("mail", async (arg1) => {
  try {
    const attachmentsExist = arg1.attachements.some((attachment) => attachment !== null && attachment !== undefined);
    const response = sendEmail(
      arg1.order.username, arg1.order.orderId, arg1.order.shipmentId, true, attachmentsExist, arg1.attachements
    ); 
    console.log("----", response);
    return response
  } catch (error) {
    console.log(error.response);
    return error.response;
  }
});

myEmitter.on("updateOrder", (arg, arg1) => {
  arg.map(async (ele) => {
    try {
      await strapi.entityService.update("api::order.order", ele.id, {
        data: {
          shipmentId: `${arg1.payload.shipment_id}`,
          download1: arg1.payload.label_url,
          download2: arg1.payload.manifest_url,
          couriername: arg1.payload.courier_name,
          AWB: arg1.payload.awb_code,
          orderId: `${arg1.payload.order_id}`,
        },
      });

      myEmitter.emit("attachInvoice", {
        internalOrderId: arg[0].id,
        shipRocketOrderId: arg1.payload.order_id,
      });

      myEmitter.emit(
        "sms",
        `${arg1.payload.shipment_id}`,
        `${arg1.payload.order_id}`
      );
      myEmitter.emit("mail", {
        order: {
          username: arg[0].users_permissions_user.username,
          shipmentId: `${arg1.payload.shipment_id}`,
          orderId: `${arg1.payload.order_id}`,
        },
        attachements: [arg1?.payload?.label_url, arg1?.payload?.manifest_url],
      });
    } catch (err) {
      console.log(JSON.stringify(err));
      return err;
    }
  });
});

myEmitter.on("attachInvoice", async (arg1) => {
  try {
    await generateInvoice(arg1);
  } catch (error) {
    console.log(JSON.stringify(err));
    return err;
  }
});

async function payment(body) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: body.payment_method_id,
      amount: body.amount,
      currency: body.currency,
      description: body.description,
      confirm: true,
    });
    return paymentIntent.client_secret;
  } catch (err) {
    return err;
  }
}
async function generateInvoice(data) {
  try {
    const response = await shipOrderInvoice(data.shipRocketOrderId);
    await strapi.entityService.update(
      "api::order.order",
      data.internalOrderId,
      { data: { invoiceURL: response.invoice_url } }
    );
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}
async function processOrder(orders) {
  try {
    const responseIntermediate = orders.map(async (ele) => {
      try {
        const response = await strapi.entityService.findOne(
          "api::order.order",
          ele,
          { populate: ["users_permissions_user"] }
        );
        const { users_permissions_user, ...orderDetail } = response;
        return { users_permissions_user, ...orderDetail };
      } catch (err) {
        console.error(err);
        throw new Error(err);
      }
    });

    Promise.all(responseIntermediate)
      .then((data) => {
        const order_items = data.map((ele) => ({
          name: ele.orderName,
          sku: ele.orderSKU,
          units: ele.orderUnits,
          selling_price: ele.orderSelling,
          discount: "",
          tax: 18,
        }));
        const name = data[0].users_permissions_user.username;
        const address1 = data[0].users_permissions_user.address1;
        const address2 = data[0].users_permissions_user.address2;
        const city = data[0].users_permissions_user.city;
        const zip = data[0].users_permissions_user.zipcode;
        const state = data[0].users_permissions_user.state;
        const country = data[0].users_permissions_user.country;
        const email = data[0].users_permissions_user.email;
        const phone = data[0].users_permissions_user.phone;
        const payment_method = data[0].modeOfPay;
        const sub_total = data.reduce(
          (acc, curr) => acc + curr.orderSelling,
          0
        );
        const length =
          data.reduce((acc, curr) => acc + curr.orderLength, 0) / 10;
        const breadth =
          data.reduce((acc, curr) => acc + curr.orderBreadth, 0) / 10;
        const height =
          data.reduce((acc, curr) => acc + curr.orderHeight, 0) / 10;
        const weight =
          data.reduce((acc, curr) => acc + curr.orderWeight, 0) / 1000;
        calling({
          name,
          address1,
          address2,
          city,
          zip,
          state,
          country,
          email,
          phone,
          payment_method,
          sub_total,
          length,
          breadth,
          height,
          weight,
          order_items,
        })
          .then((data1) => {
            if (data1.payload.order_created) {
              myEmitter.emit("updateOrder", data, data1);
            }
          })
          .catch((err1) => {
            console.log(err1.data.errors);
            throw new Error(err1);
          });
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (errrr) {
    console.error(errrr);
    throw new Error(errrr);
  }
}

module.exports = createCoreService("api::order.order", ({ strapi }) => ({
  async createPayment({ data, userId }) {
    try {
      const responsePayment = await payment(data);
      return responsePayment;
    } catch (err) {
      return err;
    }
  },
  async orderPlace({ data, userId }) {
    try {
      const ordersPlaced = [];
      const modeOfPay = data.paymentConfirmation === "COD" ? "COD" : "Prepaid";
      const payStatus = modeOfPay === "Prepaid" ? "Confirmed" : "Pending";
      for (const order of data.cartItems) {
        const { productId, ...orderData } = order;
        const productAvail = await strapi.entityService.findOne(
          "api::product.product",
          productId,
          {
            populate: ["singleContainer", "doubleContainer", "tripleContainer"],
          }
        );
        if (!productAvail) {
          console.error(`Product with ID ${productId} not found.`);
          continue;
        }
        const orderName = orderData.orderName;
        const product = productId;
        const users_permissions_user = userId;
        const orderSKU = orderData.orderSku;
        const orderUnits = orderData.units;
        const orderSelling = orderData.orderSelling;
        const orderType = orderData.orderType;
        const orderWeight = productAvail[orderData.orderType].weight;
        const orderHeight = productAvail[orderData.orderType].height;
        const orderBreadth = productAvail[orderData.orderType].breadth;
        const orderLength = productAvail[orderData.orderType].length;
        const createdOrder = await strapi.entityService.create(
          "api::order.order",
          {
            data: {
              orderName,
              product,
              users_permissions_user,
              orderSKU,
              orderUnits,
              orderSelling,
              orderType,
              orderWeight,
              orderHeight,
              orderBreadth,
              orderLength,
              modeOfPay,
              payStatus,
            },
          }
        );

        ordersPlaced.push(createdOrder.id);
      }
      await processOrder(ordersPlaced);
      return ordersPlaced;
    } catch (err) {
      return err;
    }
  },
  async myOdrers(user) {
    try {
      const response = await strapi.entityService.findMany("api::order.order", {
        filters: { users_permissions_user: user.id },
        sort: { createdAt: "DESC" },
        limit: 10,
      });
      return response;
    } catch (err) {
      return err;
    }
  },
  async transactionsList(data) {
    try {
      const response = await transcationList(data);
      return response;
    } catch (err) {
      return err;
    }
  },
}));
