# SoshlOps Brand Assets (LOCKED)

**Status**: Final and authoritative. Do not modify.

---

## Logo Variants

### 1. S Monolith (`so-s-monolith.svg`)

**Primary mark**. Use everywhere.

- App icon
- Favicon
- Wordmark companion
- Navigation
- Marketing

**Geometry**: Blocky S letterform with horizontal cut mask
**Animation**: 160ms cut reveal (scaleY 0→1)
**Color**: Black (#000000)
**Aspect**: 1:1 square

### 2. O Vault (`so-o-vault.svg`)

**Secondary system mark**. Use for:

- Security contexts
- Auth screens
- Vault/storage references
- System status indicators

**Geometry**: Thick circular ring with vertical cut
**Animation**: None (static)
**Color**: Black (#000000)
**Aspect**: 1:1 square

### 3. O Vault Scan (`so-o-vault-scan.svg`)

**Animated variant**. Use sparingly for:

- Loading states
- Connection verification
- OAuth flows
- Data sync indicators

**Geometry**: Same as O Vault
**Animation**: 360ms horizontal scan (translateX 0→400px)
**Trigger**: On mount only, no loop
**Color**: Black (#000000)
**Aspect**: 1:1 square

---

## Rules (IMMUTABLE)

### ✅ Allowed

- Use SVGs as-is via `<img>` tag
- Animate the **cut/scan masks only**
- Scale uniformly (maintain 1:1 aspect)
- Display on light backgrounds only

### ❌ Forbidden

- Redesign or reinterpret the geometry
- Add gradients, glow, blur, or shadows
- Animate the letterforms themselves
- Use rounded corners or soft edges
- Display on dark backgrounds (invert if needed)
- Loop animations
- Combine with other graphics

---

## Usage in React

### Static Logo (Recommended)

```tsx
import Logo from '@/components/brand/Logo';

<Logo variant="monolith" size={32} />
<Logo variant="vault" size={48} />
```

### Direct Import (Advanced)

```tsx
import { SoMonolith, SoVault } from '@/assets/brand';

<img src={SoMonolith} alt="SoshlOps" width={32} height={32} />
```

### Animated (Inline SVG Only)

For state transitions where animation is needed:

```tsx
// Inline the SVG markup and attach CSS
<svg width="32" height="32" viewBox="0 0 1000 1000">
  {/* Full SVG content from so-s-monolith.svg */}
</svg>
```

**Where to use animated versions**:
- Splash screens
- Auth success states
- Connection establishment
- First-time onboarding

**Where NOT to use**:
- Navigation bars (static only)
- Repeated UI elements
- Non-transitional contexts

---

## Export Sizes

### Favicon

Generate from `so-s-monolith.svg`:

- `favicon.ico`: 16x16, 32x32, 48x48
- `favicon.svg`: Vector (preferred)
- `apple-touch-icon.png`: 180x180
- `android-chrome-192x192.png`: 192x192
- `android-chrome-512x512.png`: 512x512

### App Icon

Use `so-s-monolith.svg` as source:

- iOS: 1024x1024 PNG
- Android: 512x512 PNG
- Web: SVG (vector)

---

## Color Specifications

**Primary Logo Color**: `#000000` (pure black)
**Background**: `#FFFFFF` (pure white) or light neutrals
**DO NOT** use on dark backgrounds without inversion

If dark mode is required:
```css
@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert(1);
  }
}
```

---

## File Locations

```
src/
  assets/
    brand/
      so-s-monolith.svg       (primary)
      so-o-vault.svg          (secondary)
      so-o-vault-scan.svg     (animated)
      index.ts                (exports)
  components/
    brand/
      Logo.tsx                (static component)
```

---

## Integration Checklist

- [ ] SVGs committed to `src/assets/brand/`
- [ ] Index file created for clean imports
- [ ] Logo component created
- [ ] Favicon generated from S Monolith
- [ ] OG image uses S Monolith or wordmark
- [ ] No gradients or effects applied
- [ ] Animations used only at state transitions

---

## Handoff Notes

**For Designers**:
- These are final. Do not iterate.
- Use only for placement mockups.
- Do not export variations.

**For Developers**:
- Import from `@/assets/brand` or `@/components/brand/Logo`
- Never modify the source SVGs
- Animation is opt-in, not default

**For Marketing**:
- S Monolith is the only public-facing icon
- O Vault is for system/security contexts only
- Use wordmark "SoshlOps" alongside S Monolith

---

**Last Updated**: January 2026
**Owner**: SoshlOps Brand (locked)
