const sgMail = require("@sendgrid/mail");
const axios = require("axios");
// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  downloadPDF: async (url) => {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  },

  preparePayload: async (
    pdfFileLinks,
    toEmail,
    ccEmail,
    subject,
    fromEmail,
    body
  ) => {
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

    const personalizations = [
      {
        to: [{ email: toEmail }],
        subject: subject,
      },
    ];

    if (ccEmail) {
      personalizations[0].cc = [{ email: ccEmail }];
    }

    const mailOptions = {
      personalizations: personalizations,
      from: { email: fromEmail },
      content: [
        {
          type: "text/html",
          value: body,
        },
      ],
      attachments: attachments,
    };

    return mailOptions;
  },

  sendEmail: async (
    pdfFileLinks,
    toEmail,
    ccEmail,
    subject,
    fromEmail,
    body
  ) => {
    try {
      const payload = await module.exports.preparePayload(
        pdfFileLinks,
        toEmail,
        ccEmail,
        subject,
        fromEmail,
        body
      );

      const response = await sgMail.send(payload);
      console.log("Email sent successfully!");
      console.log(response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  },
};
