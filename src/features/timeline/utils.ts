const YEAR_REGEX = /\b(19|20)\d{2}\b/g;

export function parsePeriodYears(period: string): {
  start: number;
  end: number;
} {
  const years = period.match(YEAR_REGEX)?.map(Number) ?? [];
  const currentYear = new Date().getFullYear();
  if (years.length >= 2) return { start: years[0], end: years[1] };
  if (years.length === 1) {
    if (/now/i.test(period)) return { start: years[0], end: currentYear };
    return { start: years[0], end: years[0] };
  }
  return { start: currentYear, end: currentYear };
}

function parseHexColor(s: string): [number, number, number] | null {
  let h = s.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  return null;
}

export function smoothstep01(t: number): number {
  const u = Math.max(0, Math.min(1, t));
  return u * u * (3 - 2 * u);
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function lerpHex(a: string, b: string, t: number): string {
  const ca = parseHexColor(a);
  const cb = parseHexColor(b);
  if (!ca || !cb) return a;
  const u = Math.max(0, Math.min(1, t));
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * u);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * u);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * u);
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
