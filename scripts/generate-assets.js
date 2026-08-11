/**
 * Génère les assets PNG de l'application (icône, icône adaptative, splash, favicon).
 *
 * Tout est rendu procéduralement puis encodé en PNG via zlib : aucune dépendance
 * native n'est nécessaire. Relancer avec `node scripts/generate-assets.js`.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ------------------------------------------------------------------ *
 * Encodeur PNG minimal (truecolor + alpha, 8 bits)
 * ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtre "None"
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ *
 * Utilitaires de rendu
 * ------------------------------------------------------------------ */

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Interpole une liste de paliers `[position, '#rrggbb']` triés par position. */
function gradientAt(stops, t) {
  if (t <= stops[0][0]) return hex(stops[0][1]);
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [p0, c0] = stops[i - 1];
      const [p1, c1] = stops[i];
      return mix(hex(c0), hex(c1), (t - p0) / (p1 - p0));
    }
  }
  return hex(stops[stops.length - 1][1]);
}

class Canvas {
  constructor(size) {
    this.size = size;
    this.px = new Float32Array(size * size * 4); // r, g, b, a en 0..1
  }

  /** Composite une couleur sur un pixel (opérateur « source-over »). */
  blend(x, y, rgb, alpha) {
    if (alpha <= 0) return;
    const i = (y * this.size + x) * 4;
    const a = clamp01(alpha);
    const inv = 1 - a;
    this.px[i] = (rgb[0] / 255) * a + this.px[i] * inv;
    this.px[i + 1] = (rgb[1] / 255) * a + this.px[i + 1] * inv;
    this.px[i + 2] = (rgb[2] / 255) * a + this.px[i + 2] * inv;
    this.px[i + 3] = a + this.px[i + 3] * inv;
  }

  /** Parcourt tous les pixels ; `fn` renvoie `[rgb, alpha]` ou `null`. */
  paint(fn) {
    const s = this.size;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const out = fn(x + 0.5, y + 0.5);
        if (out) this.blend(x, y, out[0], out[1]);
      }
    }
  }

  /** Réduit d'un facteur `factor` (supersampling) et renvoie un buffer RGBA 8 bits. */
  downsample(factor) {
    const outSize = this.size / factor;
    const out = new Uint8Array(outSize * outSize * 4);
    const samples = factor * factor;
    for (let y = 0; y < outSize; y++) {
      for (let x = 0; x < outSize; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let sy = 0; sy < factor; sy++) {
          for (let sx = 0; sx < factor; sx++) {
            const i = ((y * factor + sy) * this.size + (x * factor + sx)) * 4;
            // Repasse en prémultiplié pour éviter les franges sur fond transparent.
            const pa = this.px[i + 3];
            r += this.px[i] * pa;
            g += this.px[i + 1] * pa;
            b += this.px[i + 2] * pa;
            a += pa;
          }
        }
        a /= samples;
        const o = (y * outSize + x) * 4;
        const unmul = a > 0.0001 ? 1 / (a * samples) : 0;
        out[o] = Math.round(clamp01(r * unmul) * 255);
        out[o + 1] = Math.round(clamp01(g * unmul) * 255);
        out[o + 2] = Math.round(clamp01(b * unmul) * 255);
        out[o + 3] = Math.round(clamp01(a) * 255);
      }
    }
    return { size: outSize, data: out };
  }
}

/* ------------------------------------------------------------------ *
 * Le motif : un iris stylisé cerclé d'un anneau de scan
 * ------------------------------------------------------------------ */

const IRIS_STOPS = [
  [0.0, '#7DF5E4'],
  [0.35, '#22D3EE'],
  [0.72, '#3B82F6'],
  [1.0, '#4338CA'],
];

/**
 * @param {Canvas} c
 * @param {number} scale rayon de l'iris, en fraction de la taille du canvas
 */
