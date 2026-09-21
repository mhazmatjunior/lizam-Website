import { sendMailHelper } from '@/lib/email';

/**
 * Pre-order emails.
 *
 * A pre-order is paid in two instalments, so it gets its own templates rather
 * than reusing the order ones: the figures a customer needs to see are the
 * deposit, the balance, and what the balance is made of.
 */
export interface PreorderEmailData {
  preorderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  quantity: number;
  /** Goods total, delivery excluded. */
  totalAmount: number;
  /** Deposit the customer has paid, or been asked for. */
  depositAmount: number;
  /** Still owed, delivery included. */
  balanceAmount: number;
  deliveryFee?: number;
  /** Absolute URL of the unique balance-payment link. */
  paymentUrl?: string;
  /**
   * Absolute URL of the PNG QR code for that link. When present the email
   * leads with the code and the address becomes the fallback beneath it.
   */
  qrUrl?: string;
  orderId?: string;
}

const money = (n: number) => `Rs ${Number(n || 0).toLocaleString()}`;

/** Shared chrome, so the pre-order emails stay visually identical to each other. */
function preorderShell(accent: string, title: string, body: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - RAANAE</title>
      <style>
        body { background-color: #000000; color: #ffffff; font-family: 'Montserrat', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-top: 3px solid ${accent}; padding: 40px; }
        .logo { font-family: Georgia, serif; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #e2bb61; text-transform: uppercase; margin: 0; text-align: center; }
        .tagline { font-size: 8px; font-weight: 700; letter-spacing: 0.4em; color: #666666; text-transform: uppercase; margin-top: 8px; text-align: center; }
        .badge { background-color: rgba(226,187,97,0.12); border: 1px solid ${accent}; color: ${accent}; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; padding: 8px 16px; border-radius: 20px; display: inline-block; }
        .receipt-card { background-color: #0b0b0b; border: 1px solid #151515; border-radius: 12px; padding: 24px; margin: 30px 0; }
        .row td { font-size: 13px; padding: 6px 0; color: #cccccc; }
        .row td.val { text-align: right; color: #ffffff; font-weight: 700; }
        .cta { display: inline-block; background-color: ${accent}; color: #000000; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; padding: 16px 38px; border-radius: 30px; text-decoration: none; }
        .footer { text-align: center; margin-top: 40px; border-top: 1px solid #1a1a1a; padding-top: 25px; font-size: 10px; color: #444444; }
        .footer a { color: #e2bb61; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="logo">RAANAE</h1>
        <p class="tagline">The Fragrance of Freedom</p>
        ${body}
        <div class="footer">
          <p>All proceeds from your purchase go directly to supporting oppressed communities globally.</p>
          <p>&copy; ${new Date().getFullYear()} RAANAE. All Rights Reserved. <a href="https://www.raanae.com">www.raanae.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/** 1. Sent the moment a customer places a pre-order and submits their deposit proof. */
export async function sendPreorderConfirmationEmail(data: PreorderEmailData) {
  // The pass is issued with the pre-order, so it is already in this first
  // email. Nothing is payable yet -- scanning it now reports where the
  // reservation stands, and the same code turns into the payment page once we
  // ask for the balance. One code for the whole wait, nothing to keep track of.
  const passBlock =
    data.qrUrl && data.paymentUrl
      ? qrBlock({
          qrUrl: data.qrUrl,
          url: data.paymentUrl,
          alt: `Pre-order pass for ${data.preorderId}`,
          lead: `<strong style="color: #ffffff;">This is your pre-order pass.</strong><br>
                 Scan it any time to see where your reservation stands — and when the
                 balance is due, the very same code is how you settle it.`,
          note: `Keep it somewhere safe. It belongs to your pre-order alone, so please do
                 not forward or share it. You do not need to do anything with it today.`,
        })
      : '';

  const body = `
    <div style="text-align: center; margin: 30px 0;">
      <span class="badge">Pre-Order Reserved</span>
    </div>

    <div style="font-size: 14px; line-height: 1.6; color: #cccccc;">
      <p>Dear ${data.name},</p>
      <p>Thank you for pre-ordering with RAANAE. Your deposit has been received and your piece is reserved. We will verify your transfer shortly and confirm your reservation by email.</p>
    </div>

    <div class="receipt-card">
      <div style="border-bottom: 1px solid #222222; padding-bottom: 12px; margin-bottom: 16px;">
        <table width="100%">
          <tr>
            <td align="left" style="font-size: 12px; font-weight: 900; color: #e2bb61;">PRE-ORDER: ${data.preorderId}</td>
            <td align="right" style="font-size: 10px; color: #666666;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
      </div>
      <table width="100%">
        <tr class="row"><td>${data.product} &times; ${data.quantity}</td><td class="val">${money(data.totalAmount)}</td></tr>
        <tr class="row"><td style="color:#e2bb61;">Deposit Paid Now</td><td class="val" style="color:#e2bb61;">- ${money(data.depositAmount)}</td></tr>
        <tr><td colspan="2" style="border-top:1px solid #222222; padding-top:10px;"></td></tr>
        <tr class="row"><td style="font-weight:900; color:#ffffff;">Balance Remaining</td><td class="val">${money(data.balanceAmount)}</td></tr>
      </table>
    </div>

    ${passBlock}

    <div style="font-size: 12px; line-height: 1.7; color: #999999;">
      <p><strong style="color:#ffffff;">What happens next?</strong><br>
      We verify your transfer and confirm your reservation. When your fragrance is ready to dispatch we will email you again, and your pass above becomes the payment page for the remaining balance. Delivery charges are added at that stage. No further action is needed from you until then.</p>
      <p><strong>Reserved For:</strong> ${data.name} (${data.phone})<br>${data.address}</p>
    </div>
  `;

  return sendMailHelper(
    data.email,
    `RAANAE Pre-Order Confirmed - ${data.preorderId}`,
    preorderShell('#e2bb61', 'Pre-Order Confirmation', body)
  );
}

/**
 * The customer's pass, as an email-safe block.
 *
 * A table rather than a padded div, because Outlook ignores padding on a block
 * element and would print the code straight onto the black background, where
 * no scanner can read it. The white card is not decoration.
 *
 * The address is still spelled out underneath. A QR is an image, and a good
 * share of mail clients refuse to load images until the reader asks -- without
 * the fallback those readers get an email with a picture they cannot see and
 * no other way through.
 *
 * `lead` and `note` differ per email because the same code means different
 * things at different points: at placement it is how the customer checks where
 * their pre-order stands, and later it is how they pay for it.
 */
function qrBlock(opts: {
  qrUrl: string;
  url: string;
  alt: string;
  lead: string;
  note: string;
}) {
  return `
    <div style="text-align: center; margin: 35px 0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="background-color: #ffffff; padding: 16px; border-radius: 16px;">
            <img src="${opts.qrUrl}" width="240" height="240" alt="${opts.alt}"
                 style="display: block; width: 240px; height: 240px; border: 0; outline: none;">
          </td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #cccccc; margin-top: 22px; line-height: 1.7;">
        ${opts.lead}
      </p>

      <p style="font-size: 10px; color: #555555; margin-top: 16px; line-height: 1.7;">
        ${opts.note}<br><br>
        Cannot scan it? Open this address in your browser instead:<br>
        <span style="color: #777777; word-break: break-all;">${opts.url}</span>
      </p>
    </div>
  `;
}

/** 2. Sent when the admin presses "Send Payment Email". Carries the unique QR code. */
export async function sendPreorderBalancePaymentEmail(data: PreorderEmailData) {
  const deliveryRow =
    data.deliveryFee && data.deliveryFee > 0
      ? `<tr class="row"><td>Delivery</td><td class="val">${money(data.deliveryFee)}</td></tr>`
      : '';

  // The QR is the whole point of this email, but it is built from a token the
  // caller supplies -- so fall back to the plain button rather than sending a
  // payment request with nothing to press.
  const payBlock =
    data.qrUrl && data.paymentUrl
      ? qrBlock({
          qrUrl: data.qrUrl,
          url: data.paymentUrl,
          alt: 'QR code to pay your RAANAE pre-order balance',
          lead: `<strong style="color: #ffffff;">Scan this code with your phone camera</strong><br>
                 to open your secure payment page and complete your order.`,
          note: `This is the same code from your original confirmation. It belongs to your
                 pre-order alone and will take <strong style="color: #888888;">one</strong>
                 payment. Please do not forward or share it.`,
        })
      : `<div style="text-align: center; margin: 35px 0;">
           <a href="${data.paymentUrl}" class="cta">Pay Remaining Balance</a>
         </div>`;

  const body = `
    <div style="text-align: center; margin: 30px 0;">
      <span class="badge">Balance Payment Due</span>
    </div>

    <div style="font-size: 14px; line-height: 1.6; color: #cccccc;">
      <p>Dear ${data.name},</p>
      <p>Your pre-order <strong>${data.preorderId}</strong> is ready. To complete your purchase and release it for dispatch, please settle the remaining balance by scanning the code below.</p>
    </div>

    <div class="receipt-card">
      <table width="100%">
        <tr class="row"><td>${data.product} &times; ${data.quantity}</td><td class="val">${money(data.totalAmount)}</td></tr>
        ${deliveryRow}
        <tr class="row"><td style="color:#e2bb61;">Deposit Already Paid</td><td class="val" style="color:#e2bb61;">- ${money(data.depositAmount)}</td></tr>
        <tr><td colspan="2" style="border-top:1px solid #222222; padding-top:10px;"></td></tr>
        <tr class="row"><td style="font-weight:900; color:#ffffff; font-size:15px;">Amount Due Now</td><td class="val" style="font-size:15px; color:#e2bb61;">${money(data.balanceAmount)}</td></tr>
      </table>
    </div>

    ${payBlock}
  `;

  return sendMailHelper(
    data.email,
    `Action Required: Complete Your RAANAE Pre-Order ${data.preorderId}`,
    preorderShell('#e2bb61', 'Balance Payment', body)
  );
}

/** 3. Sent when the admin verifies the balance payment and the pre-order becomes an order. */
export async function sendPreorderCompletedEmail(data: PreorderEmailData) {
  const orderLine = data.orderId
    ? `<tr class="row"><td>Order Reference</td><td class="val">${data.orderId}</td></tr>`
    : '';

  const body = `
    <div style="text-align: center; margin: 30px 0;">
      <span class="badge">Pre-Order Fully Paid</span>
    </div>

    <div style="font-size: 14px; line-height: 1.6; color: #cccccc;">
      <p>Dear ${data.name},</p>
      <p>Your balance has been received in full and your pre-order <strong>${data.preorderId}</strong> is now confirmed. Your fragrance is being prepared for dispatch with our premium white-glove shipping service.</p>
    </div>

    <div class="receipt-card">
      <table width="100%">
        <tr class="row"><td>${data.product} &times; ${data.quantity}</td><td class="val">${money(data.totalAmount)}</td></tr>
        ${data.deliveryFee && data.deliveryFee > 0 ? `<tr class="row"><td>Delivery</td><td class="val">${money(data.deliveryFee)}</td></tr>` : ''}
        ${orderLine}
        <tr><td colspan="2" style="border-top:1px solid #222222; padding-top:10px;"></td></tr>
        <tr class="row"><td style="font-weight:900; color:#ffffff;">Paid In Full</td><td class="val" style="color:#10b981;">${money(Number(data.totalAmount) + Number(data.deliveryFee || 0))}</td></tr>
      </table>
    </div>

    <div style="font-size: 12px; line-height: 1.6; color: #999999;">
      <p><strong>Shipping To:</strong> ${data.name} (${data.phone})<br>${data.address}</p>
      <p>You will receive a dispatch notification with tracking details as soon as your parcel leaves us.</p>
    </div>
  `;

  return sendMailHelper(
    data.email,
    `RAANAE Pre-Order ${data.preorderId} - Paid In Full & Confirmed`,
    preorderShell('#10b981', 'Pre-Order Confirmed', body)
  );
}
