require("dotenv").config()
const accountSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_AUTHTOKEN;
const client = require("twilio")(accountSid, authToken);

async function message(body, tonumb){
return await client.messages
.create({ body, from: process.env.TWILIO_FROM, to: tonumb })
}

module.exports.message = message