"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async createPayment(ctx) {
    try {
      const response = await strapi
        .service("api::order.order")
        .createPayment({ data: ctx.request.body, userId: ctx.state.user.id });
      strapi.log.debug(response);
      return response;
    } catch (err) {
      strapi.log.error(err);
      ctx.response.status = 500;
      return;
    }
  },
  async orderPlace(ctx) {
    try {
      const response = await strapi
        .service("api::order.order")
        .orderPlace({ data: ctx.request.body, userId: ctx.state.user.id });
      return response;
    } catch (err) {
      strapi.log.error(err);
      ctx.response.status = 500;
      return;
    }
  },
  async myOdrers(ctx) {
    try {
      const response = await strapi
        .service("api::order.order")
        .myOdrers(ctx.state.user);
      return response;
    } catch (err) {
      strapi.log.error(err);
      ctx.response.status = 500;
      return;
    }
  },
  async transactionsList(ctx) {
    try {
      const { transaction } = ctx.params;
      const response = await strapi
        .service("api::order.order")
        .transactionsList(transaction);
      return response;
    } catch (err) {
      strapi.log.error(err);
      ctx.response.status = 500;
      return;
    }
  },
}));
