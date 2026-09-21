/**
 * Temporary script — generates app icon assets from Insight-Real-Logo.png
 * Usage: node scripts/generate-app-icons.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'public', 'Insight-Real-Logo.png');

const targets = [
  { out: path.join(root, 'assets', 'icon.png'), size: 1024 },
  { out: path.join(root, 'assets', 'adaptive-icon.png'), size: 1024 },
  { out: path.join(root, 'assets', 'favicon.png'), size: 48 },
];

const meta = await sharp(source).metadata();
console.log(`Source: ${source}`);
console.log(`Dimensions: ${meta.width}x${meta.height}, format: ${meta.format}`);

for (const { out, size } of targets) {
  await sharp(source)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 },
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(out);

  const info = await sharp(out).metadata();
  console.log(`✓ ${path.relative(root, out)} → ${info.width}x${info.height}`);
}

console.log('Done.');
