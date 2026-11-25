import { LOGO_ASPECT } from './logoGeometry';

/** Size/position of the logo in the app header. The intro animation flies to exactly this spot. */
export const HEADER_LOGO_WIDTH = 104;
export const HEADER_LOGO_HEIGHT = HEADER_LOGO_WIDTH * LOGO_ASPECT;
/** Distance between safe-area top and the logo. */
export const HEADER_LOGO_TOP = 8;

/** Intro timeline (ms). Total must stay ≤ 1800. */
export const INTRO_TIMING = {
  letterStagger: 45,
  letterDuration: 220, // last letter done at 4*45+220 = 400
  morphStart: 600, // after 200 ms pause
  morphDuration: 320,
  snap: 950, // "!" locks in → haptic + swoosh
  swooshDuration: 350,
  swooshFade: 200,
  exitStart: 1300,
  exitDuration: 450,
  overlayFadeStart: 1450,
  overlayFadeDuration: 300,
  total: 1780,
  // Skip / reduced motion
  skipDuration: 220,
  reducedFadeIn: 200,
  reducedHold: 500,
  reducedFadeOut: 250,
} as const;
