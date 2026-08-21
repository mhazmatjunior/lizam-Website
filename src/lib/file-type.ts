/**
 * Detect a file's real type from its leading bytes.
 *
 * The filename and the browser-supplied MIME type are both attacker-controlled,
 * so neither is trusted. Shared by the payment-receipt upload and the review
 * photo upload.
 */

export interface FileKind {
  ext: string;
  mime: string;
}

type Signature = FileKind & { test: (b: Uint8Array) => boolean };

const SIGNATURES: Signature[] = [
  {
    ext: 'jpg',
    mime: 'image/jpeg',
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: 'png',
    mime: 'image/png',
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    ext: 'webp',
    mime: 'image/webp',
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    ext: 'pdf',
    mime: 'application/pdf',
    test: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
];

/** Returns the detected kind, or null when nothing matches. */
export function sniffFileType(bytes: Uint8Array): FileKind | null {
  const hit = SIGNATURES.find((s) => s.test(bytes));
  return hit ? { ext: hit.ext, mime: hit.mime } : null;
}

/** Same, but restricted to a whitelist of extensions. */
export function sniffImage(bytes: Uint8Array, allowed = ['jpg', 'png', 'webp']): FileKind | null {
  const kind = sniffFileType(bytes);
  return kind && allowed.includes(kind.ext) ? kind : null;
}
