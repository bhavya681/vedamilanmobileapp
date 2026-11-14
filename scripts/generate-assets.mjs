/**
 * Generates the VedaMilan brand raster assets (icon, adaptive icon, splash,
 * favicon, notification icon) without external image dependencies.
 *
 * Run: node scripts/generate-assets.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

const NAVY = [7, 17, 32, 255];
const GOLD = [200, 155, 60, 255];
const GOLD_SOFT = [212, 175, 55, 255];
const SAFFRON = [232, 138, 20, 255];
const WHITE = [255, 255, 255, 255];
const CLEAR = [0, 0, 0, 0];

function createCanvas(size) {
  return {
    size,
    data: new Uint8Array(size * size * 4),
    set(x, y, [r, g, b, a]) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      const i = (y * size + x) * 4;
      if (a === 255) {
        this.data[i] = r;
        this.data[i + 1] = g;
        this.data[i + 2] = b;
        this.data[i + 3] = 255;
        return;
      }
      const sa = a / 255;
      const da = this.data[i + 3] / 255;
      const outA = sa + da * (1 - sa);
      if (outA === 0) return;
      this.data[i] = Math.round((r * sa + this.data[i] * da * (1 - sa)) / outA);
      this.data[i + 1] = Math.round((g * sa + this.data[i + 1] * da * (1 - sa)) / outA);
      this.data[i + 2] = Math.round((b * sa + this.data[i + 2] * da * (1 - sa)) / outA);
      this.data[i + 3] = Math.round(outA * 255);
    },
  };
}

function fill(canvas, color) {
  for (let y = 0; y < canvas.size; y += 1) {
    for (let x = 0; x < canvas.size; x += 1) canvas.set(x, y, color);
  }
}

function disc(canvas, cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= cy + radius; y += 1) {
    for (let x = Math.floor(cx - radius); x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) canvas.set(x, y, color);
    }
  }
}

function ring(canvas, cx, cy, radius, thickness, color) {
  const outer = radius + thickness / 2;
  const inner = radius - thickness / 2;
  for (let y = Math.floor(cy - outer); y <= cy + outer; y += 1) {
    for (let x = Math.floor(cx - outer); x <= cx + outer; x += 1) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= outer && d >= inner) canvas.set(x, y, color);
    }
  }
}

function diamond(canvas, cx, cy, half, color) {
  for (let y = Math.floor(cy - half); y <= cy + half; y += 1) {
    for (let x = Math.floor(cx - half); x <= cx + half; x += 1) {
      if (Math.abs(x - cx) + Math.abs(y - cy) <= half) canvas.set(x, y, color);
    }
  }
}

function diamondOutline(canvas, cx, cy, half, thickness, color) {
  for (let y = Math.floor(cy - half); y <= cy + half; y += 1) {
    for (let x = Math.floor(cx - half); x <= cx + half; x += 1) {
      const d = Math.abs(x - cx) + Math.abs(y - cy);
      if (d <= half && d >= half - thickness) canvas.set(x, y, color);
    }
  }
}

function mark(canvas, scale, background) {
  const s = canvas.size;
  const c = s / 2;
  if (background) fill(canvas, background);
  disc(canvas, c, c, s * 0.34 * scale, [12, 24, 42, 255]);
  ring(canvas, c, c, s * 0.34 * scale, Math.max(2, s * 0.008 * scale), GOLD);
  ring(canvas, c, c, s * 0.27 * scale, Math.max(1, s * 0.003 * scale), [212, 175, 55, 90]);
  diamond(canvas, c, c - s * 0.02 * scale, s * 0.12 * scale, GOLD_SOFT);
  diamond(canvas, c, c - s * 0.02 * scale, s * 0.075 * scale, NAVY);
  disc(canvas, c, c - s * 0.155 * scale, s * 0.022 * scale, SAFFRON);
}

function encodePng(canvas) {
  const { size, data } = canvas;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(data.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  const chunks = [];
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, payload) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(payload.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, payload])) >>> 0, 0);
    return Buffer.concat([len, typeBuf, payload, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  chunks.push(signature, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })));
  chunks.push(chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function save(name, size, draw) {
  const canvas = createCanvas(size);
  draw(canvas);
  writeFileSync(join(OUT, name), encodePng(canvas));
  console.log(`wrote assets/${name} (${size}x${size})`);
}

save("icon.png", 1024, (c) => mark(c, 1, NAVY));
save("adaptive-icon.png", 1024, (c) => mark(c, 0.72, CLEAR));
save("splash-icon.png", 512, (c) => mark(c, 1, CLEAR));
save("favicon.png", 64, (c) => mark(c, 1, NAVY));
save("notification-icon.png", 96, (c) => diamondOutline(c, 48, 48, 34, 8, WHITE));
