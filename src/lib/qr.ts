import { deflateSync } from 'node:zlib';
import qrcode from 'qrcode-generator';

/**
 * QR codes, rendered to PNG.
 *
 * PNG rather than SVG because these end up in email, and Gmail and Outlook
 * both refuse SVG: a code the customer cannot see is a code they cannot scan.
 *
 * Only the symbol itself comes from a library. Reed-Solomon, mask selection
 * and version sizing are the parts that would be a mistake to hand-roll -- an
 * almost-right QR still renders, it just never scans. Everything after the
 * matrix (quiet zone, scaling, the PNG container) lives here, so the
 * dependency stays one zero-dependency package.
 *
 * Server-only: node:zlib would break the browser bundle. Anything the admin
 * screen needs to import belongs in preorder.ts instead.
 */

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrPngOptions {
  /** Pixels per QR module. */
  scale?: number;
  /** Quiet zone in modules. The spec's minimum is 4; below it scanners fail. */
  margin?: number;
  /**
   * How much of a damaged symbol can still be read. 'M' recovers ~15%, the
   * usual choice for a code scanned off a phone screen or a printed sheet.
   */
  level?: QrErrorCorrection;
}

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** PNG carries a CRC per chunk. Same polynomial zlib uses. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** length + type + data + CRC(type + data), as every PNG chunk is laid out. */
function pngChunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), Buffer.from(data)]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

/**
 * An 8-bit greyscale PNG. `pixels` is one byte per pixel, row-major.
 *
 * Greyscale (colour type 0) keeps this to a single function: a QR is two
 * colours, and a palette would save nothing deflate does not already.
 */
function greyscalePng(pixels: Uint8Array, width: number, height: number): Buffer {
  // Every scanline is prefixed with its filter type. 0 (none) is right here:
  // the rows are long runs of one value, which deflate handles on its own.
  const stride = width + 1;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    raw.set(pixels.subarray(y * width, (y + 1) * width), y * stride + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // colour type: greyscale
  ihdr[10] = 0; // compression: deflate
  ihdr[11] = 0; // filter: adaptive
  ihdr[12] = 0; // interlace: none

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', new Uint8Array(0)),
  ]);
}

// ---------------------------------------------------------------------------
// QR
// ---------------------------------------------------------------------------

/** The module matrix for `text`, quiet zone excluded. */
function qrModules(text: string, level: QrErrorCorrection): boolean[][] {
  // Type number 0 = pick the smallest version the data fits into.
  const qr = qrcode(0, level);
  qr.addData(text, 'Byte');
  qr.make();

  const count = qr.getModuleCount();
  const rows: boolean[][] = [];
  for (let r = 0; r < count; r += 1) {
    const row: boolean[] = [];
    for (let c = 0; c < count; c += 1) row.push(qr.isDark(r, c));
    rows.push(row);
  }
  return rows;
}

/** `text` as a black-on-white QR code, PNG encoded. */
export function qrPng(text: string, options: QrPngOptions = {}): Buffer {
  const scale = Math.max(1, Math.floor(options.scale ?? 8));
  const margin = Math.max(0, Math.floor(options.margin ?? 4));

  const modules = qrModules(text, options.level ?? 'M');
  const count = modules.length;
  const size = (count + margin * 2) * scale;

  // A white page, then the dark modules painted onto it. White rather than
  // transparent: these are read against a dark email background, and a
  // transparent QR against black is an unscannable negative.
  const pixels = new Uint8Array(size * size).fill(0xff);
  for (let r = 0; r < count; r += 1) {
    for (let c = 0; c < count; c += 1) {
      if (!modules[r][c]) continue;
      const left = (c + margin) * scale;
      const top = (r + margin) * scale;
      for (let y = top; y < top + scale; y += 1) {
        pixels.fill(0x00, y * size + left, y * size + left + scale);
      }
    }
  }

  return greyscalePng(pixels, size, size);
}
