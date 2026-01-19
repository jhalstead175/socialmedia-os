# Favicon Generator Scripts

This directory contains scripts to generate all required favicon files from an SVG source.

## Generated Files

The scripts generate the following files in `/public/favicons/`:

- `favicon.ico` - Multi-resolution ICO (16x16, 32x32, 48x48)
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG
- `apple-touch-icon.png` - 180x180 PNG (iOS)
- `android-chrome-192x192.png` - 192x192 PNG (Android)
- `android-chrome-512x512.png` - 512x512 PNG (Android)
- `site.webmanifest` - Web app manifest

## Usage

### Option 1: Node.js Script (Recommended)

**Requirements:**
```bash
npm install sharp
```

**Run:**
```bash
node scripts/generate-favicons.js
```

Or use the npm script:
```bash
npm run generate:favicons
```

### Option 2: Python Script

**Requirements:**
```bash
pip install cairosvg pillow
```

**Run:**
```bash
python3 scripts/generate-favicons.py
```

Make executable (optional):
```bash
chmod +x scripts/generate-favicons.py
./scripts/generate-favicons.py
```

## Customizing the Logo

To customize the favicon logo, edit the `LOGO_SVG` constant in either script:

**Node.js:** `scripts/generate-favicons.js` (line ~16)
**Python:** `scripts/generate-favicons.py` (line ~19)

The current logo is the SoshOps brand icon (Share2 icon in a gradient box matching the app's brand colors).

## Output

All generated files are placed in:
```
public/favicons/
```

These are referenced in `index.html`:
```html
<link rel="icon" type="image/x-icon" href="/favicons/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
<link rel="manifest" href="/favicons/site.webmanifest" />
```
