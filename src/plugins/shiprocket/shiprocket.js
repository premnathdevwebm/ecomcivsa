const axios = require("axios")

module.exports.noAuthShipRock = axios.create({
    baseURL: process.env.SHIPROCKET_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })

module.exports.AuthShipRock =(token)=> axios.create({
    baseURL: process.env.SHIPROCKET_URL,
    headers: {
      "Content-Type": "application/json",
      'Authorization': 'Bearer ' + token
    },
  })