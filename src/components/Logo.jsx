import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const RezemaiIcon = ({ size = 28 }) => (
  <img 
    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68a2540fe86af19a5c9f80f8/f7b43a2b8_logocircle.jpg" 
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