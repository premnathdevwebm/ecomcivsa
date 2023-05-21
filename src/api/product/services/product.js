"use strict";

/**
 * product service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::product.product", ({ strapi }) => ({
  async findProducts(title) {
    try {
      const response = await strapi.entityService.findMany(
        "api::product.product",
        { filters: { showcase: title } }
      );
      return response;
    } catch (err) {
      strapi.log.error(err);
      return;
    }
  },
  async findBySKU(title) {
    try {
      const response = await strapi.entityService.findMany(
        "api::product.product",
        { filters: { SKU: title } }
      );
      return response;
    } catch (err) {
      strapi.log.error(err);
      return;
    }
  },
}));
