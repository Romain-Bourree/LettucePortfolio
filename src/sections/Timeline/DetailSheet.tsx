import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { runGraphemeReveal, type GraphemeRevealState } from '../../effects/graphemeReveal';
import type { PanelEntry, PanelQuote } from '../../features/timeline';
import { DetailSheetCarousel, type DetailSheetCarouselSlide } from './DetailSheetCarousel';
import './DetailSheet.css';

function quoteStableKey(quote: PanelQuote): string {
  return `${quote.author}-${quote.text.slice(0, 24)}`;
}

/** Used when a panel has no `gallery` and the timeline item has no `image`. */
const DEFAULT_DETAIL_GALLERY: DetailSheetCarouselSlide[] = [
  { src: 'https://picsum.photos/seed/lp-ds-1/1200/800', alt: 'Placeholder', code: '# 01' },
  { src: 'https://picsum.photos/seed/lp-ds-2/1200/800', alt: 'Placeholder', code: '# 02' },
  { src: 'https://picsum.photos/seed/lp-ds-3/1200/800', alt: 'Placeholder', code: '# 03' },
  { src: 'https://picsum.photos/seed/lp-ds-4/1200/800', alt: 'Placeholder', code: '# 04' },
  { src: 'https://picsum.photos/seed/lp-ds-5/1200/800', alt: 'Placeholder', code: '# 05' },
  { src: 'https://picsum.photos/seed/lp-ds-6/1200/800', alt: 'Placeholder', code: '# 06' },
];

interface SheetItem {
  name: string;
  period: string;
  type: 'life' | 'career' | 'side';
  color: string;
  accent: string;
  image?: string;
}

interface DetailSheetProps {
  isMounted: boolean;
  isVisible: boolean;
  selectedItem: SheetItem | null;
  selectedPanelContent: PanelEntry | null;
  activeQuote: PanelQuote | null;
  quoteIndex: number;
  tagLabel: string;
  onClose: () => void;
}

function splitQuoteAuthor(author: string): { name: string; title: string } {
  const [namePart, ...rest] = author.split('·');
  return {
    name: namePart.trim(),
    title: rest.join('·').trim(),
  };
}

