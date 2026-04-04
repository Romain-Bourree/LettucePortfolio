export type TimelineItemType = 'life' | 'career' | 'side';
export type TimelineSide = 'left' | 'right';
export type TimelineTrack = 'left' | 'right';

export interface TimelineItem {
  name: string;
  period: string;
  type: TimelineItemType;
  accent: string;
  color: string;
  side: TimelineSide;
  gap: number;
  mt: number;
  desc: string;
  image?: string;
}

export interface TimelineGeometry {
  start: number;
  end: number;
  topPct: number;
  durationPct: number;
  track: TimelineTrack;
}

export interface PanelQuote {
  text: string;
  author: string;
}

export interface PanelShippedItem {
  title: string;
  body: string;
}

export interface PanelGalleryImage {
  src: string;
  alt: string;
  /** Optional caption on the expanded strip (e.g. "# 23"). */
  code?: string;
}

export interface PanelEntry {
  /** Role or one-line context (e.g. LEAD PRODUCT DESIGNER). */
  subtitle?: string;
  /** Optional public URL (site, store, etc.); shown as an icon button beside Close in the sheet header. */
  projectUrl?: string;
  /** Main narrative body in the detail sheet (TLDR section). */
  tldr: string;
  /** Detail sheet carousel; falls back to the timeline item `image` when omitted. */
  gallery?: PanelGalleryImage[];
  shipped?: PanelShippedItem[];
  quotes: PanelQuote[];
}
