import { Safepay } from '@sfpy/node-sdk';

let safepayInstance: Safepay | null = null;

export const getSafepayClient = () => {
  if (safepayInstance) return safepayInstance;

  const env = (process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT as any) || 'sandbox';
  const apiKey = process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC;
  const v1Secret = process.env.SAFEPAY_SECRET;
  
  // The SDK requires a webhook secret. Outside development a missing secret would
  // let forged "payment succeeded" webhooks pass verification, so refuse to start.
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET
    || (process.env.NODE_ENV === 'production' ? '' : 'dummy_webhook_secret_for_dev_only');

  if (!apiKey || !v1Secret) {
    throw new Error('Safepay Configuration Error: Public Key or Secret Key is missing in .env.local');
  }

  if (!webhookSecret) {
    throw new Error('Safepay Configuration Error: SAFEPAY_WEBHOOK_SECRET is required in production');
  }

  safepayInstance = new Safepay({
    environment: env,
    apiKey,
    v1Secret,
    webhookSecret,
  });

  return safepayInstance;
};
