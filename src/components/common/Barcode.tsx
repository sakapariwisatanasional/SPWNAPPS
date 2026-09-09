```tsx
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
 * Code 128-B pattern table.
 * Index 0-102 = data/checksum symbols
 * Index 103 = Start Code A
 * Index 104 = Start Code B
 * Index 105 = Start Code C
 * Index 106 = Stop
 */
const CODE128_PATTERNS = [
  "11011001100",
  "11001101100",
  "11001100110",
  "10010011000",
  "10010001100",
  "10001001100",
  "10011001000",
  "10011000100",
  "10001100100",
  "11001001000",
  "11001000100",
  "11000100100",
  "10110011100",
  "10011011100",
  "10011001110",
  "10111001100",
  "10011101100",
  "10011100110",
  "11001110010",
  "11001011100",
  "11001001110",
  "11011100100",
  "11001110100",
  "11101101110",
  "11101001100",
  "11100101100",
  "11100100110",
  "11101100100",
  "11100110100",
  "11100110010",
  "11011011000",
  "11011000110",
  "11000110110",
  "10100011000",
  "10001011000",
  "10001000110",
  "10110001000",
  "10001101000",
  "10001100010",
  "11010001000",
  "11000101000",
  "11000100010",
  "10110111000",
  "10110001110",
  "10001101110",
  "10111011000",
  "10111000110",
  "10001110110",
  "11101110110",
  "11010001110",
  "11000101110",
  "11011101000",
  "11011100010",
  "11011101110",
  "11101011000",
  "11101000110",
  "11100010110",
  "11101101000",
  "11101100010",
  "11100011010",
  "11101111010",
  "11001000010",
  "11110001010",
  "10100110000",
  "10100001100",
  "10010110000",
  "10010000110",
  "10000101100",
  "10000100110",
  "10110010000",
  "10110000100",
  "10011010000",
  "10011000010",
  "10000110100",
  "10000110010",
  "11000010010",
  "11001010000",
  "11110111010",
  "11000010100",
  "10001111010",
  "10100111100",
  "10010111100",
  "10010011110",
  "10111100100",
  "10011110100",
  "10011110010",
  "11110100100",
  "11110010100",
  "11110010010",
  "11011011110",
  "11011110110",
  "11110110110",
  "10101111000",
  "10100011110",
  "10001011110",
  "10111101000",
  "10111100010",
  "11110101000",
  "11110100010",
  "10111011110",
  "10111101110",
  "11101011110",
  "11110101110",
  "11010000100",
  "11010010000",
  "11010011100",
  "1100011101011"
];

/**
 * Encode a string as Code 128-B.
 *
 * Code 128-B supports printable ASCII characters 32-126.
 * Any unsupported character is safely replaced with '?'.
 */
function encodeCode128B(value: string): string {
  const input = String(value || 'SAKA-2026')
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);

      // Printable ASCII range supported by Code 128-B.
      return code >= 32 && code <= 126 ? ch : '?';
    })
    .join('');

  const values = Array.from(
    input,
    (ch) => ch.charCodeAt(0) - 32
  );

  /**
   * Code 128-B:
   * Start B = 104
   *
   * checksum =
   * startCode +
   * sum(dataValue * position)
   *
   * position starts at 1.
   */
  const checksum =
    (104 +
      values.reduce(
        (sum, value, index) =>
          sum + value * (index + 1),
        0
      )) %
    103;

  /**
   * Start B (104)
   * + data
   * + checksum
   * + Stop (106)
   */
  return [104, ...values, checksum, 106]
    .map((code) => CODE128_PATTERNS[code] || '')
    .join('');
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  className = '',
  width = '100%',
  height = 32,
  showText = false,
  barColor = '#000000',
  bgColor = 'transparent'
}) => {
  const encoded = useMemo(
    () => encodeCode128B(value),
    [value]
  );

  /**
   * Safety fallback.
   * Prevents SVG from receiving an invalid zero-sized viewBox
   * if a malformed value somehow reaches the component.
   */
  const safeEncoded =
    encoded.length > 0
      ? encoded
      : CODE128_PATTERNS[104] + CODE128_PATTERNS[106];

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
    >
      <svg
        viewBox={`0 0 ${safeEncoded.length} ${height}`}
        preserveAspectRatio="none"
        style={{
          width:
            typeof width === 'number'
              ? `${width}px`
              : width,
          height: `${height}px`
        }}
        className="overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        role="img"
        aria-label={`Barcode: ${value}`}
      >
        {bgColor !== 'transparent' && (
          <rect
            x="0"
            y="0"
            width={safeEncoded.length}
            height={height}
            fill={bgColor}
          />
        )}

        {safeEncoded.split('').map(
          (bit, index) =>
            bit === '1' && (
              <rect
                key={index}
                x={index}
                y="0"
                width="1"
                height={height}
                fill={barColor}
              />
            )
        )}
      </svg>

      {showText && (
        <span
          className="text-[7.5px] font-mono tracking-widest mt-0.5"
          style={{
            color: barColor
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
};
```