function drawEye(c, scale) {
  const s = c.size;
  const cx = s / 2;
  const cy = s / 2;
  const R = s * scale; // rayon de l'iris
  const px = 1 / s;

  // Halo diffus derrière l'iris.
  c.paint((x, y) => {
    const d = Math.hypot(x - cx, y - cy) / R;
    const glow = Math.exp(-Math.pow(d * 1.15, 2.4));
    return glow > 0.002 ? [hex('#1E9BD8'), glow * 0.5] : null;
  });

  // Disque de l'iris : dégradé radial + fibres angulaires.
  c.paint((x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy);
    const t = d / R;
    if (t > 1.02) return null;
    const angle = Math.atan2(dy, dx);
    // Modulation des fibres, atténuée au centre et sur le bord.
    const fibers = Math.sin(angle * 34) * 0.5 + Math.sin(angle * 71 + 1.2) * 0.28;
    const fiberWeight = smoothstep(0.28, 0.95, t) * (1 - smoothstep(0.92, 1.0, t));
    const shade = 1 + fibers * 0.09 * fiberWeight;
    const rgb = gradientAt(IRIS_STOPS, clamp01(t)).map((v) => clamp01((v * shade) / 255) * 255);
    return [rgb, 1 - smoothstep(1.0 - px * 2, 1.0, t)];
  });

  // Anneau limbique sombre : donne de la profondeur au bord de l'iris.
  c.paint((x, y) => {
    const d = Math.hypot(x - cx, y - cy) / R;
    const edge = smoothstep(0.82, 1.0, d) * (1 - smoothstep(0.99, 1.02, d));
    return edge > 0.002 ? [hex('#0A1030'), edge * 0.55] : null;
  });

  // Pupille.
  const pupil = R * 0.4;
  c.paint((x, y) => {
    const d = Math.hypot(x - cx, y - cy);
    const a = 1 - smoothstep(pupil - s * 0.004, pupil + s * 0.004, d);
    return a > 0.002 ? [hex('#04070F'), a] : null;
  });

  // Reflet spéculaire (haut-gauche) : rend l'œil « vivant ».
  c.paint((x, y) => {
    const dx = (x - (cx - R * 0.34)) / (R * 0.3);
    const dy = (y - (cy - R * 0.38)) / (R * 0.22);
    const a = Math.exp(-(dx * dx + dy * dy) * 2.6);
    return a > 0.004 ? [hex('#FFFFFF'), a * 0.55] : null;
  });

  // Petit reflet secondaire (bas-droite).
  c.paint((x, y) => {
    const dx = (x - (cx + R * 0.3)) / (R * 0.16);
    const dy = (y - (cy + R * 0.34)) / (R * 0.13);
    const a = Math.exp(-(dx * dx + dy * dy) * 3);
    return a > 0.004 ? [hex('#BFF6FF'), a * 0.3] : null;
  });

  // Anneau de scan segmenté autour de l'iris.
  const ringR = R * 1.42;
  const ringW = s * 0.021;
  // Quatre arcs de 62°, séparés par des ouvertures de 28°.
  const arcs = [
    [-76, -14],
    [14, 76],
    [104, 166],
    [194, 256],
  ];
  c.paint((x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy);
    const band =
      smoothstep(ringR - ringW, ringR - ringW * 0.55, d) *
      (1 - smoothstep(ringR + ringW * 0.55, ringR + ringW, d));
    if (band < 0.004) return null;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    let cover = 0;
    for (const [a0, a1] of arcs) {
      for (const off of [-360, 0, 360]) {
        const start = a0 + off;
        const end = a1 + off;
        cover = Math.max(
          cover,
          smoothstep(start, start + 3, deg) * (1 - smoothstep(end - 3, end, deg)),
        );
      }
    }
    if (cover < 0.004) return null;
    // L'anneau s'éclaircit vers le haut : suggère un balayage lumineux.
    const sweep = 0.62 + 0.38 * clamp01((cy - dy * 0 - y + ringR) / (ringR * 2));
    return [mix(hex('#22D3EE'), hex('#A5F3FC'), sweep * 0.6), band * cover * 0.95];
  });

  // Deux graduations fines sur l'axe horizontal : signature « instrument optique ».
  const tickR = R * 1.42;
  c.paint((x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy);
    const band =
      smoothstep(tickR - s * 0.05, tickR - s * 0.042, d) *
      (1 - smoothstep(tickR + s * 0.042, tickR + s * 0.05, d));
    if (band < 0.004) return null;
    const deg = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
    const nearAxis = 1 - smoothstep(1.2, 2.4, Math.min(deg, Math.abs(180 - deg)));
    return nearAxis > 0.004 ? [hex('#67E8F9'), band * nearAxis * 0.8] : null;
  });
}

function drawBackground(c) {
  const s = c.size;
  // Dégradé diagonal sombre.
  c.paint((x, y) => {
    const t = clamp01((x / s) * 0.35 + (y / s) * 0.65);
    return [gradientAt([[0, '#101B3D'], [0.55, '#0A1026'], [1, '#04060F']], t), 1];
  });
  // Voile lumineux en haut à gauche.
  c.paint((x, y) => {
    const dx = (x - s * 0.22) / (s * 0.62);
    const dy = (y - s * 0.16) / (s * 0.62);
    const a = Math.exp(-(dx * dx + dy * dy) * 1.6);
    return a > 0.003 ? [hex('#2563EB'), a * 0.28] : null;
  });
}

/* ------------------------------------------------------------------ *
 * Génération des fichiers
 * ------------------------------------------------------------------ */

const SS = 3; // facteur de supersampling

function render(outSize, { background, scale }) {
  const c = new Canvas(outSize * SS);
  if (background) drawBackground(c);
  drawEye(c, scale);
  const { size, data } = c.downsample(SS);
  return encodePNG(size, size, data);
}

const outDir = path.join(__dirname, '..', 'assets', 'images');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ['icon.png', 1024, { background: true, scale: 0.235 }],
  // L'icône adaptative Android est rognée : le motif doit tenir dans le cercle central.
  ['adaptive-icon.png', 1024, { background: false, scale: 0.17 }],
  ['splash-icon.png', 512, { background: false, scale: 0.28 }],
  ['notification-icon.png', 96, { background: false, scale: 0.28 }],
  ['favicon.png', 64, { background: true, scale: 0.235 }],
];

for (const [name, size, opts] of targets) {
  const buf = render(size, opts);
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`✓ ${name} (${size}×${size}, ${(buf.length / 1024).toFixed(1)} Ko)`);
}
