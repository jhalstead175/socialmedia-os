import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const RezemaiIcon = ({ size = 28 }) => (
  <img 
    src="c:/Sites2/rezemai/public/og-rezemai.png"
    alt="REZEMAI Logo" 
    style={{ width: size, height: size }}
    className="object-cover rounded-full"
  />
);

export function RezemaiLogo({
  showWordmark = true,
  className = "",
  size = 28,
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <RezemaiIcon size={size} />
      {showWordmark && (
        <span className="text-lg font-extrabold tracking-widest text-zinc-100">REZEMAI</span>
      )}
    </div>
  );
}

export default RezemaiLogo;