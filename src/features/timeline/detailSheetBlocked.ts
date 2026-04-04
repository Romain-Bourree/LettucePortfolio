/** Timeline entries that do not open the detail sheet; value is the cursor-follow label. */
export const TIMELINE_NO_DETAIL_SHEET_LABELS: Record<string, string> = {
  Graduated: 'Nothing to see',
  Freelance: 'Some things are better left archived.',
  Faktis: 'Some things are better left archived.',
  Dsquare: 'Some things are better left archived.',
  Invoke: 'Some things are better left archived.',
  Krushon: 'Some things are better left archived.',
  Qudos: 'Some things are better left archived.',
  'IBS & Me': 'Some things are better left archived.',
};

export function getNoDetailSheetCursorLabel(name: string): string | null {
  return TIMELINE_NO_DETAIL_SHEET_LABELS[name] ?? null;
}

export function timelineItemBlocksDetailSheet(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(TIMELINE_NO_DETAIL_SHEET_LABELS, name);
}

export function getNoDetailSheetAriaDescription(name: string): string | null {
  const line = getNoDetailSheetCursorLabel(name);
  if (!line) return null;
  return `${line} This entry does not open a details panel.`;
}
