import React, { useLayoutEffect, useRef } from "react";
import { REVEAL_POOL } from "../../features/headerSection/data";
import {
  applyGraphemeRevealProgress,
  segmentGraphemes,
} from "../../effects/graphemeReveal";
import { gsap, ScrollTrigger } from "../../effects/registerScrollTrigger";
import "./WhatsNextSection.css";

const KICKER_TEXT = "What's next";

const INTRO_TEXTS = [
  "Wanna build something together?",
  "Wanna know who vouches for me?",
  "Wanna see everything in one place?",
] as const;

function CtaArrow() {
  return (
    <svg
      className="whats-next__cta-icon"
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WhatsNextSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const kickerRef = useRef<HTMLHeadingElement>(null);
  const introRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const kickerEl = kickerRef.current;
    const introEls = INTRO_TEXTS.map((_, i) => introRefs.current[i]).filter(
      (el): el is HTMLSpanElement => el != null,
    );

    if (!section || !kickerEl || introEls.length !== INTRO_TEXTS.length) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pool = REVEAL_POOL;
    const kG = segmentGraphemes(KICKER_TEXT);
    const introGraphemes = INTRO_TEXTS.map((t) => segmentGraphemes(t));

    const setFinal = () => {
      kickerEl.textContent = KICKER_TEXT;
      INTRO_TEXTS.forEach((t, i) => {
        const el = introEls[i];
        if (el) el.textContent = t;
      });
    };

    if (reduceMotion) {
      setFinal();
      return;
    }

    const sync = (pr: number) => {
      const kLocal = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(0, 0.2, 0, 1, pr),
      );
      applyGraphemeRevealProgress(
        kickerEl,
        kG,
        kLocal * kG.length,
        pool,
        KICKER_TEXT,
      );

      const ranges: readonly [number, number][] = [
        [0.08, 0.34],
        [0.18, 0.46],
        [0.28, 0.58],
      ];
      for (let i = 0; i < INTRO_TEXTS.length; i += 1) {
        const [a, b] = ranges[i]!;
        const local = gsap.utils.clamp(0, 1, gsap.utils.mapRange(a, b, 0, 1, pr));
        applyGraphemeRevealProgress(
          introEls[i]!,
          introGraphemes[i]!,
          local * introGraphemes[i]!.length,
          pool,
          INTRO_TEXTS[i]!,
        );
      }
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 86%",
      end: "+=240",
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
    <section ref={sectionRef} className="whats-next" aria-labelledby="whats-next-heading">
      <div className="whats-next__inner">
        <h1
          id="whats-next-heading"
          ref={kickerRef}
          className="whats-next__kicker"
        >
          {KICKER_TEXT}
        </h1>
        <div className="whats-next__leads">
          <p className="whats-next__lead">
            <span
              className="whats-next__intro"
              ref={(el) => {
                introRefs.current[0] = el;
              }}
            >
              {INTRO_TEXTS[0]}
            </span>
            <a
              className="whats-next__button whats-next__cta whats-next__cta--link005"
              href="mailto:r.bourree@gmail.com"
              aria-label="Let's talk by email"
            >
              <span className="whats-next__cta-label">let&apos;s talk</span>
              <CtaArrow />
            </a>
          </p>
          <p className="whats-next__lead">
            <span
              className="whats-next__intro"
              ref={(el) => {
                introRefs.current[1] = el;
              }}
            >
              {INTRO_TEXTS[1]}
            </span>
            <a
              className="whats-next__button whats-next__cta whats-next__cta--link005"
              href="https://www.linkedin.com/in/designdirb/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open LinkedIn profile (opens in a new tab)"
            >
              <span className="whats-next__cta-label">check my LinkedIn</span>
              <CtaArrow />
            </a>
          </p>
          <p className="whats-next__lead">
            <span
              className="whats-next__intro"
              ref={(el) => {
                introRefs.current[2] = el;
              }}
            >
              {INTRO_TEXTS[2]}
            </span>
            <a
              className="whats-next__button whats-next__cta whats-next__cta--link005"
              href="/resume/RB-RESUME-2K26.pdf"
              download="RB-RESUME-2K26.pdf"
              aria-label="Download resume as PDF"
            >
              <span className="whats-next__cta-label">grab my resume</span>
              <CtaArrow />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
