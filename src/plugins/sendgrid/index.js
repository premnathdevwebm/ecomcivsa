const axios = require('axios');

module.exports = {
  downloadPDF: async (url) => {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  },

  preparePayload: async (pdfFileLinks, toEmail, ccEmail, subject, fromEmail, body) => {
    const attachments = await Promise.all(
      pdfFileLinks.map(async (link) => {
        const pdfContent = await module.exports.downloadPDF(link);
        return {
          content: pdfContent.toString("base64"),
          filename: link.substring(link.lastIndexOf("/") + 1),
          type: "application/pdf",
          disposition: "attachment",
        };
      })
    );

    if (ccEmail) {
      return {
        personalizations: [
          {
            to: [{ email: toEmail }],
            cc: [{ email: ccEmail }],
            subject: subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: "text/html",
            value: body,
          },
        ],
        ...(attachments.length > 0 && { attachments }),
      };
    } else {
      return {
        personalizations: [
          {
            to: [{ email: toEmail }],
            subject: subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: "text/html",
            value: body,
          },
        ],
        ...(attachments.length > 0 && { attachments }),
      };
    }
  },

  sendEmail: async (pdfFileLinks, toEmail, ccEmail, subject, fromEmail, body) => {
    try {
      const payload = await module.exports.preparePayload(
        pdfFileLinks,
        toEmail,
        ccEmail,
        subject,
        fromEmail,
        body
      );
      const response = await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Email sent successfully!");
      console.log(response.data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  },
};
