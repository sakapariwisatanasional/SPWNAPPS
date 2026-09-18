import React, { useMemo } from 'react';

interface BarcodeProps {
  value: string;
  className?: string;
  width?: number | string;
  height?: number;
  showText?: boolean;
  barColor?: string;
  bgColor?: string;
}

/**
 * Code 128 barcode patterns.
 *
 * Code 128B is used here because it supports the printable ASCII
 * character range (32–126), which is suitable for IDs, codes,
 * document numbers, and other SPWNAPPS identifiers.
 */
const CODE128_PATTERNS = [
  '11011001100',
  '11001101100',
  '11001100110',
  '10010011000',
  '10010001100',
  '10001001100',
  '10011001000',
  '10011000100',
  '10001100100',
  '11001001000',
  '11001000100',
  '11000100100',
  '10110011100',
  '10011011100',
  '10011001110',
  '10111001100',
  '10011101100',
  '10011100110',
  '11001110010',
  '11001011100',
  '11001001110',
  '11011100100',
  '11001110100',
  '11101101110',
  '11101001100',
  '11100101100',
  '11100100110',
  '11101100100',
  '11100110100',
  '11100110010',
  '11011011000',
  '11011000110',
  '11000110110',
  '10100011000',
  '10001011000',
  '10001000110',
  '10110001000',
  '10001101000',
  '10001100010',
  '11010001000',
  '11000101000',
  '11000100010',
  '10110111000',
  '10110001110',
  '10001101110',
  '10111011000',
  '10111000110',
  '10001110110',
  '11101110110',
  '11010001110',
  '11000101110',
  '11011101000',
  '11011100010',
  '11011101110',
  '11101011000',
  '11101000110',
  '11100010110',
  '11101101000',
  '11101100010',
  '11100011010',
  '11101111010',
  '11001000010',
  '11110001010',
  '10100110000',
  '10100001100',
  '10010110000',
  '10010000110',
  '10000101100',
  '10000100110',
  '10110010000',
  '10110000100',
  '10011010000',
  '10011000010',
  '10000110100',
  '10000110010',
  '11000010010',
  '11001010000',
  '11110111010',
  '11000010100',
  '10001111010',
  '10100111100',
  '10010111100',
  '10010011110',
  '10111100100',
  '10011110100',
  '10011110010',
  '11110100100',
  '11110010100',
  '11110010010',
  '11011011110',
  '11011110110',
  '11110110110',
  '10101111000',
  '10100011110',
  '10001011110',
  '10111101000',
  '10111100010',
  '11110101000',
  '11110100010',
  '10111011110',
  '10111101110',
  '11101011110',
  '11110101110',
  '11010000100',
  '11010010000',
  '11010011100',
  '1100011101011',
] as const;

const CODE128_START_B = 104;
const CODE128_STOP = 106;
const FALLBACK_VALUE = 'SAKA-2026';

/**
 * Code 128B only supports printable ASCII characters.
 * Unsupported characters are replaced with '?' so that
 * the barcode always remains valid.
 */
function sanitizeBarcodeValue(value: string): string {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return FALLBACK_VALUE;
  }

  return Array.from(normalized)
    .map((character) => {
      const code = character.charCodeAt(0);

      return code >= 32 && code <= 126 ? character : '?';
    })
    .join('');
}

/**
 * Encode a string using Code 128B.
 */
function encodeCode128B(value: string): string {
  const input = sanitizeBarcodeValue(value);

  const values = Array.from(input, (character) => {
    return character.charCodeAt(0) - 32;
  });

  const checksum =
    (
      CODE128_START_B +
      values.reduce(
        (sum, value, index) => sum + value * (index + 1),
        0
      )
    ) % 103;

  const codes = [
    CODE128_START_B,
    ...values,
    checksum,
    CODE128_STOP,
  ];

  return codes
    .map((code) => CODE128_PATTERNS[code] ?? '')
    .join('');
}

function normalizeHeight(height: number): number {
  if (!Number.isFinite(height) || height <= 0) {
    return 32;
  }

  return Math.max(12, Math.min(height, 240));
}

function normalizeWidth(width: number | string): string {
  if (typeof width === 'number') {
    if (!Number.isFinite(width) || width <= 0) {
      return '100%';
    }

    return `${width}px`;
  }

  const normalized = String(width).trim();

  return normalized || '100%';
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  className = '',
  width = '100%',
  height = 32,
  showText = false,
  barColor = '#000000',
  bgColor = 'transparent',
}) => {
  const sanitizedValue = useMemo(
    () => sanitizeBarcodeValue(value),
    [value]
  );

  const encoded = useMemo(
    () => encodeCode128B(sanitizedValue),
    [sanitizedValue]
  );

  const normalizedHeight = useMemo(
    () => normalizeHeight(height),
    [height]
  );

  const normalizedWidth = useMemo(
    () => normalizeWidth(width),
    [width]
  );

  const barcodeLabel = `Barcode: ${sanitizedValue}`;

  return (
    <div
      className={[
        'inline-flex',
        'flex-col',
        'items-center',
        'select-none',
        'align-middle',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg
        viewBox={`0 0 ${encoded.length} ${normalizedHeight}`}
        preserveAspectRatio="none"
        style={{
          width: normalizedWidth,
          height: `${normalizedHeight}px`,
        }}
        className="block overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        role="img"
        aria-label={barcodeLabel}
      >
        <title>{barcodeLabel}</title>

        {bgColor !== 'transparent' && (
          <rect
            x="0"
            y="0"
            width={encoded.length}
            height={normalizedHeight}
            fill={bgColor}
          />
        )}

        {Array.from(encoded).map((bit, index) => {
          if (bit !== '1') {
            return null;
          }

          return (
            <rect
              key={`bar-${index}`}
              x={index}
              y="0"
              width="1"
              height={normalizedHeight}
              fill={barColor}
            />
          );
        })}
      </svg>

      {showText && (
        <span
          className={[
            'mt-1',
            'max-w-full',
            'truncate',
            'px-1',
            'text-center',
            'font-mono',
            'text-[8px]',
            'leading-tight',
            'tracking-[0.18em]',
          ].join(' ')}
          style={{
            color: barColor,
          }}
          title={sanitizedValue}
        >
          {sanitizedValue}
        </span>
      )}
    </div>
  );
};

export default Barcode;
