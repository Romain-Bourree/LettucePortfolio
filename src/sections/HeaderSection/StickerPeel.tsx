import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useId,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import { InertiaPlugin } from "gsap/dist/InertiaPlugin";

import { prefersReducedMotion } from "../../features/headerSection/helpers";

import "./StickerPeel.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

/** Must match `transition` duration on `.sticker-main` / `.sticker-flap` clip-path (seconds → ms). */
const INTRO_PEEL_CLIP_TRANSITION_MS = 600;

interface StickerPeelProps {
  imageSrc: string;
  rotate?: number;
  peelBackHoverPct?: number;
  peelBackActivePct?: number;
  peelEasing?: string;
  peelHoverEasing?: string;
  width?: number;
  shadowIntensity?: number;
  /** Specular “shine” strength. `0` turns it off. Typical subtle range ~0.02–0.08. */
  lightingIntensity?: number;
  initialPosition?: "center" | "random" | { x: number; y: number };
  /** Rotation (deg) of the peel hinge. Ignored when followPointerEntry is true (after first pointer entry). */
  peelDirection?: number;
  /** When true, peel opens from the edge the pointer crossed (top / right / bottom / left). */
  followPointerEntry?: boolean;
  /**
   * When this becomes true, run the intro peel: animate to the hover peel pose, hold, then settle flat.
   * Use the same flag as the title step (e.g. `isTitleVisible`) so both start together.
   * Skipped when `prefers-reduced-motion: reduce`.
   */
  introPeelWhenVisible?: boolean;
  /** How long to hold the peeled pose after the peel-open animation finishes (ms). */
  introPeelHoldMs?: number;
  className?: string;
}

/** Degrees so the default top-edge peel aligns with the side the pointer entered from. */
function peelDegreesFromPointerInRect(
  clientX: number,
  clientY: number,
  rect: DOMRectReadOnly,
): number {
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  const distTop = py;
  const distRight = rect.width - px;
  const distBottom = rect.height - py;
  const distLeft = px;

  const candidates: readonly [number, number][] = [
    [distTop, 0],
    [distRight, 90],
    [distBottom, 180],
    [distLeft, -90],
  ];

  let best = candidates[0];
  for (const c of candidates) {
    if (c[0] < best[0] - 0.5) {
      best = c;
    }
  }
  return best[1];
}

interface CSSVars extends CSSProperties {
  "--sticker-rotate"?: string;
  "--sticker-p"?: string;
  "--sticker-peelback-hover"?: string;
  "--sticker-peelback-active"?: string;
  "--sticker-peel-easing"?: string;
  "--sticker-peel-hover-easing"?: string;
  "--sticker-width"?: string;
  "--sticker-shadow-opacity"?: number;
  "--sticker-lighting-constant"?: number;
  "--peel-direction"?: string;
  "--sticker-start"?: string;
  "--sticker-end"?: string;
}

