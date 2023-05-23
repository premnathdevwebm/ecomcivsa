const crypto = require("crypto");
const { noAuthShipRock, AuthShipRock } = require("./shiprocket");

async function ApiCall() {
  try {
    const {
      data: { token },
    } = await noAuthShipRock.post("/auth/login", {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });
    return token;
  } catch (err) {
    console.error(err);
    return;
  }
}

async function calling(body) {
  const randomNum = crypto.randomBytes(4).readUInt32BE(0) % 1000000000;
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const date = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  try {
    const token = await ApiCall();
    const obj = {
      order_id: randomNum,
      order_date: `${year}-${month}-${date} ${hours}:${minutes}`,
      pickup_location: "Ceego Labs",
      comment: "Orders made and produceed by cisva",
      billing_customer_name: body.name,
      billing_last_name: body.name,
      billing_address: body.address1,
      billing_address_2: body.address2,
      billing_city: body.city,
      billing_pincode: body.zip,
      billing_state: body.state,
      billing_country: body.country,
      billing_email: body.email,
      billing_phone: body.phone,
      shipping_is_billing: true,
      order_items: body.order_items,
      sub_total: body.sub_total,
      payment_method: body.payment_method,
      length: body.length,
      breadth: body.breadth,
      height: body.height,
      weight: body.weight,
      shipping_customer_name: "",
      shipping_last_name: "",
      shipping_address: "",
      shipping_address_2: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_country: "",
      shipping_state: "",
      shipping_email: "",
      shipping_phone: "",
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
    };
    const response = await AuthShipRock(token).post(
      "/shipments/create/forward-shipment",
      obj
    );
    return response.data;
  } catch (error) {
    console.error(err);
    return;
  }
}

module.exports.calling = calling;
