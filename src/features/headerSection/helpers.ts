import {
  runGraphemeReveal,
  type GraphemeRevealState,
} from "../../effects/graphemeReveal";
import type { MutableRefObject } from "react";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function cancelMenuCloseTimer(
  closeMenuTimerRef: MutableRefObject<number | null>,
): void {
  if (closeMenuTimerRef.current == null) return;
  window.clearTimeout(closeMenuTimerRef.current);
  closeMenuTimerRef.current = null;
}

export function scheduleMenuCloseTimer(
  closeMenuTimerRef: MutableRefObject<number | null>,
  onClose: () => void,
  delayMs = 160,
): void {
  cancelMenuCloseTimer(closeMenuTimerRef);
  closeMenuTimerRef.current = window.setTimeout(() => {
    onClose();
    closeMenuTimerRef.current = null;
  }, delayMs);
}

export function runHeaderReveal(
  el: HTMLElement,
  toText: string,
  pool: string,
  animState: GraphemeRevealState,
  onComplete?: () => void,
): void {
  runGraphemeReveal({
    el,
    toText,
    pool,
    animState,
    onComplete,
  });
}
