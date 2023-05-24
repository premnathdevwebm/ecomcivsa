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
    {
      method: "GET",
      path: "/myorder/:transaction",
      handler: "order.transactionsList",
    },
  ],
};
