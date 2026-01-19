#!/usr/bin/env python3
"""
Favicon Generator Script (Python)

Generates favicon files (ICO and PNG) from an SVG source.

Usage:
    python3 scripts/generate-favicons.py

Requirements:
    pip install cairosvg pillow
"""

import os
import json
from pathlib import Path
from io import BytesIO

try:
    import cairosvg
    from PIL import Image
except ImportError:
    print("❌ Missing dependencies. Install with:")
    print("   pip install cairosvg pillow")
    exit(1)

# Source SVG - SoshOps logo (Share2 icon in gradient box)
LOGO_SVG = """<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
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
</svg>"""

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "favicons"


def svg_to_png(svg_string, size):
    """Convert SVG string to PNG at specified size."""
    png_data = cairosvg.svg2png(
        bytestring=svg_string.encode('utf-8'),
        output_width=size,
        output_height=size
    )
    return Image.open(BytesIO(png_data))


def generate_favicons():
    """Generate all favicon files."""
    print("Generating favicons...\n")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # PNG sizes to generate
    sizes = [
        (16, "favicon-16x16.png"),
        (32, "favicon-32x32.png"),
        (180, "apple-touch-icon.png"),
        (192, "android-chrome-192x192.png"),
        (512, "android-chrome-512x512.png"),
    ]

    # Generate PNG files
    for size, filename in sizes:
        output_path = OUTPUT_DIR / filename
        img = svg_to_png(LOGO_SVG, size)
        img.save(output_path, "PNG")
        print(f"✓ Generated {filename} ({size}x{size})")

    # Generate ICO file (multi-resolution)
    ico_sizes = [16, 32, 48]
    ico_images = [svg_to_png(LOGO_SVG, size) for size in ico_sizes]
    ico_path = OUTPUT_DIR / "favicon.ico"
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=[(size, size) for size in ico_sizes],
        append_images=ico_images[1:]
    )
    print(f"✓ Generated favicon.ico ({', '.join(f'{s}x{s}' for s in ico_sizes)})")

    # Generate site.webmanifest
    manifest = {
        "name": "SoshOps",
        "short_name": "SoshOps",
        "icons": [
            {
                "src": "/favicons/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/favicons/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ],
        "theme_color": "#0b1020",
        "background_color": "#0b1020",
        "display": "standalone"
    }

    manifest_path = OUTPUT_DIR / "site.webmanifest"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print("✓ Generated site.webmanifest")

    print(f"\n✅ All favicons generated successfully!")
    print(f"📁 Output directory: {OUTPUT_DIR}")


if __name__ == "__main__":
    try:
        generate_favicons()
    except Exception as e:
        print(f"❌ Error generating favicons: {e}")
        exit(1)
