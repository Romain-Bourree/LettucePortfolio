import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Howler } from 'howler';
import useSound from 'use-sound';
import HeaderSection from '../HeaderSection/HeaderSection';
import DetailSheet from './DetailSheet';
import {
  ACTIVATION_ORDER,
  COMPACT_OVERLAP_SWAP_MS,
  getNoDetailSheetAriaDescription,
  getNoDetailSheetCursorLabel,
  LINKED_HIGHLIGHT_GROUPS,
  LAYOUT_END_BUFFER_YEARS,
  PANEL_DATA,
  QUOTE_ROTATION_MS,
  SAME_YEAR_STACK_OFFSET_PX,
  SCROLL_SCRUB_ALPHA,
  SHEET_TRANSITION_MS,
  TAG_MAP,
  TICK_SOUND,
  timelineItemBlocksDetailSheet,
  TIMELINE_CLOSURE_EXTRA_PX,
  TIMELINE_ITEMS as items,
  VIEWPORT_TRIGGER_RATIO,
  parsePeriodYears,
} from '../../features/timeline';
import type { TimelineGeometry } from '../../features/timeline';
import './Timeline.css';

interface TimelineProps {
  onActiveColorChange?: (color: string) => void;
}

const INIT_MIN_YEAR = Math.min(...items.map((item) => parsePeriodYears(item.period).start));

function TimelineArchiveIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="4" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

