/**
 * Generate OG Image from SVG
 *
 * This script converts the og-image.svg to a PNG file.
 * Requires: npm install --save-dev sharp
 *
 * Usage: node scripts/generate-og-image.js
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, '../public/og-image.svg');
const pngPath = join(__dirname, '../public/og-image.png');

async function generateOGImage() {
  try {
    const svgBuffer = readFileSync(svgPath);

    await sharp(svgBuffer)
      .resize(1200, 630)
      .png()
      .toFile(pngPath);

    console.log('✓ OG image generated successfully at public/og-image.png');
  } catch (error) {
    console.error('Error generating OG image:', error.message);
    console.log('\nAlternative method:');
    console.log('1. Open og-preview.html in your browser');
    console.log('2. Right-click the image → Inspect Element');
    console.log('3. Right-click .og-image div in DevTools');
    console.log('4. Choose "Capture node screenshot"');
    console.log('5. Save as public/og-image.png');
    process.exit(1);
  }
}

generateOGImage();
