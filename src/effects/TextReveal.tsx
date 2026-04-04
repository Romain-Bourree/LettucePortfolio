import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './TextReveal.css';

export type TextRevealProps = {
  text: string;
  revealText: string;
  className?: string;
  staggerOnLoad?: boolean;
};

export function TextReveal({ text, revealText, className, staggerOnLoad = false }: TextRevealProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [widthPercentage, setWidthPercentage] = useState(0);
  const [isPointerOver, setIsPointerOver] = useState(false);

  const renderStaggerText = useCallback(
    (value: string, variant: 'muted' | 'revealed') => (
      <>
        {Array.from(value).map((char, idx) => (
          <span
            key={`${variant}-${idx}-${char === ' ' ? 'space' : char}`}
            className="text-reveal__char"
            style={{ animationDelay: `${120 + idx * 24}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </>
    ),
    [],
  );

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const w = width || 1;
    const pct = ((clientX - left) / w) * 100;
    setWidthPercentage(Math.max(0, Math.min(100, pct)));
  }, []);

  const pointerEnterHandler = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsPointerOver(true);
    if (e.pointerType !== 'touch') {
      updateFromClientX(e.clientX);
    }
  };

  const pointerLeaveHandler = () => {
    setIsPointerOver(false);
    setWidthPercentage(0);
  };

  const clipRight = `${100 - widthPercentage}%`;

  return (
    <button
      type="button"
      ref={containerRef}
      className={['text-reveal', className].filter(Boolean).join(' ')}
      onPointerEnter={pointerEnterHandler}
      onPointerLeave={pointerLeaveHandler}
      onPointerMove={(e) => updateFromClientX(e.clientX)}
      aria-label={`${text}. Hover or drag to reveal: ${revealText}.`}
    >
      <span className="text-reveal__sizer" aria-hidden>
        {revealText}
      </span>

      <motion.div
        className="text-reveal__overlay"
        animate={
          isPointerOver
            ? {
                opacity: widthPercentage > 0 ? 1 : 0,
                clipPath: `inset(0 ${clipRight} 0 0)`,
              }
            : {
                opacity: 0,
                clipPath: `inset(0 ${clipRight} 0 0)`,
              }
        }
        transition={isPointerOver ? { duration: 0 } : { duration: 0.4 }}
      >
        <span className="text-reveal__revealed" data-text={revealText}>
          <span className="text-reveal__text">
            {staggerOnLoad ? renderStaggerText(revealText, 'revealed') : revealText}
          </span>
        </span>
      </motion.div>

      <div className="text-reveal__base">
        <span className="text-reveal__muted" data-text={text}>
          <span className="text-reveal__text">
            {staggerOnLoad ? renderStaggerText(text, 'muted') : text}
          </span>
        </span>
      </div>
    </button>
  );
}

export default TextReveal;
