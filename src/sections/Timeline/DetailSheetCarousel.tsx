import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./DetailSheetCarousel.css";

export interface DetailSheetCarouselSlide {
  src: string;
  alt: string;
  /** Small label shown on the expanded strip (e.g. "# 23"). */
  code?: string;
}

interface DetailSheetCarouselProps {
  images: DetailSheetCarouselSlide[];
  /** Detail sheet open — resets expanded row when the sheet closes. */
  isActive: boolean;
  className?: string;
}

/**
 * Hover / click accordion image stack for the timeline detail sheet.
 * Pattern adapted from Skiper UI HoverExpand_002 — https://gxuri.in / @gurvinder-singh02
 * (Free use with Skiper UI attribution per their license.)
 */
export function DetailSheetCarousel({
  images,
  isActive,
  className = "",
}: DetailSheetCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const enteredRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setActiveIndex(0);
      setEntered(false);
      enteredRef.current = false;
    }
  }, [isActive]);

  // Trigger the CSS entry animation one frame after mount
  useEffect(() => {
    if (images.length > 1 && !reduceMotion && !enteredRef.current) {
      const id = requestAnimationFrame(() => {
        setEntered(true);
        enteredRef.current = true;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [images.length, reduceMotion]);

  const handleHover = useCallback((index: number) => setActiveIndex(index), []);
  const handleKey = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveIndex(index);
    }
  }, []);

  const rootClass = ["timeline-sheet-carousel", className]
    .filter(Boolean)
    .join(" ");

  if (images.length === 0) return null;

  if (images.length === 1) {
    const img = images[0];
    return (
      <motion.div
        className={rootClass}
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.15 }}
      >
        <div className="timeline-sheet-carousel__solo-wrap">
          <img
            className="timeline-sheet-carousel__solo-img"
            src={img.src}
            alt={img.alt}
          />
          {img.code ? (
            <div className="timeline-sheet-carousel__solo-meta" aria-hidden>
              <p className="timeline-sheet-carousel__code">{img.code}</p>
            </div>
          ) : null}
        </div>
      </motion.div>
    );
  }

  if (reduceMotion) {
    return (
      <div className={rootClass}>
        <div className="timeline-sheet-carousel__stack timeline-sheet-carousel__stack--reduced">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className={`timeline-sheet-carousel__row timeline-sheet-carousel__row--static ${
                activeIndex === index
                  ? "timeline-sheet-carousel__row--static-expanded"
                  : ""
              }`}
              aria-expanded={activeIndex === index}
              onClick={() => setActiveIndex(index)}
            >
              <span className="timeline-sheet-carousel__row-img-wrap">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="timeline-sheet-carousel__row-img"
                />
              </span>
              <span
                className={`timeline-sheet-carousel__row-shade timeline-sheet-carousel__row-shade--static ${
                  activeIndex === index ? "is-active" : ""
                }`}
                aria-hidden
              />
              {image.code ? (
                <span
                  className={`timeline-sheet-carousel__row-meta timeline-sheet-carousel__row-meta--static ${
                    activeIndex === index ? "is-active" : ""
                  }`}
                >
                  <span className="timeline-sheet-carousel__code">
                    {image.code}
                  </span>
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${rootClass} ${entered ? "is-entered" : "is-entering"}`}>
      <div className="timeline-sheet-carousel__stack">
        {images.map((image, index) => {
          const isExpanded = activeIndex === index;
          return (
            <div
              key={`${image.src}-${index}`}
              className={`timeline-sheet-carousel__row ${isExpanded ? "is-expanded" : ""}`}
              onMouseEnter={() => handleHover(index)}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleKey(e, index)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={image.alt}
            >
              <div
                className={`timeline-sheet-carousel__row-shade ${isExpanded ? "is-active" : ""}`}
                aria-hidden
              />
              {image.code ? (
                <div
                  className={`timeline-sheet-carousel__row-meta ${isExpanded ? "is-active" : ""}`}
                >
                  <p className="timeline-sheet-carousel__code">{image.code}</p>
                </div>
              ) : null}
              <img
                src={image.src}
                alt={image.alt}
                className="timeline-sheet-carousel__row-img"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
