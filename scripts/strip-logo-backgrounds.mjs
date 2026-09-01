import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoDir = path.resolve(__dirname, "../assets/logo");
const files = [
  "amazon.png",
  "amazon-com.png",
  "meesho.png",
  "flipkart.png",
  "shopify.png",
  "instagram.png",
];

function sample(data, width, height, x, y) {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

function colorDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

function isBackgroundPixel(r, g, b, refs, tolerance) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  if (min >= 235 && sat <= 28) return true;
  if (min >= 220 && sat <= 18) return true;
  for (const ref of refs) {
    if (colorDistance([r, g, b], ref) <= tolerance) return true;
  }
  return false;
}

function stripBackground(imageData) {
  const { data, width, height } = imageData;
  const refs = [
    sample(data, width, height, 0, 0),
    sample(data, width, height, width - 1, 0),
    sample(data, width, height, 0, height - 1),
    sample(data, width, height, width - 1, height - 1),
  ].map(([r, g, b]) => [r, g, b]);

  const visited = new Uint8Array(width * height);
  const queue = [];

  function push(x, y) {
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (!isBackgroundPixel(r, g, b, refs, 42)) return;
    visited[idx] = 1;
    queue.push(idx);
  }

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    const i = idx * 4;
    data[i + 3] = 0;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (data[i + 3] === 0) continue;
    if (isBackgroundPixel(r, g, b, refs, 34)) {
      data[i + 3] = Math.min(data[i + 3], 48);
    }
  }

  return imageData;
}

for (const file of files) {
  const filePath = path.join(logoDir, file);
  const img = await loadImage(filePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  stripBackground(imageData);
  ctx.putImageData(imageData, 0, 0);
  fs.writeFileSync(filePath, await canvas.encode("png"));
  const corner = sample(imageData.data, img.width, img.height, 0, 0);
  console.log("Processed:", file, "corner alpha:", corner[3]);
}
