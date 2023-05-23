function generateMailBody(name, order, ship) {
  return `<!DOCTYPE html>
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
        <img class="logo" src="https://civsa.in/assets/uploads/media-uploader/png-logo-011672403308.png" alt="Company Logo">
      </div>
  
      <!-- Content -->
      <div class="content">
        <h1>Oder Placed</h1>
        <p>Dear Team,</p>
        <p>An order ID: ${order} and shipment ID: ${ship}  has been placed by ${name}.</p>
        <p>Best regards,<br>Civsa</p>
      </div>
  
      <!-- Footer -->
      <div class="footer">
        <p>&copy; 2023 Civsa. All rights reserved.</p>
      </div>
    </body>
  </html>`;
}

module.exports = generateMailBody;
