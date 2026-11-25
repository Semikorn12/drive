/**
 * Geometry of the "Dr!ve" wordmark, drawn as stroked SVG paths (not text),
 * so the "i" can morph into the "!".
 *
 * Shared by: <Logo/> (static), <IntroAnimation/> and scripts/generate-icons.ts (app icon).
 * Keep this file free of imports so Node can load it directly.
 */

export const LOGO_VIEWBOX_W = 345;
export const LOGO_VIEWBOX_H = 150;
export const LOGO_VIEWBOX = `0 0 ${LOGO_VIEWBOX_W} ${LOGO_VIEWBOX_H}`;
export const LOGO_ASPECT = LOGO_VIEWBOX_H / LOGO_VIEWBOX_W;

export const STROKE = 15;
/** Sporty forward lean, applied to the letters (not to the swoosh). */
export const LETTER_TRANSFORM = 'translate(14 0) skewX(-8)';

const CAP = 22; // cap height line
const X_HEIGHT = 52; // x-height line
const BASE = 112; // baseline

export const letterPaths = {
  D: `M18 ${CAP} V${BASE} H44 C75 ${BASE} 88 92 88 67 C88 42 75 ${CAP} 44 ${CAP} Z`,
  r: `M112 ${BASE} V${X_HEIGHT} M112 76 C112 60 123 ${X_HEIGHT} 141 ${X_HEIGHT}`,
  v: `M190 ${X_HEIGHT} L215 ${BASE} L240 ${X_HEIGHT}`,
  e: `M266 82 H326 A30 30 0 1 0 317.2 103.2`,
} as const;

/** The "i" ↔ "!" glyph: one vertical stroke + one dot. */
export const iGlyph = {
  x: 166,
  dotRadius: 9,
  // state "i"
  stemTopI: X_HEIGHT,
  stemBottomI: BASE,
  dotYI: 30,
  // state "!"
  stemTopBang: CAP,
  stemBottomBang: 86,
  dotYBang: 110,
} as const;

/** Purple swoosh that sweeps under the wordmark once. */
export const swooshPath = 'M22 136 C110 148 230 116 328 127';
export const SWOOSH_LENGTH = 320;
export const SWOOSH_STROKE = 6;

/** Ordered letters for the staggered fade-in (index 2 is the i-glyph). */
export const LETTER_ORDER = ['D', 'r', 'i', 'v', 'e'] as const;
