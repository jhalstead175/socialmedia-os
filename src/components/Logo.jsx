import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Share2 } from 'lucide-react';

const LogoIcon = ({ size = 28 }) => (
  <div
    className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <Share2 className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
  </div>
);

export function Logo({
  showWordmark = true,
  className = "",
  size = 28,
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <LogoIcon size={size} />
      {showWordmark && (
        <span className="text-lg font-extrabold tracking-wide text-zinc-100">SoshOps</span>
      )}
    </div>
  );
}

export default Logo;
