import { Safepay } from '@sfpy/node-sdk';

let safepayInstance: Safepay | null = null;

export const getSafepayClient = () => {
  if (safepayInstance) return safepayInstance;

  const env = (process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT as any) || 'sandbox';
  const apiKey = process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC;
  const v1Secret = process.env.SAFEPAY_SECRET;
  
  // The SDK requires a webhook secret even if we aren't using it yet.
  // We provide a dummy value if it's missing to prevent initialization crashes.
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET || 'dummy_webhook_secret_for_dev_only';

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
