import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function paint(size) {
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    buf[i * 4] = 0x10;
    buf[i * 4 + 1] = 0x0d;
    buf[i * 4 + 2] = 0x0c;
    buf[i * 4 + 3] = 0xff;
  }
  const margin = Math.round(size * 0.18);
  const radius = Math.max(2, Math.round(size * 0.12));
  const stroke = Math.max(1, Math.round(size * 0.055));
  const x0 = margin;
  const y0 = margin;
  const x1 = size - margin;
  const y1 = size - margin;

  function inside(x, y, left, top, right, bottom, rad) {
    if (x < left || y < top || x >= right || y >= bottom) return false;
    const cx = x < left + rad ? left + rad : x >= right - rad ? right - rad : x;
    const cy = y < top + rad ? top + rad : y >= bottom - rad ? bottom - rad : y;
    if (cx === x && cy === y) return true;
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    return dx * dx + dy * dy <= rad * rad;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const outer = inside(x, y, x0, y0, x1, y1, radius);
      const inner = inside(x, y, x0 + stroke, y0 + stroke, x1 - stroke, y1 - stroke, Math.max(1, radius - stroke));
      if (outer && !inner) {
        const i = (y * size + x) * 4;
        buf[i] = 0xe6;
        buf[i + 1] = 0xdd;
        buf[i + 2] = 0xd5;
        buf[i + 3] = 0xff;
      }
    }
  }

  const lines = [
    [0.4, 0.46],
    [0.52, 0.36],
    [0.64, 0.28],
  ];
  const thickness = Math.max(1, Math.round(size * 0.04));
  for (const [yRatio, wRatio] of lines) {
    const yb = Math.round(size * yRatio);
    const xStart = Math.round(size * 0.32);
    const xEnd = xStart + Math.round(size * wRatio);
    for (let y = yb; y < yb + thickness && y < size; y++) {
      for (let x = xStart; x < xEnd && x < size; x++) {
        const i = (y * size + x) * 4;
        buf[i] = 0xe6;
        buf[i + 1] = 0xdd;
        buf[i + 2] = 0xd5;
        buf[i + 3] = 0xff;
      }
    }
  }
  return buf;
}

function dib(size, bgra) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  const xorSize = size * size * 4;
  header.writeUInt32LE(xorSize, 20);
  const xor = Buffer.alloc(xorSize);
  for (let y = 0; y < size; y++) {
    const src = (size - 1 - y) * size * 4;
    bgra.copy(xor, y * size * 4, src, src + size * 4);
  }
  const maskStride = Math.ceil(size / 32) * 4;
  const and = Buffer.alloc(maskStride * size);
  return Buffer.concat([header, xor, and]);
}

const sizes = [16, 32, 48, 256];
const images = sizes.map((size) => dib(size, paint(size)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + images.length * 16;
const entries = images.map((image, index) => {
  const size = sizes[index];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  return entry;
});

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "../build/icon.ico");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, ...entries, ...images]));
console.log(out);
