/**
 * Favicon Generator Script
 *
 * Generates favicon files (ICO and PNG) from an SVG source.
 *
 * Usage:
 *   node scripts/generate-favicons.js
 *
 * Requirements:
 *   npm install sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source SVG - SoshOps logo (Share2 icon in gradient box)
const logoSVG = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="url(#grad)"/>
  <path d="M256 358.4c-5.3 0-10.6-2-14.6-6.1l-128-128c-8.1-8.1-8.1-21.2 0-29.3 8.1-8.1 21.2-8.1 29.3 0l113.3 113.4 113.4-113.4c8.1-8.1 21.2-8.1 29.3 0 8.1 8.1 8.1 21.2 0 29.3l-128 128c-4 4.1-9.3 6.1-14.7 6.1z" fill="#ffffff" transform="rotate(-45 256 256)" opacity="0.95"/>
  <circle cx="160" cy="256" r="32" fill="#ffffff" opacity="0.95"/>
  <circle cx="352" cy="256" r="32" fill="#ffffff" opacity="0.95"/>
</svg>`;

const outputDir = path.join(__dirname, '../public/favicons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateFavicons() {
  console.log('Generating favicons...\n');

  try {
    const svgBuffer = Buffer.from(logoSVG);

    // Generate PNG files
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' }
    ];

    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate ICO file (multi-resolution: 16x16, 32x32, 48x48)
    const icoSizes = [16, 32, 48];
    const icoBuffers = await Promise.all(
      icoSizes.map(size =>
        sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );

    // Create ICO file manually (simple ICO format)
    const icoPath = path.join(outputDir, 'favicon.ico');
    await createIco(icoBuffers, icoSizes, icoPath);
    console.log(`✓ Generated favicon.ico (16x16, 32x32, 48x48)`);

    // Generate site.webmanifest
    const manifest = {
      name: 'SoshOps',
      short_name: 'SoshOps',
      icons: [
        {
          src: '/favicons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/favicons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: '#0b1020',
      background_color: '#0b1020',
      display: 'standalone'
    };

    const manifestPath = path.join(outputDir, 'site.webmanifest');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✓ Generated site.webmanifest`);

    console.log('\n✅ All favicons generated successfully!');
    console.log(`📁 Output directory: ${outputDir}`);
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

/**
 * Create ICO file from PNG buffers
 * ICO format spec: https://en.wikipedia.org/wiki/ICO_(file_format)
 */
async function createIco(pngBuffers, sizes, outputPath) {
  const iconCount = pngBuffers.length;

  // ICO header (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);        // Reserved (must be 0)
  header.writeUInt16LE(1, 2);        // Image type (1 = ICO)
  header.writeUInt16LE(iconCount, 4); // Number of images

  // Icon directory entries (16 bytes each)
  const entries = [];
  let imageOffset = 6 + (iconCount * 16);

  for (let i = 0; i < iconCount; i++) {
    const entry = Buffer.alloc(16);
    const size = sizes[i];
    const imageSize = pngBuffers[i].length;

    entry.writeUInt8(size === 256 ? 0 : size, 0);  // Width
    entry.writeUInt8(size === 256 ? 0 : size, 1);  // Height
    entry.writeUInt8(0, 2);                         // Color palette
    entry.writeUInt8(0, 3);                         // Reserved
    entry.writeUInt16LE(1, 4);                      // Color planes
    entry.writeUInt16LE(32, 6);                     // Bits per pixel
    entry.writeUInt32LE(imageSize, 8);              // Image size
    entry.writeUInt32LE(imageOffset, 12);           // Image offset

    entries.push(entry);
    imageOffset += imageSize;
  }

  // Combine all parts
  const icoBuffer = Buffer.concat([
    header,
    ...entries,
    ...pngBuffers
  ]);

  fs.writeFileSync(outputPath, icoBuffer);
}

// Run the generator
generateFavicons();
