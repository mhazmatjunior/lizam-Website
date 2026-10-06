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
