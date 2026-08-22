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

function getTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.resend.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER || 'resend';
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.RESEND_API_KEY;

  const isConfigured = Boolean(smtpHost && smtpUser && smtpPassword);

  if (!isConfigured) return null;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
}

function getFromEmail() {
  let raw = process.env.SMTP_FROM_EMAIL || 'RAANAE Fragrances <info@raanae.com>';
  // Clean surrounding quotes if passed in Vercel UI
  raw = raw.replace(/^"|"$/g, '').trim();
  return raw;
}

function getMethodLabel(paymentMethod: string) {
  if (paymentMethod === 'cod_standard') return 'Standard Cash on Delivery';
  if (paymentMethod === 'cod_founder') return 'Founder Delivery (Cash on Delivery)';
  if (paymentMethod === 'online_manual') return 'Manual Bank / Mobile Wallet Transfer';
  return 'Online Card Payment (Safepay)';
}

// BULLETPROOF DUAL SENDER ENGINE (Resend HTTP API + Automatic Onboarding Sender Fallback)
async function sendMailHelper(to: string, subject: string, html: string) {
  const apiKey = (process.env.RESEND_API_KEY || process.env.SMTP_PASSWORD || '').trim();
  const fromEmail = getFromEmail();

  // 1. Try Resend HTTP API directly first (bypasses serverless port blocks, 100% reliable on Vercel)
  if (apiKey && apiKey.startsWith('re_')) {
    try {
      console.log(`✉️ Sending email via Resend HTTP API to ${to} (From: ${fromEmail})...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        console.log(`✅ Resend HTTP API email delivered successfully:`, resData.id);
        return { success: true, messageId: resData.id };
      }
      
      console.warn(`⚠️ Resend HTTP API returned status ${res.status}:`, JSON.stringify(resData));

      // Automatic fallback: If domain is pending propagation, retry using Resend default onboarding sender
      if (!res.ok) {
        console.log(`🔄 Retrying email delivery with fallback sender onboarding@resend.dev...`);
        const fallbackRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RAANAE Fragrances <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
          }),
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) {
          console.log(`✅ Resend fallback email delivered successfully:`, fallbackData.id);
          return { success: true, messageId: fallbackData.id };
        }
        console.error(`❌ Resend fallback sender failed:`, JSON.stringify(fallbackData));
      }
    } catch (httpErr: any) {
      console.error('⚠️ Resend HTTP API fetch failed, trying Nodemailer SMTP:', httpErr.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`\n--- ✉️ [MOCK EMAIL LOGGER] To: ${to} | Subject: ${subject} ---`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log(`✉️ Nodemailer SMTP Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Nodemailer SMTP Send Error:', error.message);
    return { success: false, error: error.message };
  }
}

// 1. ORDER CONFIRMATION EMAIL (ON ORDER PLACED)
export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const methodLabel = getMethodLabel(order.paymentMethod);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - RAANAE</title>
      <style>
        body { background-color: #000000; color: #ffffff; font-family: 'Montserrat', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-top: 3px solid #e2bb61; padding: 40px; }
        .logo { font-family: Georgia, serif; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #e2bb61; text-transform: uppercase; margin: 0; text-align: center; }
        .tagline { font-size: 8px; font-weight: 700; letter-spacing: 0.4em; color: #666666; text-transform: uppercase; margin-top: 8px; text-align: center; }
        .receipt-card { background-color: #0b0b0b; border: 1px solid #151515; border-radius: 12px; padding: 24px; margin: 30px 0; }
        .footer { text-align: center; margin-top: 40px; border-top: 1px solid #1a1a1a; padding-top: 25px; font-size: 10px; color: #444444; }
        .footer a { color: #e2bb61; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="logo">RAANAE</h1>
        <p class="tagline">The Fragrance of Freedom</p>

        <div style="margin-top: 30px; font-size: 14px; line-height: 1.6; color: #cccccc;">
          <p>Dear ${order.name},</p>
          <p>Thank you for choosing RAANAE. Your order has been placed successfully. We are preparing your selection for dispatch with our premium white-glove shipping service.</p>
        </div>

        <div class="receipt-card">
          <div style="border-bottom: 1px solid #222222; padding-bottom: 12px; margin-bottom: 16px;">
            <table width="100%">
              <tr>
                <td align="left" style="font-size: 12px; font-weight: 900; color: #e2bb61;">ORDER ID: ${order.orderId}</td>
                <td align="right" style="font-size: 10px; color: #666666;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
          <table width="100%" style="margin-bottom: 12px;">
            <tr>
              <td align="left" style="font-size: 13px; font-weight: 700; color: #ffffff;">${order.product}</td>
              <td align="right" style="font-size: 13px; font-weight: 900; color: #e2bb61;">Rs ${order.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="font-size: 12px; line-height: 1.6; color: #999999;">
          <p><strong>Shipping To:</strong> ${order.name} (${order.phone})<br>${order.address}</p>
          <p><strong>Payment Mode:</strong> ${methodLabel}</p>
        </div>

        <div class="footer">
          <p>All proceeds from your purchase go directly to supporting oppressed communities globally.</p>
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved. <a href="https://www.raanae.com">www.raanae.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMailHelper(order.email, `RAANAE Order Confirmation - ${order.orderId}`, htmlContent);
}

// 2. PAYMENT VERIFIED EMAIL (ON ADMIN VERIFY)
export async function sendPaymentVerifiedEmail(order: OrderEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Verified - RAANAE</title>
      <style>
        body { background-color: #000000; color: #ffffff; font-family: 'Montserrat', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-top: 3px solid #10b981; padding: 40px; }
        .logo { font-family: Georgia, serif; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #e2bb61; text-transform: uppercase; margin: 0; text-align: center; }
        .badge { background-color: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; padding: 8px 16px; border-radius: 20px; text-align: center; display: inline-block; }
        .footer { text-align: center; margin-top: 40px; border-top: 1px solid #1a1a1a; padding-top: 25px; font-size: 10px; color: #444444; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="logo">RAANAE</h1>

        <div style="text-align: center; margin: 30px 0;">
          <span class="badge">✓ Payment Verified</span>
        </div>

        <div style="font-size: 14px; line-height: 1.6; color: #cccccc; margin-bottom: 30px;">
          <p>Dear ${order.name},</p>
          <p>We are pleased to inform you that your manual payment transfer screenshot for Order <strong>${order.orderId}</strong> (Rs ${order.amount.toLocaleString()}) has been verified and approved by our finance team.</p>
          <p>Your order is now fully confirmed and queued for priority white-glove dispatch.</p>
        </div>

        <div style="background-color: #0b0b0b; border: 1px solid #151515; border-radius: 12px; padding: 20px; font-size: 12px; color: #999999;">
          <p style="margin: 0 0 8px 0; color: #ffffff; font-weight: bold;">Order Items: ${order.product}</p>
          <p style="margin: 0; color: #e2bb61; font-weight: bold;">Status: PAID & APPROVED</p>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved. <a href="https://www.raanae.com" style="color: #e2bb61; text-decoration: none;">www.raanae.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMailHelper(order.email, `Payment Verified - Order ${order.orderId} Confirmed!`, htmlContent);
}

// 3. ORDER SHIPPED EMAIL (ON ADMIN MARK SHIPPED)
export async function sendOrderShippedEmail(order: OrderEmailData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Dispatched - RAANAE</title>
      <style>
        body { background-color: #000000; color: #ffffff; font-family: 'Montserrat', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-top: 3px solid #06b6d4; padding: 40px; }
        .logo { font-family: Georgia, serif; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #e2bb61; text-transform: uppercase; margin: 0; text-align: center; }
        .badge { background-color: rgba(6,182,212,0.15); border: 1px solid #06b6d4; color: #06b6d4; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; padding: 8px 16px; border-radius: 20px; text-align: center; display: inline-block; }
        .footer { text-align: center; margin-top: 40px; border-top: 1px solid #1a1a1a; padding-top: 25px; font-size: 10px; color: #444444; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="logo">RAANAE</h1>

        <div style="text-align: center; margin: 30px 0;">
          <span class="badge">🚚 Order Dispatched & On Its Way</span>
        </div>

        <div style="font-size: 14px; line-height: 1.6; color: #cccccc; margin-bottom: 30px;">
          <p>Dear ${order.name},</p>
          <p>Great news! Your RAANAE fragrance order <strong>${order.orderId}</strong> has been carefully packaged and dispatched for delivery.</p>
        </div>

        <div style="background-color: #0b0b0b; border: 1px solid #151515; border-radius: 12px; padding: 20px; font-size: 12px; color: #999999;">
          <p style="margin: 0 0 8px 0; color: #ffffff; font-weight: bold;">Destination:</p>
          <p style="margin: 0 0 16px 0; color: #cccccc;">${order.name}<br>${order.address}<br>Phone: ${order.phone}</p>
          <p style="margin: 0; color: #06b6d4; font-weight: bold;">Items: ${order.product}</p>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved. <a href="https://www.raanae.com" style="color: #e2bb61; text-decoration: none;">www.raanae.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMailHelper(order.email, `Order Dispatched - Your RAANAE Order ${order.orderId} is On Its Way!`, htmlContent);
}
