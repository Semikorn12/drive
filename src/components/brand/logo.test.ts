import { INTRO_TIMING } from './brandLayout';
import { iGlyph, STROKE } from './logoGeometry';

describe('logo geometry', () => {
  it('"!" dot sits below the stem with a visible gap', () => {
    const stemBottomEdge = iGlyph.stemBottomBang + STROKE / 2;
    const dotTopEdge = iGlyph.dotYBang - iGlyph.dotRadius;
    expect(dotTopEdge - stemBottomEdge).toBeGreaterThan(3);
  });

  it('"i" dot sits above the stem with a visible gap', () => {
    expect(iGlyph.stemTopI - STROKE / 2 - (iGlyph.dotYI + iGlyph.dotRadius)).toBeGreaterThan(3);
  });

  it('"!" stem reaches cap height (taller than the "i")', () => {
    expect(iGlyph.stemTopBang).toBeLessThan(iGlyph.stemTopI);
  });
});

describe('intro timing', () => {
  it('total duration is at most 1.8 s', () => {
    expect(INTRO_TIMING.total).toBeLessThanOrEqual(1800);
    expect(INTRO_TIMING.overlayFadeStart + INTRO_TIMING.overlayFadeDuration).toBeLessThanOrEqual(INTRO_TIMING.total);
    expect(INTRO_TIMING.exitStart + INTRO_TIMING.exitDuration).toBeLessThanOrEqual(INTRO_TIMING.total);
  });

  it('letters finish in ~400 ms, followed by a ~200 ms pause', () => {
    const lettersDone = 4 * INTRO_TIMING.letterStagger + INTRO_TIMING.letterDuration;
    expect(lettersDone).toBeLessThanOrEqual(400);
    expect(INTRO_TIMING.morphStart - lettersDone).toBeGreaterThanOrEqual(200);
  });
});
