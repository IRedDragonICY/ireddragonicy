'use client';

// Deterministic PRNG for repeatable visuals
export function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return function random() {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

// Gaussian noise with transparency awareness
export function generateTransparencyAwareNoise(
  width: number,
  height: number,
  imageData: ImageData | null,
  strength: number = 1.0,
  seed?: number,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const noiseData = ctx.createImageData(width, height);
  const data = noiseData.data;

  const rnd = seed !== undefined ? createSeededRandom(seed) : Math.random;
  const gaussian = () => {
    const u1 = rnd();
    const u2 = rnd();
    return Math.sqrt(-2 * Math.log(u1 || 1e-6)) * Math.cos(2 * Math.PI * u2);
  };

  for (let i = 0; i < data.length; i += 4) {
    const alpha = imageData ? imageData.data[i + 3] / 255 : 1;
    const noise = gaussian() * strength * 128 + 128;
    const finalNoise = noise * alpha;
    data[i] = finalNoise;
    data[i + 1] = finalNoise;
    data[i + 2] = finalNoise;
    data[i + 3] = alpha * 255;
  }

  ctx.putImageData(noiseData, 0, 0);
  return canvas.toDataURL();
}

// Basic grayscale helper
function toGrayscale(r: number, g: number, b: number) {
  // perceptual luminance
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// SOBEL edge detection approximation -> dataURL
export function createSobelEdgeDataURL(img: HTMLImageElement, size: number, threshold: number = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  const { data } = image;

  const gray = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      gray[y * size + x] = toGrayscale(data[i], data[i + 1], data[i + 2]);
    }
  }

  const gxKernel = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1,
  ];
  const gyKernel = [
    -1, -2, -1,
     0,  0,  0,
     1,  2,  1,
  ];

  const out = ctx.createImageData(size, size);
  const outData = out.data;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      let gx = 0;
      let gy = 0;
      let k = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const v = gray[(y + ky) * size + (x + kx)];
          gx += v * gxKernel[k];
          gy += v * gyKernel[k];
          k++;
        }
      }
      const mag = Math.sqrt(gx * gx + gy * gy);
      const edge = mag > threshold ? 255 : 0;
      const i = (y * size + x) * 4;
      outData[i] = edge;
      outData[i + 1] = edge;
      outData[i + 2] = edge;
      outData[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas.toDataURL();
}

// Fake depth map using vignette + luminance heuristic
export function createDepthMapDataURL(img: HTMLImageElement, size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  const { data } = image;

  const cx = size / 2;
  const cy = size / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const lum = toGrayscale(data[i], data[i + 1], data[i + 2]) / 255;
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist; // 0 center -> 1 corners
      // Foreground emphasis in center, mix with luminance
      const depth = (1 - d) * 0.7 + (1 - lum) * 0.3;
      const v = Math.max(0, Math.min(1, depth)) * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

// Stylized OpenPose-like stick figure overlay, seeded
export function createOpenPoseOverlayDataURL(size: number, seed: number) {
  const rnd = createSeededRandom(seed);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, Math.round(size / 120));

  // Anchor in the central region
  const cx = size * (0.35 + rnd() * 0.3);
  const cy = size * (0.35 + rnd() * 0.3);

  const limb = (x1: number, y1: number, x2: number, y2: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  const joint = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(3, size / 80), 0, Math.PI * 2);
    ctx.fill();
  };

  // Generate a plausible human pose with noise
  const shoulderSpan = size * (0.12 + rnd() * 0.05);
  const hipSpan = size * (0.1 + rnd() * 0.05);
  const head = { x: cx, y: cy - size * (0.12 + rnd() * 0.05) };
  const neck = { x: cx, y: cy - size * (0.06 + rnd() * 0.03) };
  const ls = { x: cx - shoulderSpan, y: neck.y + size * 0.01 };
  const rs = { x: cx + shoulderSpan, y: neck.y + size * 0.01 };
  const lh = { x: cx - hipSpan, y: cy + size * (0.08 + rnd() * 0.04) };
  const rh = { x: cx + hipSpan, y: cy + size * (0.08 + rnd() * 0.04) };

  const la = { x: ls.x - size * (0.03 + rnd() * 0.07), y: ls.y + size * (0.07 + rnd() * 0.06) };
  const ra = { x: rs.x + size * (0.03 + rnd() * 0.07), y: rs.y + size * (0.07 + rnd() * 0.06) };
  const ll = { x: lh.x - size * (0.02 + rnd() * 0.05), y: lh.y + size * (0.12 + rnd() * 0.07) };
  const rl = { x: rh.x + size * (0.02 + rnd() * 0.05), y: rh.y + size * (0.12 + rnd() * 0.07) };

  // Bones
  limb(head.x, head.y, neck.x, neck.y, '#22d3ee');
  limb(neck.x, neck.y, ls.x, ls.y, '#22d3ee');
  limb(neck.x, neck.y, rs.x, rs.y, '#22d3ee');
  limb(ls.x, ls.y, la.x, la.y, '#60a5fa');
  limb(rs.x, rs.y, ra.x, ra.y, '#60a5fa');
  limb(neck.x, neck.y, lh.x, lh.y, '#a78bfa');
  limb(neck.x, neck.y, rh.x, rh.y, '#a78bfa');
  limb(lh.x, lh.y, ll.x, ll.y, '#f472b6');
  limb(rh.x, rh.y, rl.x, rl.y, '#f472b6');

  // Joints
  [head, neck, ls, rs, lh, rh, la, ra, ll, rl].forEach((p, i) => {
    const colors = ['#22d3ee', '#22d3ee', '#60a5fa', '#60a5fa', '#a78bfa', '#a78bfa', '#f472b6', '#f472b6', '#34d399', '#34d399'];
    joint(p.x, p.y, colors[i] || '#22d3ee');
  });

  return canvas.toDataURL();
}


