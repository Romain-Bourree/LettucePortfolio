import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './PixelImage.css';

interface PixelImageProps {
  src: string;
  alt: string;
  accentColor?: string;
  rows?: number;
  cols?: number;
  pieceDuration?: number;
  stagger?: number;
  className?: string;
}

function shuffleOrder(length: number, seedKey: string): number[] {
  const order = Array.from({ length }, (_, i) => i);
  let h = 0;
  for (let i = 0; i < seedKey.length; i += 1) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  for (let i = order.length - 1; i > 0; i -= 1) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function PixelImage({
  src,
  alt,
  accentColor = '#121212',
  rows = 18,
  cols = 18,
  pieceDuration = 0.2,
  stagger = 0.004,
  className = '',
}: PixelImageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isRevealDone, setIsRevealDone] = useState(false);
  const completedPiecesRef = useRef(0);

  useEffect(() => {
    completedPiecesRef.current = 0;
    setIsRevealDone(false);
  }, [src, rows, cols]);

  const pieces = useMemo(
    () =>
      Array.from({ length: rows * cols }, (_, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        return { idx, row, col };
      }),
    [rows, cols],
  );

  const delayByPieceIndex = useMemo(() => {
    const n = rows * cols;
    const shuffled = shuffleOrder(n, src);
    const delays = new Array<number>(n);
    shuffled.forEach((pieceIndex, sequence) => {
      delays[pieceIndex] = sequence * stagger;
    });
    return delays;
  }, [rows, cols, src, stagger]);

  const totalPieces = pieces.length;

  if (prefersReducedMotion) {
    return (
      <div className={`pixel-image ${className}`.trim()}>
        <img src={src} alt={alt} className="pixel-image__final" />
      </div>
    );
  }

  return (
    <div
      className={`pixel-image ${className}`.trim()}
      style={{ '--pixel-image-accent': accentColor } as React.CSSProperties}
    >
      {/* Accent field — visible through “empty” tiles until each block fades in */}
      <div className="pixel-image__accent" aria-hidden />

      <img
        src={src}
        alt={alt}
        className={`pixel-image__final ${isRevealDone ? 'pixel-image__final--visible' : ''}`}
      />

      {!isRevealDone && (
        <div className="pixel-image__mosaic" aria-hidden>
          {pieces.map(({ idx, row, col }) => {
            const x = cols > 1 ? (col / (cols - 1)) * 100 : 0;
            const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
            const delay = delayByPieceIndex[idx] ?? 0;

            return (
              <motion.span
                key={`${row}-${col}`}
                className="pixel-image__piece"
                style={{
                  left: `${(col / cols) * 100}%`,
                  top: `${(row / rows) * 100}%`,
                  width: `${100 / cols}%`,
                  height: `${100 / rows}%`,
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${cols * 100}% ${rows * 100}%`,
                  backgroundPosition: `${x}% ${y}%`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: pieceDuration, delay, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => {
                  completedPiecesRef.current += 1;
                  if (completedPiecesRef.current >= totalPieces) {
                    setIsRevealDone(true);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
