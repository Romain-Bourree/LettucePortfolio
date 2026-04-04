import gsap from 'gsap';

export function segmentGraphemes(text: string): string[] {
  const IntlWithSeg = Intl as typeof Intl & {
    Segmenter?: new (locales: string, options: { granularity: string }) => {
      segment(input: string): Iterable<{ segment: string }>;
    };
  };
  const Seg = IntlWithSeg.Segmenter;
  if (typeof Seg === 'function') {
    return Array.from(new Seg('en', { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

function keepCharStableWhileScrambling(ch: string): boolean {
  return /\s/u.test(ch);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildRevealFrame(graphemes: string[], p: number, pool: string): string {
  let out = '';
  const n = graphemes.length;
  const pl = pool.length || 1;
  for (let i = 0; i < n; i++) {
    const ch = graphemes[i];
    if (keepCharStableWhileScrambling(ch)) {
      out += ch;
      continue;
    }
    if (p >= i + 1) {
      out += ch;
    } else {
      out += pool[Math.floor(Math.random() * pl)]!;
    }
  }
  return out;
}

function buildRevealFrameHTML(graphemes: string[], p: number, pool: string): string {
  let out = '';
  const n = graphemes.length;
  const pl = pool.length || 1;
  for (let i = 0; i < n; i++) {
    const ch = graphemes[i];
    if (keepCharStableWhileScrambling(ch) || p >= i + 1) {
      out += escapeHtml(ch);
    } else {
      const scrambled = pool[Math.floor(Math.random() * pl)]!;
      const toneClass =
        scrambled === '0'
          ? ' grapheme-reveal__noise--zero'
          : scrambled === '1'
            ? ' grapheme-reveal__noise--one'
            : '';
      out += `<span class="grapheme-reveal__noise${toneClass}">${escapeHtml(scrambled)}</span>`;
    }
  }
  return out;
}

export type GraphemeRevealState = { p: number };

export function runGraphemeReveal(options: {
  el: HTMLElement;
  toText: string;
  pool?: string;
  animState: GraphemeRevealState;
  onComplete?: () => void;
  /** Keeps `data-text` in sync with the plain-text scramble (e.g. title `h2` + `::after`). */
  dataTextSyncEl?: HTMLElement | null;
}): gsap.core.Tween {
  const { el, toText, pool = '01', animState, onComplete, dataTextSyncEl } = options;
  const graphemes = segmentGraphemes(toText);
  const n = graphemes.length;

  const syncDataText = (p: number) => {
    if (dataTextSyncEl) {
      dataTextSyncEl.setAttribute('data-text', buildRevealFrame(graphemes, p, pool));
    }
  };

  gsap.killTweensOf(animState);
  animState.p = 0;
  el.innerHTML = buildRevealFrameHTML(graphemes, 0, pool);
  syncDataText(0);

  const duration = Math.min(2.4, 0.5 + n * 0.01);

  return gsap.to(animState, {
    p: n,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.innerHTML = buildRevealFrameHTML(graphemes, animState.p, pool);
      syncDataText(animState.p);
    },
    onComplete: () => {
      el.textContent = toText;
      if (dataTextSyncEl) {
        dataTextSyncEl.setAttribute('data-text', toText);
      }
      onComplete?.();
    },
  });
}
