/**
 * SoshlOps Logo Component
 *
 * Props:
 * - variant: 'monolith' (S logo) | 'vault' (O logo) | 'vault-scan' (O with animation)
 * - size: 'sm' | 'md' | 'lg' | number (default: 'md')
 * - animated: boolean (uses scan variant if true, only applies to vault)
 * - className: string
 */

import React from 'react';
import SoMonolith from '@/assets/brand/so-s-monolith.svg';
import SoVault from '@/assets/brand/so-o-vault.svg';
import SoVaultScan from '@/assets/brand/so-o-vault-scan.svg';

interface LogoProps {
  variant?: 'monolith' | 'vault' | 'vault-scan';
  size?: 'sm' | 'md' | 'lg' | number;
  animated?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 48
};

export default function Logo({
  variant = 'monolith',
  size = 'md',
  animated = false,
  className = ''
}: LogoProps) {
  // Determine which SVG to use
  let src = SoMonolith;
  if (variant === 'vault') {
    src = animated ? SoVaultScan : SoVault;
  } else if (variant === 'vault-scan') {
    src = SoVaultScan;
  } else if (variant === 'monolith') {
    src = SoMonolith; // Monolith has built-in animation
  }

  const alt = variant === 'monolith' ? 'SoshlOps' : 'SO';
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size];

  return (
    <img
      src={src}
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      draggable={false}
      className={className}
      style={{ display: 'block' }}
    />
  );
}
