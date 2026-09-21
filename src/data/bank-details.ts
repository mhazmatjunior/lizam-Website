// ---------------------------------------------------------------------------
// The accounts customers transfer to. Nothing here is validated by code, so a
// typo silently sends customer money to the wrong place — check every digit
// against a statement before changing anything below.
// ---------------------------------------------------------------------------

/** Which "How did you send it?" option an account backs. */
export type PayMethod = "bank" | "easypaisa" | "jazzcash";

export interface PayAccount {
  /** Bank / wallet name shown as the heading, e.g. "Bank Alfalah" */
  provider: string;
  /** Name the account is registered under */
  accountTitle: string;
  /** Account or wallet number */
  accountNumber: string;
  /** IBAN, for bank accounts only */
  iban?: string;
  /** Branch name or code, optional */
  branch?: string;
  /**
   * The transfer method this account is for. The payment panel offers only
   * the methods that actually appear here, so adding a wallet account below
   * is all it takes to put that option back in front of customers.
   */
  method: PayMethod;
}

export const BANK_ACCOUNTS: PayAccount[] = [
  {
    provider: "Bank Alfalah",
    accountTitle: "RAANAE",
    accountNumber: "00761011316137",
    iban: "PK03ALFH0076001011316137",
    method: "bank",
  },
];

/** How long customers are told to expect verification to take. */
export const VERIFICATION_WINDOW = "24 hours";

/** Upload limits, enforced on both the client and the server. */
export const PROOF_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PROOF_ACCEPTED_LABEL = "JPG, PNG, WEBP or PDF, up to 5 MB";
