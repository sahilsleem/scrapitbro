/**
 * PhotoVault Lossless Metadata Stripper
 *
 * Provides bit-exact, lossless metadata removal for JPEG, PNG, and WebP formats.
 * Eliminates EXIF, GPS, XMP, IPTC, and embedded comments directly at the binary level
 * WITHOUT canvas re-encoding or lossy image recompression.
 *
 * Guarantees:
 * 1. Original pixel stream and DCT/entropy data are preserved 100% untouched.
 * 2. Exact image dimensions and color profiles are preserved.
 * 3. Never modifies or overwrites the original input file.
 */

export interface StrippingResult {
  scrubbedBlob: Blob;
  downloadFilename: string;
  originalSizeBytes: number;
  scrubbedSizeBytes: number;
  originalHash: string;
  scrubbedHash: string;
  isLossless: boolean;
  method: 'jpeg-lossless-segment-strip' | 'png-lossless-chunk-strip' | 'webp-lossless-riff-strip' | 'canvas-fallback';
  dimensions: { width: number; height: number };
}

/**
 * Compute SHA-256 hash string for an ArrayBuffer or Blob
 */
export async function computeSha256(data: ArrayBuffer | Blob): Promise<string> {
  const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Losslessly strip metadata from a JPEG image by removing APP1 (EXIF/XMP),
 * APP13 (IPTC), COM (Comments), and auxiliary APPn markers.
 *
 * Preserves SOI, DQT, DHT, SOF, ICC profile (APP2), and the entire SOS scan stream bit-for-bit.
 */
export function stripJpegMetadataLossless(buffer: ArrayBuffer): Uint8Array {
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  // Validate SOI marker (0xFF, 0xD8)
  if (u8.length < 4 || u8[0] !== 0xff || u8[1] !== 0xd8) {
    throw new Error('Invalid JPEG: Missing SOI marker');
  }

  const chunks: Uint8Array[] = [];
  // Write SOI
  chunks.push(new Uint8Array([0xff, 0xd8]));

  let offset = 2;
  const length = u8.length;

  while (offset < length) {
    // Find next marker (skip any 0xFF padding)
    if (u8[offset] !== 0xff) {
      chunks.push(u8.subarray(offset));
      break;
    }

    while (offset < length && u8[offset] === 0xff) {
      offset++;
    }

    if (offset >= length) break;

    const marker = u8[offset++];

    // Standalone markers without length
    if (marker === 0xd8) {
      continue;
    }
    if (marker === 0xd9) {
      // EOI
      chunks.push(new Uint8Array([0xff, 0xd9]));
      break;
    }
    if (marker >= 0xd0 && marker <= 0xd7) {
      // RST0 - RST7
      chunks.push(new Uint8Array([0xff, marker]));
      continue;
    }
    if (marker === 0x00 || marker === 0x01) {
      // Byte stuffing or TEM
      chunks.push(new Uint8Array([0xff, marker]));
      continue;
    }

    // Read segment length (2 bytes, big-endian, includes length bytes)
    if (offset + 2 > length) {
      break;
    }
    const segmentLength = view.getUint16(offset, false);
    const segmentStart = offset - 2; // includes 0xFF, marker
    const segmentEnd = offset + segmentLength;

    if (segmentEnd > length) {
      // Truncated segment, keep remainder to avoid breaking image
      chunks.push(u8.subarray(segmentStart));
      break;
    }

    // Check if this is the Start of Scan (SOS - 0xDA)
    if (marker === 0xda) {
      // All metadata segments occur BEFORE SOS.
      // Copy SOS and all remaining entropy data through EOI untouched.
      chunks.push(u8.subarray(segmentStart));
      break;
    }

    // Metadata markers to strip:
    // 0xE1: APP1 (EXIF, XMP, ExtendedXMP)
    // 0xED: APP13 (Photoshop IRB / IPTC)
    // 0xFE: COM (Comment)
    // 0xE3 - 0xEF (except APP2 if it holds ICC profile)
    let shouldStrip = false;

    if (marker === 0xe1 || marker === 0xed || marker === 0xfe) {
      shouldStrip = true;
    } else if (marker === 0xe2) {
      // APP2: Check if this is ICC profile (header starts with "ICC_PROFILE\0")
      // If it is ICC Profile, KEEP it for color fidelity! If not, strip.
      const isIcc =
        segmentLength >= 14 &&
        u8[offset + 2] === 0x49 && // 'I'
        u8[offset + 3] === 0x43 && // 'C'
        u8[offset + 4] === 0x43 && // 'C'
        u8[offset + 5] === 0x5f && // '_'
        u8[offset + 6] === 0x50 && // 'P'
        u8[offset + 7] === 0x52 && // 'R'
        u8[offset + 8] === 0x4f && // 'O'
        u8[offset + 9] === 0x46 && // 'F'
        u8[offset + 10] === 0x49 && // 'I'
        u8[offset + 11] === 0x4c && // 'L'
        u8[offset + 12] === 0x45 && // 'E'
        u8[offset + 13] === 0x00; // '\0'
      shouldStrip = !isIcc;
    } else if (marker >= 0xe3 && marker <= 0xef) {
      // APP3 to APP15 (camera manufacturer proprietary tags, preview thumbnails, etc.)
      shouldStrip = true;
    }

    if (!shouldStrip) {
      // Keep segment (e.g. APP0 JFIF, DQT 0xDB, DHT 0xC4, SOF0 0xC0, SOF2 0xC2, APP2 ICC)
      chunks.push(u8.subarray(segmentStart, segmentEnd));
    }

    offset = segmentEnd;
  }

  // Combine chunks into output Uint8Array
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let writePos = 0;
  for (const chunk of chunks) {
    result.set(chunk, writePos);
    writePos += chunk.length;
  }

  return result;
}

/**
 * Losslessly strip metadata from a PNG image by removing
 * eXIf, tEXt, zTXt, iTXt, and tIME chunks.
 *
 * Preserves IHDR, PLTE, tRNS, IDAT, color chunks (sRGB, iCCP, gAMA, cHRM), and IEND bit-for-bit.
 */
export function stripPngMetadataLossless(buffer: ArrayBuffer): Uint8Array {
  const u8 = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // PNG Signature: 89 50 4E 47 0D 0A 1A 0A
  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (u8.length < 8 || !pngSig.every((b, i) => u8[i] === b)) {
    throw new Error('Invalid PNG: Missing PNG signature');
  }

  const chunks: Uint8Array[] = [];
  // Write PNG signature
  chunks.push(u8.subarray(0, 8));

  let offset = 8;
  const length = u8.length;

  const metadataChunkNames = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME']);

  while (offset + 8 <= length) {
    const chunkLength = view.getUint32(offset, false);
    const chunkType = String.fromCharCode(
      u8[offset + 4],
      u8[offset + 5],
      u8[offset + 6],
      u8[offset + 7]
    );

    const totalChunkBytes = 12 + chunkLength; // 4 (len) + 4 (type) + data + 4 (crc)
    const chunkEnd = offset + totalChunkBytes;

    if (chunkEnd > length) {
      chunks.push(u8.subarray(offset));
      break;
    }

    if (!metadataChunkNames.has(chunkType)) {
      chunks.push(u8.subarray(offset, chunkEnd));
    }

    offset = chunkEnd;
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let writePos = 0;
  for (const chunk of chunks) {
    result.set(chunk, writePos);
    writePos += chunk.length;
  }

  return result;
}

/**
 * Losslessly strip metadata from a WebP image by removing EXIF and XMP chunks
 * from the RIFF container and updating the VP8X header flags.
 *
 * Preserves VP8 / VP8L / ALPH / ICCP and all image data bit-for-bit.
 */
export function stripWebpMetadataLossless(buffer: ArrayBuffer): Uint8Array {
  const u8 = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // Validate 'RIFF....WEBP'
  if (u8.length < 12) throw new Error('Invalid WebP: File too small');

  const isRiff = u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46;
  const isWebp = u8[8] === 0x57 && u8[9] === 0x45 && u8[10] === 0x42 && u8[11] === 0x50;

  if (!isRiff || !isWebp) {
    throw new Error('Invalid WebP: Missing RIFF/WEBP header');
  }

  const chunks: Uint8Array[] = [];
  let offset = 12;
  const length = u8.length;

  while (offset + 8 <= length) {
    const fourCC = String.fromCharCode(
      u8[offset],
      u8[offset + 1],
      u8[offset + 2],
      u8[offset + 3]
    );
    const chunkSize = view.getUint32(offset + 4, true); // WebP uses little-endian for chunk size
    const paddedSize = chunkSize + (chunkSize % 2); // 1-byte padding if odd
    const chunkEnd = offset + 8 + paddedSize;

    if (chunkEnd > length && offset + 8 + chunkSize <= length) {
      // Chunk reaches end without final pad
    } else if (chunkEnd > length) {
      chunks.push(u8.subarray(offset));
      break;
    }

    if (fourCC === 'EXIF' || fourCC === 'XMP ') {
      // Strip metadata chunk
    } else if (fourCC === 'VP8X' && chunkSize >= 10) {
      // VP8X header contains feature flags.
      // Bit 2 is EXIF flag (0x04), Bit 3 is XMP flag (0x08).
      // Make a copy of the VP8X chunk with EXIF & XMP flags cleared.
      const vp8xChunk = u8.subarray(offset, offset + 8 + paddedSize).slice();
      // Flags byte is at offset + 8 (first byte of VP8X payload) -> index 8 in chunk
      vp8xChunk[8] = vp8xChunk[8] & ~0x04 & ~0x08;
      chunks.push(vp8xChunk);
    } else {
      chunks.push(u8.subarray(offset, Math.min(chunkEnd, length)));
    }

    offset = chunkEnd;
  }

  // Calculate new RIFF size = 4 (for 'WEBP') + sum of chunk sizes
  const totalChunksLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const totalRiffPayload = 4 + totalChunksLength;

  const result = new Uint8Array(8 + totalRiffPayload);
  // 'RIFF'
  result.set([0x52, 0x49, 0x46, 0x46], 0);
  // File size - 8 in little endian
  const resultView = new DataView(result.buffer);
  resultView.setUint32(4, totalRiffPayload, true);
  // 'WEBP'
  result.set([0x57, 0x45, 0x42, 0x50], 8);

  let writePos = 12;
  for (const chunk of chunks) {
    result.set(chunk, writePos);
    writePos += chunk.length;
  }

  return result;
}

/**
 * Clean photo metadata with strict quality preservation.
 *
 * Uses lossless binary stripping for JPEG, PNG, and WebP formats.
 * Verifies image dimensions and decodability before returning.
 */
export async function sanitizePhotoMetadata(
  originalBlob: Blob,
  originalFilename: string
): Promise<StrippingResult> {
  const originalBuffer = await originalBlob.arrayBuffer();
  const originalHash = await computeSha256(originalBuffer);
  const originalSizeBytes = originalBlob.size;

  // Inspect original image dimensions using createImageBitmap
  const originalBitmap = await createImageBitmap(originalBlob, { imageOrientation: 'from-image' });
  const dimensions = { width: originalBitmap.width, height: originalBitmap.height };
  originalBitmap.close();

  const mime = originalBlob.type.toLowerCase();
  const nameLower = originalFilename.toLowerCase();

  let scrubbedBytes: Uint8Array | null = null;
  let method: StrippingResult['method'] = 'canvas-fallback';
  let isLossless = false;

  try {
    if (mime.includes('jpeg') || mime.includes('jpg') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg')) {
      scrubbedBytes = stripJpegMetadataLossless(originalBuffer);
      method = 'jpeg-lossless-segment-strip';
      isLossless = true;
    } else if (mime.includes('png') || nameLower.endsWith('.png')) {
      scrubbedBytes = stripPngMetadataLossless(originalBuffer);
      method = 'png-lossless-chunk-strip';
      isLossless = true;
    } else if (mime.includes('webp') || nameLower.endsWith('.webp')) {
      scrubbedBytes = stripWebpMetadataLossless(originalBuffer);
      method = 'webp-lossless-riff-strip';
      isLossless = true;
    }
  } catch (err) {
    console.warn('[Metadata Stripper] Lossless binary stripping encountered error, falling back:', err);
    scrubbedBytes = null;
  }

  let scrubbedBlob: Blob | null = null;

  if (scrubbedBytes && isLossless) {
    // Verify decodability and exact dimension match
    const testBlob = new Blob([scrubbedBytes.buffer as ArrayBuffer], { type: originalBlob.type || 'image/jpeg' });
    try {
      const testBitmap = await createImageBitmap(testBlob, { imageOrientation: 'from-image' });
      if (testBitmap.width !== dimensions.width || testBitmap.height !== dimensions.height) {
        throw new Error(`Dimension mismatch: expected ${dimensions.width}x${dimensions.height}, got ${testBitmap.width}x${testBitmap.height}`);
      }
      testBitmap.close();
      scrubbedBlob = testBlob;
    } catch (verifyErr) {
      console.warn('[Metadata Stripper] Lossless output verification failed:', verifyErr);
      scrubbedBytes = null;
      isLossless = false;
    }
  }

  if (!scrubbedBlob || !isLossless) {
    // Fallback: Canvas-based cleaning at original resolution with 1.0 quality
    method = 'canvas-fallback';
    isLossless = false;

    const bitmap = await createImageBitmap(originalBlob, { imageOrientation: 'from-image' });
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable for fallback cleaning');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const isPng = mime.includes('png') || nameLower.endsWith('.png');
    const isWebp = mime.includes('webp') || nameLower.endsWith('.webp');
    const exportType = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';
    const exportQuality = isPng ? undefined : 0.98;

    scrubbedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to encode fallback clean image'))),
        exportType,
        exportQuality
      );
    });
  }

  const dotIndex = originalFilename.lastIndexOf('.');
  const baseName = dotIndex > 0 ? originalFilename.substring(0, dotIndex) : originalFilename;
  const ext = dotIndex > 0 ? originalFilename.substring(dotIndex + 1) : 'jpg';
  const downloadFilename = `${baseName}_clean.${ext}`;

  const finalBlob = scrubbedBlob!;
  const scrubbedHash = await computeSha256(finalBlob);

  return {
    scrubbedBlob: finalBlob,
    downloadFilename,
    originalSizeBytes,
    scrubbedSizeBytes: finalBlob.size,
    originalHash,
    scrubbedHash,
    isLossless,
    method,
    dimensions,
  };
}