const DetailSheet: React.FC<DetailSheetProps> = ({
  isMounted: isSheetDomMounted,
  isVisible,
  selectedItem,
  selectedPanelContent,
  activeQuote: _activeQuote,
  quoteIndex: _quoteIndex,
  tagLabel,
  onClose,
}) => {
  const revealStatesRef = useRef<Map<string, GraphemeRevealState>>(new Map());
  const titleHostRef = useRef<HTMLHeadingElement>(null);
  const titleSpanRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const periodRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const headingTldrRef = useRef<HTMLHeadingElement>(null);
  const headingShippedRef = useRef<HTMLHeadingElement>(null);
  const headingVoicesRef = useRef<HTMLHeadingElement>(null);
  const tldrRef = useRef<HTMLParagraphElement>(null);
  const shippedTitleRefs = useRef<Map<string, HTMLParagraphElement | null>>(new Map());
  const shippedBodyRefs = useRef<Map<string, HTMLParagraphElement | null>>(new Map());
  const quoteTextRefs = useRef<Map<string, HTMLParagraphElement | null>>(new Map());
  const quoteAttributionRefs = useRef<Map<string, HTMLParagraphElement | null>>(new Map());

  const getRevealState = (key: string): GraphemeRevealState => {
    const m = revealStatesRef.current;
    let s = m.get(key);
    if (!s) {
      s = { p: 0 };
      m.set(key, s);
    }
    return s;
  };

  const tldrText = selectedPanelContent?.tldr ?? '';
  const projectUrl = selectedPanelContent?.projectUrl;
  const shipped = selectedPanelContent?.shipped ?? [];
  const quotes = selectedPanelContent?.quotes ?? [];
  const gallerySlides =
    selectedPanelContent?.gallery && selectedPanelContent.gallery.length > 0
      ? selectedPanelContent.gallery
      : selectedItem?.image
        ? [{ src: selectedItem.image, alt: selectedItem.name }]
        : DEFAULT_DETAIL_GALLERY;

  useEffect(() => {
    const statesMap = revealStatesRef.current;
    return () => {
      statesMap.forEach((s) => gsap.killTweensOf(s));
    };
  }, []);

  useEffect(() => {
    if (!isSheetDomMounted || !isVisible || !selectedPanelContent || !selectedItem) return;

    revealStatesRef.current.forEach((s) => gsap.killTweensOf(s));

    const tldrTextInner = selectedPanelContent.tldr;
    const shippedInner = selectedPanelContent.shipped ?? [];
    const quotesInner = selectedPanelContent.quotes;

    const titleDisplayUpper = selectedItem.name.toUpperCase();
    type RevealJob = {
      el: HTMLElement | null;
      text: string;
      key: string;
      dataTextSyncEl?: HTMLElement | null;
    };
    const jobs: RevealJob[] = [];

    jobs.push({
      el: titleSpanRef.current,
      text: titleDisplayUpper,
      key: 'sheet-title',
      dataTextSyncEl: titleHostRef.current,
    });

    if (selectedPanelContent.subtitle) {
      jobs.push({
        el: subtitleRef.current,
        text: selectedPanelContent.subtitle,
        key: 'sheet-subtitle',
      });
    }

    jobs.push({ el: periodRef.current, text: selectedItem.period, key: 'sheet-period' });
    jobs.push({ el: tagRef.current, text: tagLabel, key: 'sheet-tag' });

    jobs.push({ el: headingTldrRef.current, text: 'TLDR', key: 'sheet-h-tldr' });
    if (tldrTextInner) {
      jobs.push({ el: tldrRef.current, text: tldrTextInner, key: 'sheet-tldr' });
    }

    if (shippedInner.length > 0) {
      jobs.push({ el: headingShippedRef.current, text: 'SHIPPED', key: 'sheet-h-shipped' });
      for (const item of shippedInner) {
        jobs.push({
          el: shippedTitleRefs.current.get(item.title) ?? null,
          text: item.title,
          key: `sheet-shipped-t-${item.title}`,
        });
        jobs.push({
          el: shippedBodyRefs.current.get(item.title) ?? null,
          text: item.body,
          key: `sheet-shipped-b-${item.title}`,
        });
      }
    }

    if (quotesInner.length > 0) {
      jobs.push({ el: headingVoicesRef.current, text: 'VOICES', key: 'sheet-h-voices' });
      for (const quote of quotesInner) {
        const qk = quoteStableKey(quote);
        const { name, title } = splitQuoteAuthor(quote.author);
        const attribution = `${name}${title ? ` · ${title}` : ''}`;
        jobs.push({
          el: quoteTextRefs.current.get(qk) ?? null,
          text: `\u201C${quote.text}\u201D`,
          key: `sheet-quote-t-${qk}`,
        });
        jobs.push({
          el: quoteAttributionRefs.current.get(qk) ?? null,
          text: attribution,
          key: `sheet-quote-a-${qk}`,
        });
      }
    }

    for (const { el, text, key, dataTextSyncEl } of jobs) {
      if (!el || !text) continue;
      runGraphemeReveal({
        el,
        toText: text,
        pool: '01',
        animState: getRevealState(key),
        dataTextSyncEl: dataTextSyncEl ?? undefined,
      });
    }
  }, [isSheetDomMounted, isVisible, selectedPanelContent, selectedItem, tagLabel]);

  if (!isSheetDomMounted || !selectedItem || !selectedPanelContent) return null;

  const titleDisplay = selectedItem.name.toUpperCase();

  return (
    <>
      <button
        type="button"
        className={`timeline-sheet-backdrop ${isVisible ? 'timeline-sheet-backdrop--open' : ''}`}
        aria-label="Close timeline details panel"
        onClick={onClose}
      />
      <aside className={`timeline-sheet ${isVisible ? 'timeline-sheet--open' : ''}`} aria-live="polite">
        <div className="timeline-sheet__scroll">
          <div
            className="timeline-sheet__inner"
            style={{ '--timeline-sheet-accent': selectedItem.accent } as React.CSSProperties}
          >
            <header className="timeline-sheet__header">
              <div className="timeline-sheet__title-row">
                <h2
                  ref={titleHostRef}
                  className="timeline-hero__title timeline-sheet__main-title"
                  data-text={titleDisplay}
                >
                  <span ref={titleSpanRef}>{titleDisplay}</span>
                </h2>
                <div className="timeline-sheet__header-actions">
                  {projectUrl ? (
                    <a
                      href={projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="timeline-sheet__close timeline-sheet__close--icon-only"
                      aria-label={`Open ${selectedItem.name} project link in a new tab`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="timeline-sheet__close-icon"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                        />
                      </svg>
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="timeline-sheet__close"
                    onClick={onClose}
                    aria-label="Close timeline details panel"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="timeline-sheet__sub-row">
                {selectedPanelContent.subtitle ? (
                  <p ref={subtitleRef} className="timeline-sheet__subtitle">
                    {selectedPanelContent.subtitle}
                  </p>
                ) : (
                  <span className="timeline-sheet__subtitle-spacer" aria-hidden />
                )}
                <div className="timeline-sheet__meta">
                  <span ref={periodRef} className="timeline-period timeline-sheet__period">
                    {selectedItem.period}
                  </span>
                  <span ref={tagRef} className="timeline-tag timeline-tag--inline timeline-sheet__type-tag">
                    {tagLabel}
                  </span>
                </div>
              </div>
            </header>

            <div className="timeline-sheet__media">
              {gallerySlides.length > 0 ? (
                <DetailSheetCarousel
                  key={selectedItem.name}
                  images={gallerySlides}
                  isActive={isVisible}
                />
              ) : (
                <div
                  className="timeline-sheet__media-placeholder"
                  style={{ backgroundColor: selectedItem.color }}
                >
                  <span>{selectedItem.name}</span>
                </div>
              )}
            </div>

            <div className="timeline-sheet__body">
              <section className="timeline-sheet__block">
                <h3 ref={headingTldrRef} className="timeline-sheet__section-heading">
                  TLDR
                </h3>
                <p ref={tldrRef} className="timeline-sheet__tldr">
                  {tldrText}
                </p>
              </section>

              {shipped.length > 0 && (
                <>
                  <hr className="timeline-sheet__rule" />
                  <section className="timeline-sheet__block">
                    <h3 ref={headingShippedRef} className="timeline-sheet__section-heading">
                      SHIPPED
                    </h3>
                    <ul className="timeline-sheet__shipped">
                      {shipped.map((item) => (
                        <li key={item.title} className="timeline-sheet__shipped-item">
                          <span className="timeline-sheet__shipped-arrow" aria-hidden>
                            →
                          </span>
                          <div className="timeline-sheet__shipped-copy">
                            <p
                              ref={(el) => {
                                if (el) shippedTitleRefs.current.set(item.title, el);
                                else shippedTitleRefs.current.delete(item.title);
                              }}
                              className="timeline-sheet__shipped-title"
                            >
                              {item.title}
                            </p>
                            <p
                              ref={(el) => {
                                if (el) shippedBodyRefs.current.set(item.title, el);
                                else shippedBodyRefs.current.delete(item.title);
                              }}
                              className="timeline-sheet__shipped-body"
                            >
                              {item.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}

              {quotes.length > 0 && (
                <>
                  <hr className="timeline-sheet__rule" />
                  <section className="timeline-sheet__block">
                    <h3 ref={headingVoicesRef} className="timeline-sheet__section-heading">
                      VOICES
                    </h3>
                    <ul className="timeline-sheet__voices">
                      {quotes.map((quote) => {
                        const { name, title } = splitQuoteAuthor(quote.author);
                        const qk = quoteStableKey(quote);
                        return (
                          <li key={qk} className="timeline-sheet__voice">
                            <p
                              ref={(el) => {
                                if (el) quoteTextRefs.current.set(qk, el);
                                else quoteTextRefs.current.delete(qk);
                              }}
                              className="timeline-sheet__voice-quote"
                            >
                              &ldquo;{quote.text}&rdquo;
                            </p>
                            <p
                              ref={(el) => {
                                if (el) quoteAttributionRefs.current.set(qk, el);
                                else quoteAttributionRefs.current.delete(qk);
                              }}
                              className="timeline-sheet__voice-attribution"
                            >
                              {name}
                              {title ? ` · ${title}` : ''}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DetailSheet;
