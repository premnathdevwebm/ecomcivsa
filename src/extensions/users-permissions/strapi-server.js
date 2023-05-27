const crypto = require("crypto");
module.exports = (plugin) => {
  const register = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx) => {
    const referenceCode = crypto.randomBytes(6).toString("hex").toUpperCase();
    ctx.request.body.referenceCode = referenceCode
    await register(ctx);
  };
  return plugin;
};
