import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./TextReveal.css";

export type TextRevealProps = {
  text: string;
  revealText: string;
  mobileText?: string;
  mobileRevealText?: string;
  className?: string;
  staggerOnLoad?: boolean;
};

export function TextReveal({
  text,
  revealText,
  mobileText,
  mobileRevealText,
  className,
  staggerOnLoad = false,
}: TextRevealProps) {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const activeText = isMobile && mobileText ? mobileText : text;
  const activeRevealText =
    isMobile && mobileRevealText ? mobileRevealText : revealText;
  const containerRef = useRef<HTMLButtonElement>(null);
  const [widthPercentage, setWidthPercentage] = useState(0);
  const [isPointerOver, setIsPointerOver] = useState(false);

  const renderWithBreaks = useCallback((value: string) => {
    if (!value.includes("\n")) return value;
    return value.split("\n").map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  }, []);

  const renderStaggerText = useCallback(
    (value: string, variant: "muted" | "revealed") => (
      <>
        {Array.from(value).map((char, idx) => {
          if (char === "\n") return <br key={`${variant}-${idx}-br`} />;
          return (
            <span
              key={`${variant}-${idx}-${char === " " ? "space" : char}`}
              className="text-reveal__char"
              style={{ animationDelay: `${120 + idx * 24}ms` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
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
    if (e.pointerType !== "touch") {
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
      className={["text-reveal", className].filter(Boolean).join(" ")}
      onPointerEnter={pointerEnterHandler}
      onPointerLeave={pointerLeaveHandler}
      onPointerMove={(e) => updateFromClientX(e.clientX)}
      aria-label={`${activeText}. Hover or drag to reveal: ${activeRevealText}.`}
    >
      <span className="text-reveal__sizer" aria-hidden>
        {renderWithBreaks(
          activeText.length >= activeRevealText.length
            ? activeText
            : activeRevealText,
        )}
      </span>

      <motion.div
        className="text-reveal__overlay"
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
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
        <span className="text-reveal__revealed" data-text={activeRevealText}>
          <span className="text-reveal__text">
            {staggerOnLoad
              ? renderStaggerText(activeRevealText, "revealed")
              : renderWithBreaks(activeRevealText)}
          </span>
        </span>
      </motion.div>

      <div className="text-reveal__base">
        <span className="text-reveal__muted" data-text={activeText}>
          <span className="text-reveal__text">
            {staggerOnLoad
              ? renderStaggerText(activeText, "muted")
              : renderWithBreaks(activeText)}
          </span>
        </span>
      </div>
    </button>
  );
}

export default TextReveal;
