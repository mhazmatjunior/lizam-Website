import nodemailer from 'nodemailer';

interface OrderEmailData {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  amount: number;
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL || `"RAANAE Fragrances" <info@raanae.com>`;

  const isConfigured = smtpHost && smtpUser && smtpPassword;

  // Pretty print payment method labels
  let methodLabel = 'Online Payment (Safepay)';
  if (order.paymentMethod === 'cod_standard') {
    methodLabel = 'Standard Cash on Delivery';
  } else if (order.paymentMethod === 'cod_founder') {
    methodLabel = 'Founder Delivery (Cash on Delivery)';
  }

  // Build high-fidelity HTML email body
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - RAANAE</title>
      <style>
        body {
          background-color: #000000;
          color: #ffffff;
          font-family: 'Montserrat', Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #050505;
          border: 1px solid #1a1a1a;
          border-top: 3px solid #e2bb61;
          padding: 40px;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          font-family: Georgia, serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 0.3em;
          color: #e2bb61;
          text-transform: uppercase;
          margin: 0;
        }
        .tagline {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.4em;
          color: #666666;
          text-transform: uppercase;
          margin-top: 10px;
          margin-bottom: 0;
        }
        .intro {
          font-size: 14px;
          line-height: 1.6;
          color: #cccccc;
          margin-bottom: 30px;
        }
        .receipt-card {
          background-color: #0b0b0b;
          border: 1px solid #151515;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
        }
        .receipt-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #222222;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .order-id {
          font-size: 12px;
          font-weight: 900;
          color: #e2bb61;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .order-date {
          font-size: 10px;
          color: #666666;
        }
        .item-row {
          margin-bottom: 14px;
        }
        .item-name {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
        }
        .totals-block {
          border-top: 1px solid #222222;
          padding-top: 16px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 900;
          color: #e2bb61;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .details-section {
          margin-bottom: 30px;
        }
        .details-title {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #666666;
          margin-bottom: 12px;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 6px;
        }
        .details-text {
          font-size: 11px;
          line-height: 1.5;
          color: #999999;
          margin: 0 0 16px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          border-top: 1px solid #1a1a1a;
          padding-top: 30px;
          font-size: 10px;
          color: #444444;
          line-height: 1.6;
        }
        .footer a {
          color: #e2bb61;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">RAANAE</h1>
          <p class="tagline">The Fragrance of Freedom</p>
        </div>

        <div class="intro">
          <p>Dear ${order.name},</p>
          <p>Thank you for choosing RAANAE. Your order has been placed successfully. We are preparing your selection for dispatch with our premium white-glove shipping service.</p>
        </div>

        <div class="receipt-card">
          <div style="border-bottom: 1px solid #222222; padding-bottom: 12px; margin-bottom: 16px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left"><span class="order-id">ID: ${order.orderId}</span></td>
                <td align="right"><span class="order-date">${new Date().toLocaleDateString()}</span></td>
              </tr>
            </table>
          </div>

          <div class="item-row">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left"><span class="item-name">${order.product}</span></td>
                <td align="right" style="font-size: 12px; font-weight: 700; color: #ffffff;">Rs ${order.amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="totals-block">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left"><span class="total-row" style="font-size: 14px; font-weight: 900; color: #e2bb61;">Total Amount</span></td>
                <td align="right" style="font-size: 16px; font-weight: 900; color: #e2bb61;">Rs ${order.amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="details-section">
          <div class="details-title">Delivery Coordinates</div>
          <p class="details-text">
            <strong>Recipient:</strong> ${order.name}<br>
            <strong>Phone:</strong> ${order.phone}<br>
            <strong>Destination:</strong> ${order.address}
          </p>

          <div class="details-title">Payment & Dispatch Choice</div>
          <p class="details-text">
            <strong>Method:</strong> ${methodLabel}
          </p>
        </div>

        <div class="footer">
          <p>All proceeds from your purchase go directly to supporting oppressed communities globally.</p>
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved.<br>
          <a href="https://www.raanae.com">www.raanae.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!isConfigured) {
    console.log('\n--- ✉️ [MOCK EMAIL LOGGER] ---');
    console.log(`To: ${order.email}`);
    console.log(`Subject: RAANAE Order Confirmation - ${order.orderId}`);
    console.log(`Method: ${methodLabel}`);
    console.log(`Recipient: ${order.name} (${order.phone})`);
    console.log(`Items: ${order.product}`);
    console.log(`Total: Rs ${order.amount.toLocaleString()}`);
    console.log('--------------------------------\n');
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // True for 465, false for 587/other
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to: order.email,
      subject: `RAANAE Order Confirmation - ${order.orderId}`,
      html: htmlContent,
    });

    console.log(`✉️ Transactional Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Nodemailer Send Error:', error.message);
    // Return success: false, but don't block core transaction execution
    return { success: false, error: error.message };
  }
}
