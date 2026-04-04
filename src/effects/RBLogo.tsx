import { useEffect, useId, useRef, useState, type SVGProps } from 'react';
import gsap from 'gsap';

const TILE_SIZE = 9.4;
const DEFAULT_GRAVITY = 1800;
const TILE_COLOR = '#121212';

const DARK_TILES: [number, number][] = [
  [9, 46.6], [9, 37.2], [9, 27.8], [9, 18.4], [9, 9],
  [18.4, 9], [27.8, 9], [27.8, 18.4], [18.4, 27.8],
  [27.8, 37.2], [27.8, 46.6],
  [46.2, 9], [46.2, 18.4], [46.2, 27.8], [46.2, 37.2], [46.2, 46.6],
  [55.6, 9], [65, 9], [65, 18.4], [65, 37.2], [65, 46.6],
  [55.6, 46.6], [55.6, 27.8],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRhythm(count: number): number[] {
  const delays: number[] = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    delays.push(cursor);
    const progress = i / Math.max(count - 1, 1);
    const baseGap = 0.04 + progress * 0.51;
    const jitter = Math.random() * (0.05 + progress * 0.25);
    cursor += baseGap + jitter;
  }
  return delays;
}

interface TileData {
  rect: SVGRectElement;
  finalY: number;
}

export interface RBLogoAnimationConfig {
  gravity?: number;
  dropHeight?: number;
  dropHeightStep?: number;
  stackPause?: number;
  tileColor?: string;
  backgroundColor?: string;
}

export interface RBLogoProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  animation?: RBLogoAnimationConfig;
  replay?: boolean;
  onAnimationComplete?: () => void;
}

interface RBLogoALTProps extends SVGProps<SVGSVGElement> {
  patternId: string;
}

const LOGO_SHADOW_DURATION_S = 120;
const LOGO_SHADOW_TRAVEL_PX = 320;

export const RBLogoALT = ({ patternId, ...props }: RBLogoALTProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="83" height="65" fill="none" viewBox="0 0 83 65" {...props}>
    <rect x="0" y="0" width="83" height="65" fill="#fff" />
    <g opacity={1} transform="translate(2.1 2.1)">
      <path
        fill={`url(#${patternId})`}
        d="M9 46.6h9.4V56H9zm0-9.4h9.4v9.4H9zm0-9.4h9.4v9.4H9zm0-9.4h9.4v9.4H9zM9 9h9.4v9.4H9zm9.4 0h9.4v9.4h-9.4zm9.4 0h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm-9.4 9.4h9.4v9.4h-9.4zm9.4 9.4h9.4v9.4h-9.4zm0 9.4h9.4V56h-9.4zM46.2 9h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm0 9.4h9.4V56h-9.4zM55.6 9H65v9.4h-9.4zM65 9h9.4v9.4H65zm0 9.4h9.4v9.4H65zm0 18.8h9.4v9.4H65zm0 9.4h9.4V56H65zm-9.4 0H65V56h-9.4zm0-18.8H65v9.4h-9.4z"
      />
    </g>
    <path
      fill="#121212"
      d="M9 46.6h9.4V56H9zm0-9.4h9.4v9.4H9zm0-9.4h9.4v9.4H9zm0-9.4h9.4v9.4H9zM9 9h9.4v9.4H9zm9.4 0h9.4v9.4h-9.4zm9.4 0h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm-9.4 9.4h9.4v9.4h-9.4zm9.4 9.4h9.4v9.4h-9.4zm0 9.4h9.4V56h-9.4zM46.2 9h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm0 9.4h9.4v9.4h-9.4zm0 9.4h9.4V56h-9.4zM55.6 9H65v9.4h-9.4zM65 9h9.4v9.4H65zm0 9.4h9.4v9.4H65zm0 18.8h9.4v9.4H65zm0 9.4h9.4V56H65zm-9.4 0H65V56h-9.4zm0-18.8H65v9.4h-9.4z"
    />
  </svg>
);

