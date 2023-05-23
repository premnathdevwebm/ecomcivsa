module.exports = {
  routes: [
    {
      method: "POST",
      path: "/create-charge",
      handler: "order.createPayment",
    },
    {
      method: "POST",
      path: "/orderplace",
      handler: "order.orderPlace",
    },
    {
      method: "GET",
      path: "/myorders",
      handler: "order.myOdrers",
    },
  ],
};
