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
  /** The pre-order's unique coupon code, entered at checkout to complete it. */
  couponCode?: string;
  /** Absolute URL of the checkout page the code is entered on. */
  checkoutUrl?: string;
  orderId?: string;
  /** Completed email only: the balance is being paid in cash on delivery. */
  isCod?: boolean;
  /**
   * Set when the pre-order was taken under the launch offer. Carries what
   * the same bottles would have cost at list, so the receipt can show the
   * saving, and whether delivery is included — which changes what the email
   * promises about the balance, so it must not be guessed at.
   */
  promo?: { listTotal: number; freeDelivery: boolean };
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
  // The offer is shown as what it saved, not only as a lower number: a
  // receipt that quietly prices below the website invites a "why is this
  // different?" email.
  const saving = data.promo ? data.promo.listTotal - data.totalAmount : 0;

  const promoRows =
    data.promo && saving > 0
      ? `<tr class="row"><td style="color:#777777;">Normal Price</td><td class="val" style="color:#777777; text-decoration:line-through;">${money(data.promo.listTotal)}</td></tr>
         <tr class="row"><td style="color:#10b981;">Launch Offer</td><td class="val" style="color:#10b981;">- ${money(saving)}</td></tr>`
      : '';

  const deliveryRow = data.promo?.freeDelivery
    ? `<tr class="row"><td style="color:#10b981;">Delivery</td><td class="val" style="color:#10b981;">Included</td></tr>`
    : '';

  // The code is issued with the pre-order, so it is already in this first
  // email. Nothing is payable yet -- entering it now reports where the
  // reservation stands, and the same code completes the order once we ask for
  // the balance. One code for the whole wait, nothing to keep track of.
  const passBlock = data.couponCode
    ? couponBlock({
        code: data.couponCode,
        url: data.checkoutUrl,
        lead: `<strong style="color: #ffffff;">This is your pre-order coupon code.</strong><br>
               When the balance is due, enter it on our checkout page with your payment
               screenshot to complete your order.`,
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
        ${promoRows}
        <tr class="row"><td>${data.product} &times; ${data.quantity}</td><td class="val">${money(data.totalAmount)}</td></tr>
        <tr class="row"><td style="color:#e2bb61;">Deposit Paid Now</td><td class="val" style="color:#e2bb61;">- ${money(data.depositAmount)}</td></tr>
        <tr><td colspan="2" style="border-top:1px solid #222222; padding-top:10px;"></td></tr>
        <tr class="row"><td style="font-weight:900; color:#ffffff;">Balance Remaining</td><td class="val">${money(data.balanceAmount)}</td></tr>
        ${deliveryRow}
      </table>
    </div>

    ${passBlock}

    <div style="font-size: 12px; line-height: 1.7; color: #999999;">
      <p><strong style="color:#ffffff;">What happens next?</strong><br>
      We verify your transfer and confirm your reservation. When your fragrance is ready to dispatch we will email you again, and you complete your order by entering the coupon code above at checkout. ${data.promo?.freeDelivery ? 'Delivery is included in your launch-offer price, so the balance above is all that is left to pay.' : 'Delivery charges are added at that stage.'} No further action is needed from you until then.</p>
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
 * The customer's coupon code, as an email-safe block.
 *
 * Plain text in a bordered table cell rather than an image, so it shows in
 * every mail client -- including the many that block images until asked --
 * and can be selected and copied straight into the checkout page. Monospace
 * and letter-spaced so similar characters are easy to tell apart.
 *
 * `lead` and `note` differ per email because the same code means different
 * things at different points: at placement it is something to keep, and later
 * it is how the customer completes their order.
 */
function couponBlock(opts: { code: string; url?: string; lead: string; note: string }) {
  const button = opts.url
    ? `<div style="margin-top: 26px;"><a href="${opts.url}" class="cta">Go To Checkout</a></div>`
    : '';

  return `
    <div style="text-align: center; margin: 35px 0;">
      <p style="font-size: 9px; font-weight: 900; letter-spacing: 0.35em; color: #777777; text-transform: uppercase; margin: 0 0 12px;">
        Your Coupon Code
      </p>
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="background-color: #0b0b0b; border: 2px dashed #e2bb61; border-radius: 14px; padding: 18px 26px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 700; letter-spacing: 0.18em; color: #e2bb61; white-space: nowrap;">${opts.code}</span>
          </td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #cccccc; margin-top: 22px; line-height: 1.7;">
        ${opts.lead}
      </p>

      ${button}

      <p style="font-size: 10px; color: #555555; margin-top: 22px; line-height: 1.7;">
        ${opts.note}
      </p>
    </div>
  `;
}

/** 2. Sent when the admin presses "Send Payment Email". Carries the unique coupon code. */
export async function sendPreorderBalancePaymentEmail(data: PreorderEmailData) {
  const deliveryRow =
    data.deliveryFee && data.deliveryFee > 0
      ? `<tr class="row"><td>Delivery</td><td class="val">${money(data.deliveryFee)}</td></tr>`
      : '';

  // The code is the whole point of this email. Should a caller ever omit it,
  // still send the customer to checkout rather than a request with nothing
  // to act on -- they can reply and ask for it.
  const payBlock = data.couponCode
    ? couponBlock({
        code: data.couponCode,
        url: data.checkoutUrl,
        lead: `<strong style="color: #ffffff;">How to complete your order:</strong><br>
               1. Open our checkout page and enter this coupon code.<br>
               2. Transfer ${money(data.balanceAmount)} and upload your payment screenshot
               (or choose cash on delivery).<br>
               3. Press <strong style="color: #ffffff;">Complete My Order</strong> — done.`,
        note: `This is the same code from your original confirmation. It belongs to your
               pre-order alone and completes <strong style="color: #888888;">one</strong>
               order. Please do not forward or share it.`,
      })
    : `<div style="text-align: center; margin: 35px 0;">
         <a href="${data.checkoutUrl || 'https://www.raanae.com/checkout'}" class="cta">Pay Remaining Balance</a>
       </div>`;

  const body = `
    <div style="text-align: center; margin: 30px 0;">
      <span class="badge">Balance Payment Due</span>
    </div>

    <div style="font-size: 14px; line-height: 1.6; color: #cccccc;">
      <p>Dear ${data.name},</p>
      <p>Your pre-order <strong>${data.preorderId}</strong> is ready. To complete your purchase and release it for dispatch, please settle the remaining balance using your coupon code below.</p>
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

/**
 * 3. Sent when the pre-order becomes an order: the moment the customer
 * completes it with their coupon code at checkout, or when an admin verifies
 * a balance paid some other way.
 */
export async function sendPreorderCompletedEmail(data: PreorderEmailData) {
  const orderLine = data.orderId
    ? `<tr class="row"><td>Order Reference</td><td class="val">${data.orderId}</td></tr>`
    : '';

  // Cash on delivery has not been paid yet, so the email must not say it has.
  const intro = data.isCod
    ? `Your pre-order <strong>${data.preorderId}</strong> is complete and confirmed. Please keep <strong>${money(data.balanceAmount)}</strong> ready in cash for the courier — your fragrance is being prepared for dispatch.`
    : `Your pre-order <strong>${data.preorderId}</strong> is complete and your balance payment has been received. Your fragrance is being prepared for dispatch with our premium white-glove shipping service.`;

  const totalRow = data.isCod
    ? `<tr class="row"><td style="font-weight:900; color:#ffffff;">Due On Delivery (Cash)</td><td class="val" style="color:#e2bb61;">${money(data.balanceAmount)}</td></tr>`
    : `<tr class="row"><td style="font-weight:900; color:#ffffff;">Paid In Full</td><td class="val" style="color:#10b981;">${money(Number(data.totalAmount) + Number(data.deliveryFee || 0))}</td></tr>`;

  const body = `
    <div style="text-align: center; margin: 30px 0;">
      <span class="badge">Order Complete</span>
    </div>

    <div style="font-size: 14px; line-height: 1.6; color: #cccccc;">
      <p>Dear ${data.name},</p>
      <p>${intro}</p>
    </div>

    <div class="receipt-card">
      <table width="100%">
        <tr class="row"><td>${data.product} &times; ${data.quantity}</td><td class="val">${money(data.totalAmount)}</td></tr>
        ${data.deliveryFee && data.deliveryFee > 0 ? `<tr class="row"><td>Delivery</td><td class="val">${money(data.deliveryFee)}</td></tr>` : ''}
        ${orderLine}
        <tr><td colspan="2" style="border-top:1px solid #222222; padding-top:10px;"></td></tr>
        ${data.isCod ? `<tr class="row"><td style="color:#e2bb61;">Deposit Paid</td><td class="val" style="color:#e2bb61;">- ${money(data.depositAmount)}</td></tr>` : ''}
        ${totalRow}
      </table>
    </div>

    <div style="font-size: 12px; line-height: 1.6; color: #999999;">
      <p><strong>Shipping To:</strong> ${data.name} (${data.phone})<br>${data.address}</p>
      <p>You will receive a dispatch notification with tracking details as soon as your parcel leaves us.</p>
    </div>
  `;

  return sendMailHelper(
    data.email,
    `RAANAE Pre-Order ${data.preorderId} - Order Complete`,
    preorderShell('#10b981', 'Order Complete', body)
  );
}
