import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { GraphemeRevealState } from '../../effects/graphemeReveal';
import { TextReveal } from '../../effects/TextReveal';
import { RBLogo } from '../../effects/RBLogo';
import {
  AUDIENCE_STEP_DELAY_MS,
  AUDIENCES,
  cancelMenuCloseTimer,
  INITIAL_AUDIENCE_TEXT,
  INTRO_STEP_DELAY_MS,
  INTRO_TEXT,
  prefersReducedMotion,
  REVEAL_POOL,
  runHeaderReveal,
  scheduleMenuCloseTimer,
  SCROLL_STEP_DELAY_MS,
  TITLE_AFTER_LOGO_DELAY_MS,
} from '../../features/headerSection';
import StickerPeel from './StickerPeel';
import './HeaderSection.css';

const RB_FACE_STICKER_SRC = '/images/RBFace.png';

export default function HeaderSection() {
  const [index, setIndex] = useState(0);
  const [isAudienceMenuOpen, setIsAudienceMenuOpen] = useState(false);
  const [logoShadowReady, setLogoShadowReady] = useState(false);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const [isAudienceVisible, setIsAudienceVisible] = useState(false);
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const handleLogoAnimationComplete = useCallback(() => {
    setLogoShadowReady(true);
  }, []);
  const [audienceSlotMinHeight, setAudienceSlotMinHeight] = useState<number | undefined>(undefined);
  const measureRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLSpanElement>(null);
  const paraRef = useRef<HTMLSpanElement>(null);
  const audienceControlRef = useRef<HTMLDivElement>(null);
  const closeMenuTimerRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const introRevealStateRef = useRef<GraphemeRevealState>({ p: 0 });
  const revealStateRef = useRef<GraphemeRevealState>({ p: 0 });
  const cancelScheduledMenuClose = useCallback(() => {
    cancelMenuCloseTimer(closeMenuTimerRef);
  }, []);
  const scheduleMenuClose = useCallback(() => {
    scheduleMenuCloseTimer(closeMenuTimerRef, () => setIsAudienceMenuOpen(false));
  }, []);
  const closeAudienceMenuIfLeaving = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (nextTarget && audienceControlRef.current?.contains(nextTarget)) return;
      scheduleMenuClose();
    },
    [scheduleMenuClose],
  );

  const measureAudienceSlot = useCallback(() => {
    const root = measureRef.current;
    if (!root) return;
    let max = 0;
    root.querySelectorAll('[data-audience-measure]').forEach((el) => {
      max = Math.max(max, (el as HTMLElement).offsetHeight);
    });
    setAudienceSlotMinHeight(max);
  }, []);

  useLayoutEffect(() => {
    measureAudienceSlot();
    window.addEventListener('resize', measureAudienceSlot);
    return () => window.removeEventListener('resize', measureAudienceSlot);
  }, [measureAudienceSlot]);

  useLayoutEffect(() => {
    if (!logoShadowReady) return;

    const introEl = introRef.current;
    const audienceEl = paraRef.current;
    if (!introEl || !audienceEl) return;
    const prefersReduced = prefersReducedMotion();

    if (prefersReduced) {
      setIsTitleVisible(true);
      setIsIntroVisible(true);
      setIsAudienceVisible(true);
      setIsScrollVisible(true);
      introEl.textContent = INTRO_TEXT;
      audienceEl.textContent = INITIAL_AUDIENCE_TEXT;
      return;
    }

    introEl.textContent = '';
    audienceEl.textContent = '';
    setIsTitleVisible(false);
    setIsIntroVisible(false);
    setIsAudienceVisible(false);
    setIsScrollVisible(false);

    const titleTimer = window.setTimeout(() => {
      setIsTitleVisible(true);
    }, TITLE_AFTER_LOGO_DELAY_MS);

    const introTimer = window.setTimeout(() => {
      setIsIntroVisible(true);
      runHeaderReveal(introEl, INTRO_TEXT, REVEAL_POOL, introRevealStateRef.current);
    }, TITLE_AFTER_LOGO_DELAY_MS + INTRO_STEP_DELAY_MS);

    const audienceTimer = window.setTimeout(() => {
      setIsAudienceVisible(true);
      animatingRef.current = true;
      runHeaderReveal(
        audienceEl,
        INITIAL_AUDIENCE_TEXT,
        REVEAL_POOL,
        revealStateRef.current,
        () => {
          animatingRef.current = false;
        },
      );
    }, TITLE_AFTER_LOGO_DELAY_MS + INTRO_STEP_DELAY_MS + AUDIENCE_STEP_DELAY_MS);

    const scrollTimer = window.setTimeout(() => {
      setIsScrollVisible(true);
    }, TITLE_AFTER_LOGO_DELAY_MS + INTRO_STEP_DELAY_MS + AUDIENCE_STEP_DELAY_MS + SCROLL_STEP_DELAY_MS);

    return () => {
      window.clearTimeout(titleTimer);
      window.clearTimeout(introTimer);
      window.clearTimeout(audienceTimer);
      window.clearTimeout(scrollTimer);
    };
  }, [logoShadowReady]);

  useLayoutEffect(() => {
    const introState = introRevealStateRef.current;
    const audienceState = revealStateRef.current;
    return () => {
      gsap.killTweensOf(introState);
      gsap.killTweensOf(audienceState);
    };
  }, []);

  const runParagraphTransition = useCallback((toText: string) => {
    const prefersReduced = prefersReducedMotion();

    const el = paraRef.current;
    if (!el) return;

    if (prefersReduced) {
      el.textContent = toText;
      animatingRef.current = false;
      return;
    }

    runHeaderReveal(el, toText, REVEAL_POOL, revealStateRef.current, () => {
      animatingRef.current = false;
    });
  }, []);

  const handleAudienceSelect = useCallback((nextIndex: number) => {
    if (animatingRef.current || nextIndex === index) {
      setIsAudienceMenuOpen(false);
      return;
    }
    animatingRef.current = true;
    const toText = AUDIENCES[nextIndex].text;
    setIndex(nextIndex);
    setIsAudienceMenuOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => runParagraphTransition(toText));
    });
  }, [index, runParagraphTransition]);

  useEffect(() => {
    if (!isAudienceMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!audienceControlRef.current?.contains(target)) {
        setIsAudienceMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAudienceMenuOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isAudienceMenuOpen]);

  useEffect(() => {
    return () => {
      cancelScheduledMenuClose();
    };
  }, [cancelScheduledMenuClose]);

  const current = AUDIENCES[index];

  return (
    <section className="about-hero" aria-label="About me">
      <div className="about-hero__inner">
        <div className="about-hero__sticker-bounds">
          <div
            className={`about-hero__sticker-pop${logoShadowReady ? ' about-hero__sticker-pop--in' : ''}`}
            aria-hidden
          >
            <StickerPeel
              imageSrc={RB_FACE_STICKER_SRC}
              width={120}
              rotate={0}
              peelBackHoverPct={30}
              peelBackActivePct={40}
              shadowIntensity={0}
              lightingIntensity={0.03}
              initialPosition={{ x: 75, y: 95 }}
              peelDirection={0}
              followPointerEntry
            />
          </div>
        </div>
        <div className="about-hero__content">
          <div className={`about-hero__logo ${logoShadowReady ? 'about-hero__logo--line-shadow' : ''}`} aria-hidden>
            <RBLogo
              className="about-hero__logo-svg"
              onAnimationComplete={handleLogoAnimationComplete}
            />
          </div>
          <div className="about-hero__layer1">
            <h1 className="about-hero__title">
              <TextReveal
                className={`about-hero__title-reveal ${isTitleVisible ? 'about-hero__step--visible' : ''}`}
                text="Hey! I'm Romain"
                revealText="Call me lettuce"
                staggerOnLoad
              />{' '}
            </h1>
            <p className={`about-hero__intro about-hero__copy-block ${isIntroVisible ? 'about-hero__step--visible' : ''}`}>
              <span ref={introRef} className="about-hero__intro-text" />
            </p>
          </div>

          <div className={`about-hero__layer2 ${isAudienceVisible ? 'about-hero__step--visible' : ''}`}>
            <div
              className="about-hero__slot"
              style={audienceSlotMinHeight ? { minHeight: audienceSlotMinHeight } : undefined}
            >
              <div ref={measureRef} className="about-hero__measure" aria-hidden>
                {AUDIENCES.map((a) => (
                  <p
                    key={a.id}
                    data-audience-measure
                    className="about-hero__para about-hero__copy-block about-hero__copy-block--measure"
                  >
                    <span className="about-hero__audience-inline">
                      <span className="about-hero__for">For</span>{' '}
                      <span className="about-hero__audience-btn about-hero__audience-btn--measure">
                        {a.label}{' '}
                        <span className="about-hero__audience-caret-wrap" aria-hidden>
                          <span className="about-hero__audience-caret" />
                        </span>
                      </span>
                    </span>{' '}
                    {a.text}
                  </p>
                ))}
              </div>
              <p className="about-hero__para about-hero__copy-block" aria-live="polite">
                <span
                  className="about-hero__audience-inline"
                  ref={audienceControlRef}
                  onMouseEnter={() => {
                    cancelScheduledMenuClose();
                    setIsAudienceMenuOpen(true);
                  }}
                  onMouseLeave={closeAudienceMenuIfLeaving}
                >
                  <span className="about-hero__for">For</span>{' '}
                  <span className="about-hero__audience-control">
                    <button
                      type="button"
                      className={`about-hero__audience-btn ${isAudienceMenuOpen ? 'about-hero__audience-btn--open' : ''}`}
                      onClick={() => setIsAudienceMenuOpen((prev) => !prev)}
                      aria-label={`Audience: ${current.label}. Open options on hover or tap.`}
                      aria-expanded={isAudienceMenuOpen}
                      aria-haspopup="listbox"
                      aria-controls="about-hero-audience-options"
                    >
                      {current.label}{' '}
                      <span className="about-hero__audience-caret-wrap" aria-hidden>
                        <span className="about-hero__audience-caret" />
                      </span>
                    </button>
                    {isAudienceMenuOpen && (
                      <ul
                        id="about-hero-audience-options"
                        className="about-hero__audience-menu"
                        role="listbox"
                        aria-label="Audience options"
                        onMouseEnter={cancelScheduledMenuClose}
                        onMouseLeave={closeAudienceMenuIfLeaving}
                      >
                        {AUDIENCES.map((audience, optionIndex) => (
                          <li key={audience.id}>
                            <button
                              type="button"
                              className={`about-hero__audience-menu-item ${optionIndex === index ? 'about-hero__audience-menu-item--active' : ''}`}
                              role="option"
                              aria-selected={optionIndex === index}
                              onClick={() => handleAudienceSelect(optionIndex)}
                            >
                              {audience.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </span>
                </span>{' '}
                <span ref={paraRef} className="about-hero__para-text" />
              </p>
            </div>
          </div>
        </div>

        <div className={`about-hero__scroll ${isScrollVisible ? 'about-hero__step--visible' : ''}`}>
          <a
            href="#journey"
            className="about-hero__scroll-link about-hero__scroll-link--sweep"
            aria-label="Scroll to the Product Design Journey section"
          >
            <span className="about-hero__scroll-text">The full picture</span>
            <span className="about-hero__scroll-icon" aria-hidden>
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
