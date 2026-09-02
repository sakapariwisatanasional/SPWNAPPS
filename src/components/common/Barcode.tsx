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
 * High-resolution Barcode renderer with SVG crispEdges
 */
export const Barcode: React.FC<BarcodeProps> = ({
  value,
  className = '',
  width = '100%',
  height = 32,
  showText = false,
  barColor = '#ffffff',
  bgColor = 'transparent'
}) => {
  // Generate deterministic bar widths based on input string
  const bars = useMemo(() => {
    const cleanVal = (value || 'SAKA-2026').toUpperCase();
    const pattern: number[] = [2, 1, 1, 2]; // Start guard
    
    for (let i = 0; i < cleanVal.length; i++) {
      const code = cleanVal.charCodeAt(i);
      // Produce 4 bars per character with varying thickness 1, 2, or 3
      pattern.push(((code * 3 + 1) % 3) + 1);
      pattern.push(((code * 7 + 2) % 2) + 1);
      pattern.push(((code * 5 + 3) % 3) + 1);
      pattern.push(((code * 2 + 1) % 2) + 1);
    }
    
    pattern.push(2, 1, 2, 1, 2); // Stop guard
    return pattern;
  }, [value]);

  const totalWidthUnits = useMemo(() => {
    return bars.reduce((acc, curr) => acc + curr, 0);
  }, [bars]);

  let currentX = 0;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidthUnits} ${height}`}
        style={{ width: typeof width === 'number' ? `${width}px` : width, height: `${height}px` }}
        className="overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {bgColor !== 'transparent' && (
          <rect x="0" y="0" width={totalWidthUnits} height={height} fill={bgColor} />
        )}
        {bars.map((barWidth, index) => {
          const x = currentX;
          currentX += barWidth;
          // Alternate bars (black/white)
          if (index % 2 === 0) {
            return (
              <rect
                key={index}
                x={x}
                y="0"
                width={barWidth}
                height={height}
                fill={barColor}
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <span 
          className="text-[7.5px] font-mono tracking-widest mt-0.5"
          style={{ color: barColor }}
        >
          *{value}*
        </span>
      )}
    </div>
  );
};
