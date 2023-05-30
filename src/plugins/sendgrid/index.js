const sgMail = require("@sendgrid/mail");
const axios = require("axios");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function mail(name, order, ship, ccExist, attachmentsExist, attachedUrls) {
  const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Civsa</title>
        <style>
          /* Body styles */
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
          }
    
          /* Header styles */
          .header {
            background-color: #003366;
            color: #ffffff;
            padding: 20px;
          }
    
          /* Logo styles */
          .logo {
            height: 60px;
            width: 60px;
          }
    
          /* Content styles */
          .content {
            background-color: #ffffff;
            padding: 20px;
          }
    
          /* Footer styles */
          .footer {
            background-color: #003366;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <img class="logo" src="https://www.civsa.in/static/media/logo.f0881365a5d3271ddd21.png" alt="Company Logo">
        </div>
    
        <!-- Content -->
        <div class="content">
          <h1>Order Placed</h1>
          <p>Dear Team,</p>
          <p>An order ID: ${order} and shipment ID: ${ship} has been placed by customer ${name}.</p>
          <p>Best regards,<br>Civsa</p>
        </div>
    
        <!-- Footer -->
        <div class="footer">
          <p>&copy; 2023 Civsa. All rights reserved.</p>
        </div>
      </body>
    </html>`;

  const msg = {
    to: "info@civsa.in",
    from: "info@civsa.in",
    subject: "Order Placed",
    text: "An order was placed",
    html,
    cc: [],
    attachments: [],
  };

  if (ccExist) {
    msg.cc.push("support@civsa.in");
  }

  // Add attachment(s) if available
  if (attachmentsExist) {
    let attachmentUrls = [];

    if (attachmentsExist === true) {
      attachmentUrls = [...attachedUrls];
    }

    const attachmentPromises = attachmentUrls.map((attachmentUrl) => {
      return axios
        .get(attachmentUrl, { responseType: "arraybuffer" })
        .then((response) => {
          const attachment = {
            content: Buffer.from(response.data).toString("base64"),
            filename: attachmentUrl.substring(
              attachmentUrl.lastIndexOf("/") + 1
            ),
            type: "application/pdf",
            disposition: "attachment",
          };
          msg.attachments.push(attachment);
        })
        .catch((error) => {
          console.error(error);
        });
    });

    Promise.all(attachmentPromises)
      .then(() => {
        function sendEmail() {
          sgMail
            .send(msg)
            .then(() => {
              return { status: true, data: "Email sent" };
            })
            .catch((error) => {
              return error.response;
            });
        }
        sendEmail();
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    function sendEmail() {
      sgMail
        .send(msg)
        .then(() => {
          return { status: true, data: "Email sent" };
        })
        .catch((error) => {
          return error.response;
        });
    }
    sendEmail();
  }
}

module.exports = mail;