export default function StickerPeel({
  imageSrc,
  rotate = 30,
  peelBackHoverPct = 30,
  peelBackActivePct = 40,
  peelEasing = "power3.out",
  peelHoverEasing = "power2.out",
  width = 200,
  shadowIntensity = 0.6,
  lightingIntensity = 0.05,
  initialPosition = "center",
  peelDirection = 0,
  followPointerEntry = false,
  introPeelWhenVisible = false,
  introPeelHoldMs = 220,
  className = "",
}: StickerPeelProps) {
  const filterId = useId().replace(/:/g, "");
  const hasSpecular = lightingIntensity > 0;
  const flapSpecular = lightingIntensity * 2;
  const [livePeelDirection, setLivePeelDirection] = useState(peelDirection);
  const effectivePeelDirection = followPointerEntry
    ? livePeelDirection
    : peelDirection;

  const containerRef = useRef<HTMLDivElement>(null);
  const dragTargetRef = useRef<HTMLDivElement>(null);
  const pointLightRef = useRef<SVGFEPointLightElement>(null);
  const pointLightFlippedRef = useRef<SVGFEPointLightElement>(null);
  const draggableInstanceRef = useRef<Draggable | null>(null);

  const defaultPadding = 12;

  type IntroPeelPhase = "peeled" | "rest";
  const [introPeelPhase, setIntroPeelPhase] = useState<IntroPeelPhase>("rest");

  useLayoutEffect(() => {
    if (!introPeelWhenVisible) return;
    if (prefersReducedMotion()) return;

    setIntroPeelPhase("peeled");
    const settleAfterMs = INTRO_PEEL_CLIP_TRANSITION_MS + introPeelHoldMs;
    const t = window.setTimeout(() => setIntroPeelPhase("rest"), settleAfterMs);
    return () => window.clearTimeout(t);
  }, [introPeelWhenVisible, introPeelHoldMs]);

  const isInitialCenter = initialPosition === "center";
  const initialX =
    !isInitialCenter &&
    typeof initialPosition === "object" &&
    initialPosition.x !== undefined
      ? initialPosition.x
      : 0;
  const initialY =
    !isInitialCenter &&
    typeof initialPosition === "object" &&
    initialPosition.y !== undefined
      ? initialPosition.y
      : 0;

  useLayoutEffect(() => {
    const target = dragTargetRef.current;
    if (!target) return;

    const boundsEl = target.parentNode as HTMLElement;

    const draggable = Draggable.create(target, {
      type: "x,y",
      bounds: boundsEl,
      inertia: true,
      onDrag(this: Draggable) {
        const rot = gsap.utils.clamp(-24, 24, this.deltaX * 0.4);
        gsap.to(target, { rotation: rot, duration: 0.15, ease: "power1.out" });
      },
      onDragEnd() {
        const rotationEase = "power2.out";
        const duration = 0.8;
        gsap.to(target, { rotation: 0, duration, ease: rotationEase });
      },
    });

    draggableInstanceRef.current = draggable[0];

    if (!isInitialCenter) {
      gsap.set(target, { x: initialX, y: initialY });
      draggableInstanceRef.current.update(true);
    }

    const handleResize = () => {
      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.update();

        const currentX = gsap.getProperty(target, "x") as number;
        const currentY = gsap.getProperty(target, "y") as number;

        const boundsRect = boundsEl.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const maxX = boundsRect.width - targetRect.width;
        const maxY = boundsRect.height - targetRect.height;

        const newX = Math.max(0, Math.min(currentX, maxX));
        const newY = Math.max(0, Math.min(currentY, maxY));

        if (newX !== currentX || newY !== currentY) {
          gsap.to(target, {
            x: newX,
            y: newY,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.kill();
        draggableInstanceRef.current = null;
      }
    };
  }, [isInitialCenter, initialX, initialY]);

  useEffect(() => {
    if (!followPointerEntry) {
      setLivePeelDirection(peelDirection);
    }
  }, [followPointerEntry, peelDirection]);

  const updatePeelFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!followPointerEntry) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      setLivePeelDirection(
        peelDegreesFromPointerInRect(clientX, clientY, rect),
      );
    },
    [followPointerEntry],
  );

  useEffect(() => {
    if (!hasSpecular) return;

    const updateLight = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;

      if (pointLightRef.current) {
        gsap.set(pointLightRef.current, { attr: { x, y } });
      }

      const normalizedAngle = Math.abs(effectivePeelDirection % 360);
      if (pointLightFlippedRef.current) {
        if (normalizedAngle !== 180) {
          gsap.set(pointLightFlippedRef.current, {
            attr: { x, y: rect.height - y },
          });
        } else {
          gsap.set(pointLightFlippedRef.current, {
            attr: { x: -1000, y: -1000 },
          });
        }
      }
    };

    const container = containerRef.current;
    const eventType = "mousemove";

    if (container) {
      container.addEventListener(eventType, updateLight);
      return () => container.removeEventListener(eventType, updateLight);
    }
  }, [effectivePeelDirection, hasSpecular]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => {
      container.classList.add("touch-active");
    };

    const handleTouchEnd = () => {
      container.classList.remove("touch-active");
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  const cssVars: CSSVars = useMemo(
    () => ({
      "--sticker-rotate": `${rotate}deg`,
      "--sticker-p": `${defaultPadding}px`,
      "--sticker-peelback-hover": `${peelBackHoverPct}%`,
      "--sticker-peelback-active": `${peelBackActivePct}%`,
      "--sticker-peel-easing": peelEasing,
      "--sticker-peel-hover-easing": peelHoverEasing,
      "--sticker-width": `${width}px`,
      "--sticker-shadow-opacity": shadowIntensity,
      "--sticker-lighting-constant": lightingIntensity,
      "--peel-direction": `${effectivePeelDirection}deg`,
      "--sticker-start": `calc(-1 * ${defaultPadding}px)`,
      "--sticker-end": `calc(100% + ${defaultPadding}px)`,
    }),
    [
      rotate,
      peelBackHoverPct,
      peelBackActivePct,
      peelEasing,
      peelHoverEasing,
      width,
      shadowIntensity,
      lightingIntensity,
      effectivePeelDirection,
      defaultPadding,
    ],
  );

  const stickerMainStyle: CSSProperties = {
    clipPath:
      "polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end))",
    transition: "clip-path 0.6s ease-out",
    filter: shadowIntensity > 0 ? `url(#${filterId}-dropShadow)` : "none",
    willChange: "clip-path, transform",
  };

  const flapStyle: CSSProperties = {
    clipPath:
      "polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-start) var(--sticker-start))",
    top: "calc(-100% - var(--sticker-p) - var(--sticker-p))",
    transform: "scaleY(-1)",
    transition: "all 0.6s ease-out",
    willChange: "clip-path, transform",
  };

  const peelRotationTransition = followPointerEntry
    ? "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)"
    : undefined;

  const imageStyle: CSSProperties = {
    transform: `rotate(calc(${rotate}deg - ${effectivePeelDirection}deg))`,
    transition: peelRotationTransition,
    width: `${width}px`,
    height: "auto",
    aspectRatio: "1",
    objectFit: "contain",
    verticalAlign: "top",
  };

  const shadowImageStyle: CSSProperties = {
    ...imageStyle,
    filter: `url(#${filterId}-expandAndFill)`,
  };

  const scopedStyle = `
    .sticker-peel-${filterId}:hover .sticker-main,
    .sticker-peel-${filterId}.touch-active .sticker-main {
      clip-path: polygon(var(--sticker-start) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end)) !important;
    }
    .sticker-peel-${filterId}:hover .sticker-flap,
    .sticker-peel-${filterId}.touch-active .sticker-flap {
      clip-path: polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-start) var(--sticker-peelback-hover)) !important;
      top: calc(-100% + 2 * var(--sticker-peelback-hover) - 1px) !important;
    }
    .sticker-peel-${filterId}:active .sticker-main {
      clip-path: polygon(var(--sticker-start) var(--sticker-peelback-active), var(--sticker-end) var(--sticker-peelback-active), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end)) !important;
    }
    .sticker-peel-${filterId}:active .sticker-flap {
      clip-path: polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-peelback-active), var(--sticker-start) var(--sticker-peelback-active)) !important;
      top: calc(-100% + 2 * var(--sticker-peelback-active) - 1px) !important;
    }
    .sticker-peel-${filterId}.sticker-peel--intro-mount .sticker-main {
      clip-path: polygon(var(--sticker-start) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end)) !important;
    }
    .sticker-peel-${filterId}.sticker-peel--intro-mount .sticker-flap {
      clip-path: polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-start) var(--sticker-peelback-hover)) !important;
      top: calc(-100% + 2 * var(--sticker-peelback-hover) - 1px) !important;
    }
  `;

  return (
    <div
      className={`sticker-peel-root ${className}`}
      ref={dragTargetRef}
      style={cssVars}
      role="img"
      aria-label="Draggable sticker — peel corner on hover or press"
    >
      <style dangerouslySetInnerHTML={{ __html: scopedStyle }} />

      <svg className="sticker-svg-defs" aria-hidden>
        <defs>
          {hasSpecular ? (
            <>
              <filter id={`${filterId}-pointLight`}>
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feSpecularLighting
                  result="spec"
                  in="blur"
                  specularExponent={120}
                  specularConstant={lightingIntensity}
                  lightingColor="white"
                >
                  <fePointLight ref={pointLightRef} x={100} y={100} z={300} />
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceGraphic" result="lit" />
                <feComposite in="lit" in2="SourceAlpha" operator="in" />
              </filter>

              <filter id={`${filterId}-pointLightFlipped`}>
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feSpecularLighting
                  result="spec"
                  in="blur"
                  specularExponent={120}
                  specularConstant={flapSpecular}
                  lightingColor="white"
                >
                  <fePointLight
                    ref={pointLightFlippedRef}
                    x={100}
                    y={100}
                    z={300}
                  />
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceGraphic" result="lit" />
                <feComposite in="lit" in2="SourceAlpha" operator="in" />
              </filter>
            </>
          ) : null}

          {shadowIntensity > 0 ? (
            <filter id={`${filterId}-dropShadow`}>
              <feDropShadow
                dx="2"
                dy="4"
                stdDeviation={3 * shadowIntensity}
                floodColor="black"
                floodOpacity={shadowIntensity}
              />
            </filter>
          ) : null}

          <filter id={`${filterId}-expandAndFill`}>
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shape" />
            <feFlood floodColor="rgb(179,179,179)" result="flood" />
            <feComposite operator="in" in="flood" in2="shape" />
          </filter>
        </defs>
      </svg>

      <div
        className={`sticker-container sticker-peel-${filterId}${
          introPeelPhase === "peeled" ? " sticker-peel--intro-mount" : ""
        }`}
        ref={containerRef}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse" || e.pointerType === "pen") {
            updatePeelFromPointer(e.clientX, e.clientY);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") {
            updatePeelFromPointer(e.clientX, e.clientY);
          }
        }}
        style={{
          transform: `rotate(${effectivePeelDirection}deg)`,
          transformOrigin: "center",
          transition: peelRotationTransition,
        }}
      >
        <div className="sticker-main" style={stickerMainStyle}>
          <div
            style={
              hasSpecular
                ? { filter: `url(#${filterId}-pointLight)` }
                : undefined
            }
          >
            <img
              src={imageSrc}
              alt=""
              className="sticker-img"
              style={imageStyle}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div className="sticker-shadow-underlay">
          <div className="sticker-flap" style={flapStyle}>
            <img
              src={imageSrc}
              alt=""
              className="sticker-img"
              style={shadowImageStyle}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div className="sticker-flap-layer sticker-flap" style={flapStyle}>
          <div
            style={
              hasSpecular
                ? { filter: `url(#${filterId}-pointLightFlipped)` }
                : undefined
            }
          >
            <img
              src={imageSrc}
              alt=""
              className="sticker-img"
              style={shadowImageStyle}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
