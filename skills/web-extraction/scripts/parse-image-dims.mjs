/**
 * Parse image dimensions from raw file buffer by reading format headers.
 * Supports PNG, JPEG, WebP (VP8/VP8L), GIF.
 * Returns { width, height } or null if format unrecognized / buffer too short.
 */
export function parseImageDimensions(buf) {
  if (!buf || buf.length < 8) return null;

  // PNG: 8-byte signature then IHDR chunk with width(4) + height(4) at offset 16
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    if (buf.length < 24) return null;
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }

  // GIF: "GIF87a" or "GIF89a", width/height at offset 6-9 (little-endian)
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    if (buf.length < 10) return null;
    return {
      width: buf.readUInt16LE(6),
      height: buf.readUInt16LE(8),
    };
  }

  // JPEG: SOI (0xFFD8), then scan for SOF0 (0xFFC0) or SOF2 (0xFFC2)
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
        };
      }
      const segLen = buf.readUInt16BE(offset + 2);
      offset += 2 + segLen;
    }
    return null;
  }

  // WebP: "RIFF" + size + "WEBP"
  if (
    buf.length >= 20 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const fourCC = buf.toString("ascii", 12, 16);

    if (fourCC === "VP8 " && buf.length >= 27) {
      if (buf[20] === 0x9d && buf[21] === 0x01 && buf[22] === 0x2a) {
        return {
          width: buf.readUInt16LE(23) & 0x3fff,
          height: buf.readUInt16LE(25) & 0x3fff,
        };
      }
    }

    if (fourCC === "VP8L" && buf.length >= 25) {
      if (buf[20] === 0x2f) {
        const bits = buf.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
    }

    return null;
  }

  return null;
}
