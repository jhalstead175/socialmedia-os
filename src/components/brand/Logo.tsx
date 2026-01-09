/**
 * SoshlOps Logo Component
 *
 * Usage:
 * - Static display only
 * - For animated version, use LogoAnimated.tsx
 *
 * Props:
 * - variant: 'monolith' (default) | 'vault'
 * - size: number (default: 32)
 */

import React from 'react';
import SoMonolith from '@/assets/brand/so-s-monolith.svg';
import SoVault from '@/assets/brand/so-o-vault.svg';

interface LogoProps {
  variant?: 'monolith' | 'vault';
  size?: number;
  className?: string;
}

export default function Logo({ variant = 'monolith', size = 32, className = '' }: LogoProps) {
  const src = variant === 'monolith' ? SoMonolith : SoVault;
  const alt = variant === 'monolith' ? 'SoshlOps' : 'SO';

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{ display: 'block' }}
    />
  );
}
