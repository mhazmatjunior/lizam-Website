import nodemailer from 'nodemailer';

export interface OrderEmailData {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  amount: number;
  paymentMethod: string;
  paymentSubMethod?: string;
  tracker?: string;
}

function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL || `"RAANAE Fragrances" <info@raanae.com>`;

  const isConfigured = Boolean(smtpHost && smtpUser && smtpPassword);

  if (!isConfigured) {
    return { isConfigured: false, fromEmail };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  return { isConfigured: true, transporter, fromEmail };
}

function getMethodLabel(paymentMethod: string, paymentSubMethod?: string) {
  if (paymentMethod === 'cod_standard') return 'Standard Cash on Delivery (COD)';
  if (paymentMethod === 'cod_founder') return 'Founder Hand-Delivery (Lahore)';
  if (paymentMethod === 'online_manual') return `Manual Transfer (${paymentSubMethod || 'Bank / Wallet'})`;
  return 'Online Payment (Safepay Card)';
}

// 1. Triggered on Order Placement
export async function sendOrderPlacedEmail(order: OrderEmailData) {
  const { isConfigured, transporter, fromEmail } = getTransporter();
  const methodLabel = getMethodLabel(order.paymentMethod, order.paymentSubMethod);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Placed - RAANAE</title>
      <style>
        body { background-color: #000; color: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-top: 3px solid #e2bb61; padding: 40px; }
        .logo { font-family: Georgia, serif; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #e2bb61; text-align: center; margin: 0; }
        .tagline { font-size: 8px; font-weight: 700; letter-spacing: 0.4em; color: #666666; text-align: center; text-transform: uppercase; margin-top: 6px; }
        .heading { font-size: 18px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 30px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        .card { background-color: #0b0b0b; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .text { font-size: 13px; line-height: 1.6; color: #cccccc; }
        .gold { color: #e2bb61; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; border-top: 1px solid #1a1a1a; padding-top: 20px; font-size: 10px; color: #444; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="logo">RAANAE</h1>
        <p class="tagline">The Fragrance of Freedom</p>

        <div class="heading">Order Placement Confirmation</div>
        <p class="text">Dear ${order.name},</p>
        <p class="text">Your order <span class="gold">#${order.orderId}</span> has been received successfully. Below are your order details:</p>

        <div class="card">
          <p className="text" style="margin: 0 0 10px 0;"><strong>Selection:</strong> ${order.product}</p>
          <p className="text" style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> <span class="gold">Rs ${order.amount.toLocaleString()}</span></p>
          <p className="text" style="margin: 0 0 10px 0;"><strong>Payment Method:</strong> ${methodLabel}</p>
          <p className="text" style="margin: 0;"><strong>Shipping Destination:</strong> ${order.address}</p>
        </div>

        ${order.paymentMethod === 'online_manual' ? `
          <div style="background-color: #1a1505; border: 1px solid #e2bb61; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #e2bb61; font-size: 12px; font-weight: bold; margin: 0 0 6px 0;">📌 Next Step for Verification:</p>
            <p style="color: #cccccc; font-size: 11px; margin: 0; line-height: 1.5;">
              If you have not uploaded your payment transfer receipt screenshot yet, please ensure your proof is uploaded so our admin team can verify your transaction.
            </p>
          </div>
        ` : ''}

        <p class="text">We will update you as soon as your payment is verified and package is dispatched.</p>

        <div class="footer">
          <p>All proceeds support humanitarian freedom efforts globally.</p>
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!isConfigured) {
    console.log(`✉️ [MOCK EMAIL] Order Placed sent to ${order.email} (Order #${order.orderId})`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter!.sendMail({
      from: fromEmail,
      to: order.email,
      subject: `RAANAE Order Received - #${order.orderId}`,
      html: htmlContent,
    });
    console.log(`✉️ Order Placed Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send Order Placed email:', error.message);
    return { success: false, error: error.message };
  }
}

// 2. Triggered when Payment is Verified (Status -> paid)
export async function sendPaymentVerifiedEmail(order: OrderEmailData) {
  const { isConfigured, transporter, fromEmail } = getTransporter();
  const methodLabel = getMethodLabel(order.paymentMethod, order.paymentSubMethod);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Verified - RAANAE</title>
      <style>
        body { background-color: #000; color: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-top: 3px solid #10b981; padding: 40px; }
        .logo { font-family: Georgia, serif; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #e2bb61; text-align: center; margin: 0; }
        .heading { font-size: 18px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 25px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        .card { background-color: #0b0b0b; border: 1px solid #10b981; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .text { font-size: 13px; line-height: 1.6; color: #cccccc; }
        .gold { color: #e2bb61; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; border-top: 1px solid #1a1a1a; padding-top: 20px; font-size: 10px; color: #444; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="logo">RAANAE</h1>
        
        <div class="heading">✓ Payment Verified & Order Confirmed</div>
        <p class="text">Dear ${order.name},</p>
        <p class="text">Great news! Your payment of <span class="gold">Rs ${order.amount.toLocaleString()}</span> for Order <span class="gold">#${order.orderId}</span> has been verified and approved.</p>

        <div class="card">
          <p class="text" style="margin: 0 0 10px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PAYMENT VERIFIED (PAID)</span></p>
          <p class="text" style="margin: 0 0 10px 0;"><strong>Items:</strong> ${order.product}</p>
          <p class="text" style="margin: 0 0 10px 0;"><strong>Payment Method:</strong> ${methodLabel}</p>
          <p class="text" style="margin: 0;"><strong>Shipping Destination:</strong> ${order.address}</p>
        </div>

        <p class="text">Your selection is now being prepared for luxury white-glove packaging and dispatch.</p>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!isConfigured) {
    console.log(`✉️ [MOCK EMAIL] Payment Verified sent to ${order.email} (Order #${order.orderId})`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter!.sendMail({
      from: fromEmail,
      to: order.email,
      subject: `Payment Verified! Your RAANAE Order #${order.orderId} is Confirmed`,
      html: htmlContent,
    });
    console.log(`✉️ Payment Verified Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send Payment Verified email:', error.message);
    return { success: false, error: error.message };
  }
}

// 3. Triggered when Order is Shipped (Status -> shipped)
export async function sendOrderShippedEmail(order: OrderEmailData) {
  const { isConfigured, transporter, fromEmail } = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Dispatched - RAANAE</title>
      <style>
        body { background-color: #000; color: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-top: 3px solid #06b6d4; padding: 40px; }
        .logo { font-family: Georgia, serif; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #e2bb61; text-align: center; margin: 0; }
        .heading { font-size: 18px; font-weight: 900; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 25px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        .card { background-color: #0b0b0b; border: 1px solid #06b6d4; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .text { font-size: 13px; line-height: 1.6; color: #cccccc; }
        .gold { color: #e2bb61; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; border-top: 1px solid #1a1a1a; padding-top: 20px; font-size: 10px; color: #444; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="logo">RAANAE</h1>

        <div class="heading">🚚 Your RAANAE Selection Has Been Shipped</div>
        <p class="text">Dear ${order.name},</p>
        <p class="text">Your package for Order <span class="gold">#${order.orderId}</span> has been dispatched and is on its way to you!</p>

        <div class="card">
          <p class="text" style="margin: 0 0 10px 0;"><strong>Status:</strong> <span style="color: #06b6d4; font-weight: bold;">DISPATCHED & IN TRANSIT</span></p>
          <p class="text" style="margin: 0 0 10px 0;"><strong>Items:</strong> ${order.product}</p>
          <p class="text" style="margin: 0 0 10px 0;"><strong>Destination:</strong> ${order.address}</p>
          ${order.tracker ? `<p class="text" style="margin: 0;"><strong>Tracking Reference:</strong> <span class="gold">${order.tracker}</span></p>` : ''}
        </div>

        <p class="text">Our courier partner will contact you at <strong>${order.phone}</strong> prior to doorstep delivery.</p>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!isConfigured) {
    console.log(`✉️ [MOCK EMAIL] Order Shipped sent to ${order.email} (Order #${order.orderId})`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter!.sendMail({
      from: fromEmail,
      to: order.email,
      subject: `Your RAANAE Selection Has Been Shipped - #${order.orderId}`,
      html: htmlContent,
    });
    console.log(`✉️ Order Shipped Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Failed to send Order Shipped email:', error.message);
    return { success: false, error: error.message };
  }
}

// Alias for backward compatibility
export const sendOrderConfirmationEmail = sendOrderPlacedEmail;
