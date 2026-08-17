// ---------------------------------------------------------------------------
// DUMMY DATA — replace every value below with the client's real account
// details before going live. Nothing here is validated by code, so a typo
// silently sends customer money to the wrong place. Double-check each field.
// ---------------------------------------------------------------------------

export interface PayAccount {
  /** Bank / wallet name shown as the heading, e.g. "Meezan Bank" */
  provider: string;
  /** Name the account is registered under */
  accountTitle: string;
  /** Account or wallet number */
  accountNumber: string;
  /** IBAN, for bank accounts only */
  iban?: string;
  /** Branch name or code, optional */
  branch?: string;
}

export const BANK_ACCOUNTS: PayAccount[] = [
  {
    provider: "Meezan Bank (DUMMY)",
    accountTitle: "RAANAE FRAGRANCES",
    accountNumber: "0000 1111 2222 3333",
    iban: "PK00MEZN0000001111222233",
    branch: "Gulberg III, Lahore",
  },
  {
    provider: "JazzCash (DUMMY)",
    accountTitle: "RAANAE FRAGRANCES",
    accountNumber: "0300 000 0000",
  },
  {
    provider: "Easypaisa (DUMMY)",
    accountTitle: "RAANAE FRAGRANCES",
    accountNumber: "0345 000 0000",
  },
];

/** How long customers are told to expect verification to take. */
export const VERIFICATION_WINDOW = "24 hours";

/** Upload limits, enforced on both the client and the server. */
export const PROOF_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PROOF_ACCEPTED_LABEL = "JPG, PNG, WEBP or PDF, up to 5 MB";
