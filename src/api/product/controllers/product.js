"use strict";

/**
 * product controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  async newProducts(ctx) {
    const { title } = ctx.params;
    const response = await strapi
      .service("api::product.product")
      .findProducts(title);
    return this.transformResponse(response);
  },
  async findBySku(ctx) {
    const { title } = ctx.params;
    const response = await strapi
      .service("api::product.product")
      .findBySKU(title);
    return this.transformResponse(response);
  },
}));