const Timeline: React.FC<TimelineProps> = ({ onActiveColorChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const journeyAnchorRef = useRef<HTMLDivElement>(null);
  const sectionHeaderRef = useRef<HTMLDivElement>(null);
  const timelineInnerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const bgWashRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevFocusIndexForSoundRef = useRef(-1);
  const hasUnlockedSoundRef = useRef(false);
  const activeIndexRef = useRef<number>(-1);
  const traceActivationYearRef = useRef<number[]>(items.map(() => Number.NaN));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playTick] = useSound(TICK_SOUND, {
    volume: 2,
    playbackRate: 2.5,
    interrupt: true,
    soundEnabled,
  });

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSheetMounted, setIsSheetMounted] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [isCompactTimeline, setIsCompactTimeline] = useState(false);
  const [compactOverlapPhase, setCompactOverlapPhase] = useState(0);
  const [, setCenterProgress] = useState(0);
  const [scrubbedScroll, setScrubbedScroll] = useState(0);
  const [displayYear, setDisplayYear] = useState(INIT_MIN_YEAR);
  const [noSheetCursorHint, setNoSheetCursorHint] = useState<{ x: number; y: number; label: string } | null>(null);
  const noSheetCursorRafRef = useRef<number | null>(null);
  const noSheetCursorPendingRef = useRef<{ x: number; y: number } | null>(null);
  const yearTweenObj = useRef({ value: INIT_MIN_YEAR });
  const scrollTargetRef = useRef(0);
  const scrubbedRef = useRef(0);
  const scrubRafRef = useRef<number | null>(null);
  const scrollScrubEnabledRef = useRef(true);
  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : null;
  const selectedPanelContent = useMemo(() => {
    if (!selectedItem) return null;
    const key = selectedItem.name.toUpperCase();
    return PANEL_DATA[key] ?? { tldr: selectedItem.desc, quotes: [] };
  }, [selectedItem]);
  const activeQuote = selectedPanelContent && selectedPanelContent.quotes.length > 0
    ? selectedPanelContent.quotes[quoteIndex % selectedPanelContent.quotes.length]
    : null;

  const parsedPeriods = items.map((item) => parsePeriodYears(item.period));
  const minYear = Math.min(...parsedPeriods.map((p) => p.start));
  const maxYear = Math.max(...parsedPeriods.map((p) => p.end));
  const yearSpanLayout = Math.max(1, maxYear - minYear + LAYOUT_END_BUFFER_YEARS);
  const timelineHeight = Math.max(2400, yearSpanLayout * 100 + TIMELINE_CLOSURE_EXTRA_PX);
  const currentYear = minYear + yearSpanLayout * scrubbedScroll;
  const titleYear = displayYear;

  const geometry: TimelineGeometry[] = items.map((item, i) => {
    const { start, end } = parsedPeriods[i];
    const startRatio = (start - minYear) / yearSpanLayout;
    const endRatio = (end - minYear) / yearSpanLayout;
    const durationRatio = Math.max(0, endRatio - startRatio);
    const track = item.type === 'career' ? 'right' : 'left';
    return {
      start,
      end,
      topPct: startRatio * 100,
      durationPct: durationRatio * 100,
      track,
    };
  });
  const activeStartYear = activeIndex >= 0 ? geometry[activeIndex].start : null;
  const graduatedIdx = items.findIndex((item) => item.name === 'Graduated');
  const dsquareIdx = items.findIndex((item) => item.name === 'Dsquare');
  const isLinkedWithActive = useCallback(
    (idx: number): boolean => (
      activeIndex >= 0
      && LINKED_HIGHLIGHT_GROUPS.some((group) => (
        group.includes(items[activeIndex].name) && group.includes(items[idx].name)
      ))
    ),
    [activeIndex],
  );
  /** Content + connector hidden; dot and vertical trace stay visible (desktop + compact overlap rules). */
  const isContentSuppressedByActiveIdx = (idx: number): boolean => {
    if (activeIndex < 0) return false;
    const activeName = items[activeIndex].name;
    const targetName = items[idx].name;
    if (isCompactTimeline) {
      if (activeName === 'Faktis' && (targetName === 'Graduated' || targetName === 'Dsquare')) return true;
      if ((activeName === 'Graduated' || activeName === 'Dsquare') && targetName === 'Invoke') return true;
      if (activeName === 'Invoke' && targetName === 'Krushon') return true;
      if (activeName === 'Mogo' && targetName === 'IBS & Me') return true;
      if (activeName === 'Fromme Here' && targetName === 'Arrived') return true;
      if (activeName === 'Arrived' && targetName === 'H2H') return true;
      if (activeName === 'H2H' && targetName === 'ASSET') return true;
      return false;
    }
    if (activeName === 'Faktis' && targetName === 'Graduated') return true;
    if ((activeName === 'Graduated' || activeName === 'Dsquare') && targetName === 'Invoke') return true;
    return false;
  };
  const isCompactOverlapFadeIdx = (idx: number): boolean => {
    if (!isCompactTimeline || activeIndex < 0) return false;
    if (idx !== graduatedIdx && idx !== dsquareIdx) return false;
    const activeName = items[activeIndex].name;
    if (activeName !== 'Graduated' && activeName !== 'Dsquare') return false;
    const showGraduated = compactOverlapPhase % 2 === 0;
    return idx === (showGraduated ? dsquareIdx : graduatedIdx);
  };

  const stackOffsetPx = (() => {
    const counts = new Map<string, number>();
    return geometry.map((g) => {
      const key = `${g.track}:${g.topPct.toFixed(12)}`;
      const n = counts.get(key) ?? 0;
      counts.set(key, n + 1);
      return n * SAME_YEAR_STACK_OFFSET_PX;
    });
  })();
  const nextSameTrackIdx = (() => {
    const nextSeen: Record<'left' | 'right', number> = { left: -1, right: -1 };
    const out = new Array<number>(geometry.length).fill(-1);
    for (let i = geometry.length - 1; i >= 0; i -= 1) {
      const track = geometry[i].track;
      out[i] = nextSeen[track];
      nextSeen[track] = i;
    }
    return out;
  })();
  const traceEndYearByIdx = geometry.map((g, i) => {
    const nextIdx = nextSameTrackIdx[i];
    if (nextIdx < 0) return g.end;
    return Math.min(g.end, geometry[nextIdx].start);
  });
  const orderRankByIdx = items.map((item) => ACTIVATION_ORDER.indexOf(item.name as (typeof ACTIVATION_ORDER)[number]));
  const idxByOrderRank = (() => {
    const out = new Map<number, number>();
    orderRankByIdx.forEach((rank, idx) => {
      if (rank >= 0) out.set(rank, idx);
    });
    return out;
  })();
  const isOrderUnlockedAtYear = (idx: number, year: number): boolean => {
    const rank = orderRankByIdx[idx];
    if (rank < 0) return false;
    if (rank === 0) return true;
    const prevIdx = idxByOrderRank.get(rank - 1);
    if (prevIdx == null) return true;
    const prevGeom = geometry[prevIdx];
    const prevTraceEnd = traceEndYearByIdx[prevIdx];
    if (prevTraceEnd <= prevGeom.start) return year >= prevGeom.start;
    return year >= prevTraceEnd;
  };

  const scrollDepsRef = useRef({
    minYear,
    yearSpanLayout,
    geometry,
    orderRankByIdx,
    isOrderUnlockedAtYear,
  });
  scrollDepsRef.current = { minYear, yearSpanLayout, geometry, orderRankByIdx, isOrderUnlockedAtYear };

  const periodLayoutRef = useRef({ parsedPeriods, minYear });
  periodLayoutRef.current = { parsedPeriods, minYear };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setSoundEnabled(!mq.matches);
      scrollScrubEnabledRef.current = !mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const sync = () => setIsCompactTimeline(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isCompactTimeline) return undefined;
    const timer = window.setInterval(() => {
      setCompactOverlapPhase((prev) => prev + 1);
    }, COMPACT_OVERLAP_SWAP_MS);
    return () => window.clearInterval(timer);
  }, [isCompactTimeline]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex < 0) return;
    if (Number.isFinite(traceActivationYearRef.current[activeIndex])) return;
    traceActivationYearRef.current[activeIndex] = currentYear;
  }, [activeIndex, currentYear]);

  useEffect(() => {
    const unlock = () => {
      if (hasUnlockedSoundRef.current) return;
      if (!soundEnabled) return;
      hasUnlockedSoundRef.current = true;

      prevFocusIndexForSoundRef.current = activeIndexRef.current;
      try {
        playTick();
      } catch {
        // ignore
      }

      const ctx = Howler.ctx;
      if (ctx?.state === 'suspended') void ctx.resume();
    };

    const opts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener('pointerdown', unlock, { ...opts, once: true });
    window.addEventListener('keydown', unlock, { ...opts, once: true });
    window.addEventListener('touchstart', unlock, { ...opts, once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
      window.removeEventListener('touchstart', unlock, { capture: true });
    };
  }, [playTick, soundEnabled]);

  useEffect(() => {
    const runScrubLoop = () => {
      if (scrubRafRef.current != null) return;
      const tick = () => {
        const target = scrollTargetRef.current;
        const prev = scrubbedRef.current;
        let next = prev + (target - prev) * SCROLL_SCRUB_ALPHA;
        if (Math.abs(target - next) < 0.0005) next = target;
        scrubbedRef.current = next;
        setScrubbedScroll(next);
        if (Math.abs(next - target) > 0.0001) {
          scrubRafRef.current = requestAnimationFrame(tick);
        } else {
          scrubRafRef.current = null;
        }
      };
      scrubRafRef.current = requestAnimationFrame(tick);
    };

    const update = () => {
      const ctx = Howler.ctx;
      if (ctx?.state === 'suspended') void ctx.resume();

      const el = containerRef.current;
      if (!el) return;

      const { minYear: minY, yearSpanLayout: span, geometry: geom, orderRankByIdx: ranks, isOrderUnlockedAtYear: orderUnlockedAtYear } =
        scrollDepsRef.current;

      const rect = el.getBoundingClientRect();
      const total = Math.max(1, el.scrollHeight);
      const centerOffset = -rect.top + window.innerHeight * VIEWPORT_TRIGGER_RATIO;
      const p = Math.max(0, Math.min(1, centerOffset / total));
      setCenterProgress(p);
      scrollTargetRef.current = p;

      const yearAtCenter = minY + span * scrubbedRef.current;
      if (scrollScrubEnabledRef.current) {
        runScrubLoop();
      } else {
        scrubbedRef.current = p;
        setScrubbedScroll(p);
      }

      const vh = window.innerHeight;
      const centerY = vh * VIEWPORT_TRIGGER_RATIO;
      let closestIdx = -1;
      let closestDist = Infinity;
      const nextVisible = new Set<number>();
      const dotCenterDistances = new Array<number>(items.length).fill(Infinity);

      entryRefs.current.forEach((entry, i) => {
        if (!entry) return;
        const r = entry.getBoundingClientRect();
        if (r.bottom > -100 && r.top < vh + 100) nextVisible.add(i);

        const dotEl = entry.querySelector('.timeline-dot') as HTMLDivElement | null;
        if (!dotEl) return;
        const dr = dotEl.getBoundingClientRect();
        if (dr.height < 1) return;
        if (dr.bottom <= 0 || dr.top >= vh) return;
        const dotCenter = dr.top + dr.height / 2;
        const dist = Math.abs(dotCenter - centerY);
        dotCenterDistances[i] = dist;
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      const hasTraceStarted = (idx: number): boolean => {
        const g = geom[idx];
        return yearAtCenter >= g.start;
      };
      const isOrderUnlocked = (idx: number): boolean => orderUnlockedAtYear(idx, yearAtCenter);

      let gatedActiveIdx = -1;
      let earliestUnactivatedRank = Infinity;
      let earliestUnactivatedDist = Infinity;
      let nearestEligibleIdx = -1;
      let nearestEligibleDist = Infinity;
      for (let i = 0; i < items.length; i += 1) {
        if (!Number.isFinite(dotCenterDistances[i])) continue;
        const rank = ranks[i];
        if (rank < 0) continue;
        if (!hasTraceStarted(i)) continue;
        const hasActivated = Number.isFinite(traceActivationYearRef.current[i]);
        if (!isOrderUnlocked(i) && !hasActivated) continue;
        const dist = dotCenterDistances[i];
        if (dist < nearestEligibleDist) {
          nearestEligibleDist = dist;
          nearestEligibleIdx = i;
        }
        if (!hasActivated) {
          if (rank < earliestUnactivatedRank || (rank === earliestUnactivatedRank && dist < earliestUnactivatedDist)) {
            earliestUnactivatedRank = rank;
            earliestUnactivatedDist = dist;
            gatedActiveIdx = i;
          }
        }
      }

      if (gatedActiveIdx < 0) gatedActiveIdx = nearestEligibleIdx;
      if (gatedActiveIdx < 0) gatedActiveIdx = closestIdx;

      setVisibleSet(nextVisible);
      setActiveIndex(gatedActiveIdx);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (scrubRafRef.current != null) {
        cancelAnimationFrame(scrubRafRef.current);
        scrubRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!soundEnabled || activeIndex < 0) return;
    if (prevFocusIndexForSoundRef.current === activeIndex) return;
    prevFocusIndexForSoundRef.current = activeIndex;
    playTick();
  }, [activeIndex, soundEnabled, playTick]);

  useEffect(() => {
    const { parsedPeriods: p, minYear: my } = periodLayoutRef.current;
    const targetYear = activeIndex >= 0 ? p[activeIndex].start : my;
    gsap.killTweensOf(yearTweenObj.current);
    gsap.to(yearTweenObj.current, {
      value: targetYear,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => setDisplayYear(Math.round(yearTweenObj.current.value)),
    });
  }, [activeIndex]);

  useEffect(() => {
    const washEl = bgWashRef.current;
    if (!washEl) return;

    const targetColor = activeIndex >= 0 ? items[activeIndex].color : '#121212';
    onActiveColorChange?.(targetColor);
    gsap.to(washEl, {
      backgroundColor: targetColor,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: true,
    });
  }, [activeIndex, onActiveColorChange]);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    gsap.to(el, {
      width: `${scrubbedScroll * 100}%`,
      duration: 0.18,
      ease: 'power2.out',
      overwrite: true,
    });
  }, [scrubbedScroll]);

  useEffect(() => {
    detailRefs.current.forEach((detailEl, i) => {
      if (!detailEl) return;
      const shouldShow = visibleSet.has(i) && (i === activeIndex || isLinkedWithActive(i));
      gsap.killTweensOf(detailEl);
      if (shouldShow) {
        gsap.to(detailEl, {
          height: 'auto',
          autoAlpha: 1,
          y: 0,
          duration: 0.42,
          ease: 'power2.out',
          overwrite: true,
        });
        return;
      }
      gsap.to(detailEl, {
        height: 0,
        autoAlpha: 0,
        y: 8,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: true,
      });
    });
  }, [activeIndex, visibleSet, isLinkedWithActive]);

  const openItemSheet = (idx: number) => {
    if (timelineItemBlocksDetailSheet(items[idx].name)) {
      if (isSheetVisible) setIsSheetVisible(false);
      return;
    }
    setSelectedIndex(idx);
    setQuoteIndex(0);
    if (!isSheetMounted) {
      setIsSheetMounted(true);
      requestAnimationFrame(() => setIsSheetVisible(true));
      return;
    }
    setIsSheetVisible(true);
  };

  const closeItemSheet = () => {
    setIsSheetVisible(false);
  };

  const flushNoSheetCursorPosition = useCallback(() => {
    noSheetCursorRafRef.current = null;
    const p = noSheetCursorPendingRef.current;
    if (!p) return;
    setNoSheetCursorHint((prev) => (prev ? { ...prev, x: p.x, y: p.y } : null));
  }, []);

  const handleNoSheetPointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>, label: string) => {
    noSheetCursorPendingRef.current = { x: e.clientX, y: e.clientY };
    setNoSheetCursorHint({ x: e.clientX, y: e.clientY, label });
  }, []);

  const handleNoSheetPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    noSheetCursorPendingRef.current = { x: e.clientX, y: e.clientY };
    if (noSheetCursorRafRef.current == null) {
      noSheetCursorRafRef.current = requestAnimationFrame(flushNoSheetCursorPosition);
    }
  }, [flushNoSheetCursorPosition]);

  const handleNoSheetPointerLeave = useCallback(() => {
    if (noSheetCursorRafRef.current != null) {
      cancelAnimationFrame(noSheetCursorRafRef.current);
      noSheetCursorRafRef.current = null;
    }
    noSheetCursorPendingRef.current = null;
    setNoSheetCursorHint(null);
  }, []);

  useEffect(() => () => {
    if (noSheetCursorRafRef.current != null) {
      cancelAnimationFrame(noSheetCursorRafRef.current);
    }
  }, []);

  const jumpToTimelineIndex = useCallback((idx: number) => {
    const clampedIdx = Math.max(0, Math.min(items.length - 1, idx));
    const entry = entryRefs.current[clampedIdx];
    if (!entry) return;

    setActiveIndex(clampedIdx);
    entry.focus({ preventScroll: true });

    const rect = entry.getBoundingClientRect();
    const targetY = window.innerHeight * VIEWPORT_TRIGGER_RATIO;
    const deltaY = rect.top - targetY;
    window.scrollBy({ top: deltaY, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isSheetMounted || isSheetVisible) return;
    const timer = window.setTimeout(() => {
      setIsSheetMounted(false);
      setSelectedIndex(-1);
      setQuoteIndex(0);
    }, SHEET_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [isSheetMounted, isSheetVisible]);

  useEffect(() => {
    if (!isSheetVisible || !selectedPanelContent || selectedPanelContent.quotes.length <= 1) return;
    const timer = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % selectedPanelContent.quotes.length);
    }, QUOTE_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [isSheetVisible, selectedPanelContent]);

  return (
    <div className="timeline" ref={containerRef}>
      <div ref={progressRef} className="timeline-progress" />
      <div ref={bgWashRef} className="timeline-bg-wash" />
      <HeaderSection />

      <div id="journey" ref={journeyAnchorRef} className="timeline-hero-anchor" />

      <div ref={sectionHeaderRef} className="timeline-section-header">
        <h1 className="timeline-hero__title" data-text={String(titleYear)}>{titleYear}</h1>
        <p className="timeline-hero__subtitle">To Now.</p>
      </div>

      <div ref={timelineInnerRef} className="timeline-inner" style={{ minHeight: `${timelineHeight}px` }}>
        <div className="timeline-rail timeline-rail--left">
          <span className="timeline-rail__label">Personal</span>
        </div>
        <div className="timeline-rail timeline-rail--right">
          <span className="timeline-rail__label">Professional</span>
        </div>

        {geometry.map((g, i) => {
          const traceEnd = traceEndYearByIdx[i];
          const traceDurationYears = Math.max(0, traceEnd - g.start);
          if (traceDurationYears <= 0) return null;
          const traceDurationPct = (traceDurationYears / yearSpanLayout) * 100;
          const traceHeightPx = Math.max(2, (traceDurationPct / 100) * timelineHeight);
          const isFocusedTrace = i === activeIndex || (activeStartYear != null && g.start === activeStartYear);
          const progressInRange = isFocusedTrace ? 1 : 0;
          return (
            <div
              key={`range-${i}`}
              className={`timeline-range timeline-range--${g.track} ${isCompactOverlapFadeIdx(i) ? 'timeline-range--under-active' : ''}`}
              style={{ top: `calc(${g.topPct}% + 10px + ${stackOffsetPx[i]}px)`, height: `${traceHeightPx}px` }}
            >
              <div
                className={`timeline-range__trace timeline-range__trace--${g.track}`}
                style={{ height: `${progressInRange * 100}%`, backgroundColor: items[i].type === 'life' ? '#ffffff' : items[i].accent }}
              />
            </div>
          );
        })}

        {items.map((item, i) => {
          const isLinkedHighlight = isLinkedWithActive(i);
          const isActive = i === activeIndex || isLinkedHighlight || (activeStartYear != null && geometry[i].start === activeStartYear);
          const isVisible = visibleSet.has(i);
          const track = geometry[i].track;
          const isCompactOverlapFade = isCompactOverlapFadeIdx(i);
          const isContentSuppressed = isContentSuppressedByActiveIdx(i) && !isCompactOverlapFade;
          const isFullUnderActiveFade = isCompactOverlapFade;
          const isGraduatedOrDsquare = i === graduatedIdx || i === dsquareIdx;
          const compactMergedLabel = 'Dsquare (+Graduated)';
          const dsquareItem = dsquareIdx >= 0 ? items[dsquareIdx] : null;
          const useCompactMergedMeta = isCompactTimeline && isGraduatedOrDsquare && !isActive && dsquareItem != null;
          const displayName = (isCompactTimeline && isGraduatedOrDsquare && !isActive) ? compactMergedLabel : item.name;
          const displayPeriod = useCompactMergedMeta ? dsquareItem.period : item.period;
          const displayType = useCompactMergedMeta ? dsquareItem.type : item.type;
          const noSheetCursorLabel = getNoDetailSheetCursorLabel(item.name);
          const blocksDetailSheet = noSheetCursorLabel != null;
          const noSheetHintId = `timeline-no-sheet-hint-${i}`;

          return (
            <div
              key={i}
              ref={(el) => { entryRefs.current[i] = el; }}
              data-index={i}
              tabIndex={0}
              className={`timeline-entry timeline-entry--${track} ${isVisible ? 'timeline-entry--visible' : ''} ${isActive ? 'timeline-entry--active' : ''} ${isFullUnderActiveFade ? 'timeline-entry--under-active' : ''} ${isContentSuppressed ? 'timeline-entry--under-active-content' : ''} ${blocksDetailSheet ? 'timeline-entry--no-sheet' : ''}`}
              aria-describedby={blocksDetailSheet ? noSheetHintId : undefined}
              style={{ top: `calc(${geometry[i].topPct}% + ${stackOffsetPx[i]}px)` }}
              onPointerEnter={
                blocksDetailSheet && noSheetCursorLabel
                  ? (e) => handleNoSheetPointerEnter(e, noSheetCursorLabel)
                  : undefined
              }
              onPointerMove={blocksDetailSheet ? handleNoSheetPointerMove : undefined}
              onPointerLeave={blocksDetailSheet ? handleNoSheetPointerLeave : undefined}
              onPointerDown={(e) => {
                setActiveIndex(i);
                openItemSheet(i);
                if (!blocksDetailSheet) {
                  (e.currentTarget as HTMLDivElement).focus();
                }
              }}
              onFocus={() => setActiveIndex(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); jumpToTimelineIndex(i + 1); return; }
                if (e.key === 'ArrowUp') { e.preventDefault(); jumpToTimelineIndex(i - 1); return; }
                if (e.key === 'Home') { e.preventDefault(); jumpToTimelineIndex(0); return; }
                if (e.key === 'End') { e.preventDefault(); jumpToTimelineIndex(items.length - 1); return; }
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveIndex(i); openItemSheet(i); }
              }}
            >
              <div className={`timeline-dot timeline-dot--${item.type}`} style={{ '--dot-color': item.type === 'life' ? '#ffffff' : item.accent } as React.CSSProperties} />
              <div className="timeline-connector" />
              <div className="timeline-content">
                <div className="timeline-heading">
                  <h3
                    className={`timeline-name ${blocksDetailSheet ? 'timeline-name--archived' : ''}`.trim()}
                  >
                    {blocksDetailSheet ? (
                      <>
                        <span className="timeline-name__label">{displayName}</span>
                        <TimelineArchiveIcon className="timeline-name__archive-icon" />
                      </>
                    ) : (
                      displayName
                    )}
                  </h3>
                  <div className="timeline-heading-meta">
                    <span className="timeline-period">{displayPeriod}</span>
                    <span className="timeline-tag timeline-tag--inline">{TAG_MAP[displayType]}</span>
                  </div>
                </div>
                <div ref={(el) => { detailRefs.current[i] = el; }} className="timeline-detail">
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              </div>
              {blocksDetailSheet ? (
                <span id={noSheetHintId} className="timeline-sr-only">
                  {getNoDetailSheetAriaDescription(item.name)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <DetailSheet
        isMounted={isSheetMounted}
        isVisible={isSheetVisible}
        selectedItem={selectedItem}
        selectedPanelContent={selectedPanelContent}
        activeQuote={activeQuote}
        quoteIndex={quoteIndex}
        tagLabel={selectedItem ? TAG_MAP[selectedItem.type] : ''}
        onClose={closeItemSheet}
      />

      {noSheetCursorHint != null
        ? createPortal(
            <div
              className="timeline-no-sheet-cursor-hint"
              style={{ left: noSheetCursorHint.x, top: noSheetCursorHint.y }}
              aria-hidden
            >
              {noSheetCursorHint.label}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default Timeline;
