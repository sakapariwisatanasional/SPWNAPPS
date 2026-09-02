import React, { useState } from 'react';

interface SakaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'monochrome' | 'badge';
  id?: string;
}

export const SAKA_LOGO_URL = '/saka_logo.png';
export const SAKA_LOGO_DRIVE_DIRECT_URL = 'https://lh3.googleusercontent.com/d/1K135viubYa--7b6SvtnbLCGG-lMN-Ayc';
export const SAKA_CARD_BG_DRIVE_DIRECT_URL = 'https://lh3.googleusercontent.com/d/1hJWUUBQusR9ZKFrpK2TpQAdMb750CazZ';
export const SAKA_CARD_BG_FALLBACK_URL = 'https://drive.google.com/uc?export=view&id=1hJWUUBQusR9ZKFrpK2TpQAdMb750CazZ';

/**
 * Format any Google Drive share link into a direct downloadable image link
 */
export function formatDriveImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

/**
 * Fallback direct Google Drive uc download URL in case googleusercontent is blocked
 */
export function getDriveDirectFallbackUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return trimmed;
}

/**
 * Return a guaranteed valid avatar URL for a member
 */
export function getValidAvatarUrl(url?: string, gender?: string): string {
  const defaultAvatar = gender === 'PEREMPUAN'
    ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
  
  if (!url || !url.trim()) return defaultAvatar;
  const formatted = formatDriveImageUrl(url.trim());
  return formatted || defaultAvatar;
}

export const SakaLogo: React.FC<SakaLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  variant = 'full',
  id = 'saka-logo'
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  const [imgSrc, setImgSrc] = useState<string>(SAKA_LOGO_URL);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleImageError = () => {
    if (imgSrc === SAKA_LOGO_URL) {
      setImgSrc(SAKA_LOGO_DRIVE_DIRECT_URL);
    } else {
      setHasError(true);
    }
  };

  return (
    <div 
      id={id} 
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      style={{ minWidth: 'fit-content' }}
    >
      {!hasError ? (
        <img
          src={imgSrc}
          alt="Logo Saka Pariwisata"
          style={{ width: dimension, height: dimension }}
          className="object-contain flex-shrink-0 drop-shadow-md transition-transform hover:scale-105"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        <svg
          viewBox="0 0 200 200"
          style={{ width: dimension, height: dimension }}
          className="flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 100 8 L 188 72 L 154 184 L 46 184 L 12 72 Z"
            fill="#1e0842"
            stroke="#2e1065"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M 100 16 L 178 74 L 148 174 L 52 174 L 22 74 Z"
            fill="#9333ea"
          />
          <text
            x="100"
            y="164"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="12"
          >
            SAKA PARIWISATA
          </text>
        </svg>
      )}

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase font-heading text-white">
            Saka <span className="text-purple-300">Pariwisata</span>
          </span>
          <span className="text-[10px] text-purple-200/80 font-medium tracking-wider uppercase">
            Kwartir Nasional
          </span>
        </div>
      )}
    </div>
  );
};
