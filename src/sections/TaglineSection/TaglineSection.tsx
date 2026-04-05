import React, { useLayoutEffect, useRef } from "react";
import { REVEAL_POOL } from "../../features/headerSection/data";
import {
  applyGraphemeRevealProgress,
  segmentGraphemes,
} from "../../effects/graphemeReveal";
import { gsap, ScrollTrigger } from "../../effects/registerScrollTrigger";
import "./TaglineSection.css";

const TAGLINE_LINES = [
  "ROMAIN",
  "CALM",
  "AND",
  "LETTUCE",
  "DESIGN",
] as const;

export default function TaglineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const lineEls = TAGLINE_LINES.map((_, i) => lineRefs.current[i]).filter(
      (el): el is HTMLSpanElement => el != null,
    );

    if (!section || lineEls.length !== TAGLINE_LINES.length) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pool = REVEAL_POOL;
    const graphemesByLine = TAGLINE_LINES.map((t) => segmentGraphemes(t));

    const setFinal = () => {
      TAGLINE_LINES.forEach((t, i) => {
        const el = lineEls[i];
        if (!el) return;
        el.textContent = t;
        if (t === "LETTUCE") {
          el.setAttribute("data-text", t);
        }
      });
    };

    if (reduceMotion) {
      setFinal();
      return;
    }

    const ranges: readonly [number, number][] = [
      [0.02, 0.22],
      [0.1, 0.3],
      [0.18, 0.38],
      [0.26, 0.5],
      [0.34, 0.62],
    ];

    const sync = (pr: number) => {
      for (let i = 0; i < TAGLINE_LINES.length; i += 1) {
        const [a, b] = ranges[i]!;
        const local = gsap.utils.clamp(0, 1, gsap.utils.mapRange(a, b, 0, 1, pr));
        const text = TAGLINE_LINES[i]!;
        const g = graphemesByLine[i]!;
        const el = lineEls[i]!;
        const syncEl = text === "LETTUCE" ? el : undefined;
        applyGraphemeRevealProgress(el, g, local * g.length, pool, text, syncEl);
      }
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 88%",
      /* Fixed scroll span so the scrub can finish without huge empty space below */
      end: "+=260",
      scrub: 0.55,
      onUpdate(self) {
        sync(self.progress);
      },
    });

    sync(st.progress);

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="tagline-section"
      aria-labelledby="tagline-section-heading"
    >
      <div className="tagline-section__inner">
        <h2 id="tagline-section-heading" className="tagline-section__headline">
          {TAGLINE_LINES.map((line, i) => (
            <span
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className={
                line === "LETTUCE"
                  ? "tagline-section__line tagline-section__line--accent"
                  : "tagline-section__line"
              }
              {...(line === "LETTUCE" ? { "data-text": "LETTUCE" } : {})}
            >
              {line}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
