import React, { useMemo, useState } from 'react';

interface SakaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'monochrome' | 'badge';
  id?: string;
}

export const SAKA_LOGO_URL = '/saka_logo.png';

export const SAKA_LOGO_DRIVE_DIRECT_URL =
  'https://lh3.googleusercontent.com/d/1K135viubYa--7b6SvtnbLCGG-lMN-Ayc';

export const SAKA_CARD_BG_DRIVE_DIRECT_URL =
  'https://lh3.googleusercontent.com/d/1hJWUUBQusR9ZKFrpK2TpQAdMb750CazZ';

export const SAKA_CARD_BG_FALLBACK_URL =
  'https://drive.google.com/uc?export=view&id=1hJWUUBQusR9ZKFrpK2TpQAdMb750CazZ';

/**
 * Extract a Google Drive file ID from common Drive URL formats.
 */
function extractDriveFileId(url?: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  if (!trimmed) return '';

  const match =
    trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(
      /googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
    );

  return match?.[1] || '';
}

/**
 * Format any Google Drive share link into a direct image URL.
 *
 * Data URLs and blob URLs are returned untouched.
 */
export function formatDriveImageUrl(url?: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  if (
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const fileId = extractDriveFileId(trimmed);

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}

/**
 * Return the Google Drive "uc" fallback URL.
 *
 * This is useful when googleusercontent.com is unavailable
 * or blocked by the browser/network.
 */
export function getDriveDirectFallbackUrl(
  url?: string
): string {
  if (!url) return '';

  const trimmed = url.trim();

  if (
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const fileId = extractDriveFileId(trimmed);

  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return trimmed;
}

/**
 * Return a usable avatar URL.
 *
 * If no avatar is available, use a neutral gender-based fallback.
 */
export function getValidAvatarUrl(
  url?: string,
  gender?: string
): string {
  const defaultAvatar =
    gender === 'PEREMPUAN'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

  if (!url || !url.trim()) {
    return defaultAvatar;
  }

  const formatted = formatDriveImageUrl(url);

  return formatted || defaultAvatar;
}

/**
 * Inline SVG fallback.
 *
 * This is intentionally simple so the application still has
 * a recognizable identity when all remote/local image sources fail.
 */
const FallbackLogo: React.FC<{
  size: string;
  className?: string;
}> = ({ size, className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo Saka Pariwisata"
    >
      <path
        d="M100 8L188 72L154 184H46L12 72L100 8Z"
        fill="#1e0842"
        stroke="#2e1065"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M100 16L178 74L148 174H52L22 74L100 16Z"
        fill="#9333ea"
      />

      <path
        d="M100 38L136 65L123 111H77L64 65L100 38Z"
        fill="#ffffff"
        opacity="0.12"
      />

      <text
        x="100"
        y="157"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="900"
        fontSize="13"
        letterSpacing="0.8"
      >
        SAKA
      </text>

      <text
        x="100"
        y="172"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="700"
        fontSize="7"
        letterSpacing="0.8"
      >
        PARIWISATA
      </text>
    </svg>
  );
};

export const SakaLogo: React.FC<SakaLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  variant = 'full',
  id = 'saka-logo',
}) => {
  const dimension =
    typeof size === 'number' ? `${size}px` : size;

  /**
   * Image fallback sequence:
   *
   * 1. Local application asset
   * 2. Googleusercontent
   * 3. Google Drive UC
   * 4. Inline SVG
   */
  const imageSources = useMemo(() => {
    const sources = [
      SAKA_LOGO_URL,
      SAKA_LOGO_DRIVE_DIRECT_URL,
      getDriveDirectFallbackUrl(SAKA_LOGO_DRIVE_DIRECT_URL),
    ];

    return [...new Set(sources.filter(Boolean))];
  }, []);

  const [sourceIndex, setSourceIndex] = useState(0);

  const hasImageError =
    sourceIndex >= imageSources.length;

  const handleImageError = () => {
    setSourceIndex((current) => current + 1);
  };

  const isMonochrome = variant === 'monochrome';
  const isBadge = variant === 'badge';

  const logoClasses = [
    'shrink-0',
    'object-contain',
    'select-none',
    'transition-opacity',
    isMonochrome ? 'grayscale opacity-80' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [
    'inline-flex',
    'items-center',
    'gap-2.5',
    'select-none',
    isBadge
      ? 'rounded-2xl border border-purple-500/20 bg-purple-950/30 px-2.5 py-2'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const shouldShowText =
    showText && variant !== 'icon';

  return (
    <div
      id={id}
      className={wrapperClasses}
      style={{ minWidth: 'fit-content' }}
    >
      {hasImageError ? (
        <FallbackLogo
          size={dimension}
          className={
            isMonochrome
              ? 'grayscale opacity-80'
              : ''
          }
        />
      ) : (
        <img
          src={imageSources[sourceIndex]}
          alt={
            shouldShowText
              ? ''
              : 'Logo Saka Pariwisata'
          }
          aria-hidden={shouldShowText ? true : undefined}
          width={typeof size === 'number' ? size : undefined}
          height={typeof size === 'number' ? size : undefined}
          style={{
            width: dimension,
            height: dimension,
          }}
          className={logoClasses}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
          onError={handleImageError}
        />
      )}

      {shouldShowText && (
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase font-heading text-white whitespace-nowrap">
            Saka{' '}
            <span className="text-purple-300">
              Pariwisata
            </span>
          </span>

          <span className="text-[10px] text-purple-200/80 font-medium tracking-wider uppercase whitespace-nowrap">
            Kwartir Nasional
          </span>
        </div>
      )}
    </div>
  );
};

export default SakaLogo;
