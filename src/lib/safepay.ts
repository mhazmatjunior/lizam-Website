import { Safepay } from '@sfpy/node-sdk';

let safepayInstance: Safepay | null = null;

/** True when a real webhook secret is configured. */
export const hasWebhookSecret = () => Boolean(process.env.SAFEPAY_WEBHOOK_SECRET);

export const getSafepayClient = () => {
  if (safepayInstance) return safepayInstance;

  const env = (process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT as any) || 'sandbox';
  const apiKey = process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC;
  const v1Secret = process.env.SAFEPAY_SECRET;

  // The SDK constructor demands a webhook secret even when only creating a
  // checkout, so a placeholder keeps checkout working when none is set. It is
  // NEVER safe for verification -- the webhook route calls hasWebhookSecret()
  // and refuses to verify without a real one, so a placeholder cannot be used
  // to wave through a forged "payment succeeded" callback.
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET || 'unset-verification-disabled';

  if (!apiKey || !v1Secret) {
    throw new Error('Safepay Configuration Error: Public Key or Secret Key is missing in .env.local');
  }

  safepayInstance = new Safepay({
    environment: env,
    apiKey,
    v1Secret,
    webhookSecret,
  });

  return safepayInstance;
};
