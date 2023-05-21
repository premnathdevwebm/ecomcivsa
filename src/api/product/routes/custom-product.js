module.exports = {
  routes: [
    {
      method: "GET",
      path: "/products/:title",
      handler: "product.newProducts",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/products/sku/:title",
      handler: "product.findBySku",
      config: {
        auth: false,
      },
    },
  ],
};