export const RBLogo = ({
  width = 166,
  height = 130,
  animation = {},
  replay,
  onAnimationComplete,
  ...props
}: RBLogoProps) => {
  const lineShadowPatternId = useId().replace(/:/g, '');
  const lineShadowPatternRef = useRef<SVGPatternElement>(null);
  const darkGroupRef = useRef<SVGGElement>(null);
  const animatedGroupRef = useRef<SVGGElement>(null);
  const staticGroupRef = useRef<SVGGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const fadeTlRef = useRef<gsap.core.Timeline | null>(null);
  const shadowTlRef = useRef<gsap.core.Tween | null>(null);
  /** Bumps on cleanup so fade / main `onComplete` from a superseded run cannot fire `onAnimationComplete`. */
  const logoIntroRunRef = useRef(0);
  const [isFinalState, setIsFinalState] = useState(false);

  const {
    gravity = DEFAULT_GRAVITY,
    dropHeight = 100,
    dropHeightStep = 28,
    stackPause = 0.04,
    tileColor = TILE_COLOR,
    backgroundColor = '#ffffff',
  } = animation;

  useEffect(() => {
    const group = darkGroupRef.current;
    const animatedGroup = animatedGroupRef.current;
    const staticGroup = staticGroupRef.current;
    if (!group || !animatedGroup || !staticGroup) return;

    const runId = ++logoIntroRunRef.current;

    tlRef.current?.kill();
    fadeTlRef.current?.kill();
    fadeTlRef.current = null;
    shadowTlRef.current?.kill();
    group.innerHTML = '';
    setIsFinalState(false);
    gsap.set(animatedGroup, { opacity: 1 });
    gsap.set(staticGroup, { opacity: 0 });

    const pattern = lineShadowPatternRef.current;
    if (pattern) {
      gsap.set(pattern, { attr: { x: 0, y: 0 } });
      shadowTlRef.current = gsap.to(pattern, {
        attr: { x: LOGO_SHADOW_TRAVEL_PX, y: -LOGO_SHADOW_TRAVEL_PX },
        duration: LOGO_SHADOW_DURATION_S,
        ease: 'none',
        repeat: -1,
      });
    }

    const colMap: Record<number, TileData[]> = {};

    for (const [x, y] of DARK_TILES) {
      if (!colMap[x]) colMap[x] = [];

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(x));
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', String(TILE_SIZE));
      rect.setAttribute('height', String(TILE_SIZE));
      rect.setAttribute('fill', tileColor);
      group.appendChild(rect);
      colMap[x].push({ rect, finalY: y });
    }

    const cols = Object.values(colMap).map((col) => col.sort((a, b) => b.finalY - a.finalY));
    const shuffledCols = shuffle(cols);
    const rhythm = generateRhythm(shuffledCols.length);
    tlRef.current = gsap.timeline();

    shuffledCols.forEach((col, colIndex) => {
      const colRelease = rhythm[colIndex];
      let stackCursor = colRelease;

      col.forEach((tile, tileIndex) => {
        const { rect } = tile;
        const cx = parseFloat(rect.getAttribute('x') || '0') + TILE_SIZE / 2;
        const cy = parseFloat(rect.getAttribute('y') || '0') + TILE_SIZE / 2;
        rect.style.transformOrigin = `${cx}px ${cy}px`;

        const drop = dropHeight + tileIndex * dropHeightStep + Math.random() * 16;
        const fallDuration = Math.sqrt((2 * drop) / gravity);

        gsap.set(rect, { y: -drop, opacity: 1 });

        tlRef.current?.to(
          rect,
          {
            y: 0,
            duration: fallDuration,
            ease: 'power2.in',
          },
          stackCursor
        );

        stackCursor += fallDuration + stackPause + Math.random() * 0.06;
      });
    });

    tlRef.current.eventCallback('onComplete', () => {
      if (runId !== logoIntroRunRef.current) return;
      setIsFinalState(true);
      fadeTlRef.current?.kill();
      const fadeTl = gsap.timeline();
      fadeTlRef.current = fadeTl;
      fadeTl.to(animatedGroup, { opacity: 0, duration: 0.28, ease: 'power2.out' });
      fadeTl.to(staticGroup, { opacity: 1, duration: 0.28, ease: 'power2.out' }, 0);
      fadeTl.eventCallback('onComplete', () => {
        if (runId !== logoIntroRunRef.current) return;
        onAnimationComplete?.();
      });
    });

    return () => {
      logoIntroRunRef.current += 1;
      tlRef.current?.kill();
      fadeTlRef.current?.kill();
      fadeTlRef.current = null;
      shadowTlRef.current?.kill();
    };
  }, [replay, gravity, dropHeight, dropHeightStep, stackPause, tileColor, onAnimationComplete]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 83 65"
      style={{ overflow: 'visible' }}
      {...props}
    >
      <defs>
        <pattern
          ref={lineShadowPatternRef}
          id={lineShadowPatternId}
          x="0"
          y="0"
          width="2.2"
          height="2.2"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <rect x="0" y="0" width="2.2" height="2.2" fill="transparent" />
          <rect x="0" y="0" width="0.5" height="2.2" fill="#121212" />
        </pattern>
      </defs>
      <g ref={animatedGroupRef}>
        <rect x="0" y="0" width="83" height="65" fill={backgroundColor} />
        <g ref={darkGroupRef} />
      </g>
      <g ref={staticGroupRef} style={{ opacity: isFinalState ? 1 : 0 }}>
        <RBLogoALT patternId={lineShadowPatternId} />
      </g>
    </svg>
  );
};

export default RBLogo;
