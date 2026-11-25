/**
 * Generates the app icon + splash placeholder from the SAME geometry as the in-app logo.
 * Run:  npm run icons   (needs a Chromium; uses Playwright if installed, see README)
 *
 * Output: assets/images/icon.png (1024², iOS), android-icon-foreground.png,
 *         android-icon-monochrome.png, splash-transparent.png, icon.svg (editable source)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  iGlyph,
  LETTER_TRANSFORM,
  LOGO_VIEWBOX_H,
  LOGO_VIEWBOX_W,
  letterPaths,
  STROKE,
  SWOOSH_STROKE,
  swooshPath,
} from '../src/components/brand/logoGeometry.ts';

const OUT = join(import.meta.dirname, '..', 'assets', 'images');
mkdirSync(OUT, { recursive: true });

const NAVY = '#070F2B';
const NAVY2 = '#0B1B4D';

function wordmark(color: string, bang: string, withSwoosh: boolean) {
  const letters = Object.values(letterPaths)
    .map((d) => `<path d="${d}"/>`)
    .join('');
  return `
  <g transform="${LETTER_TRANSFORM}" stroke="${color}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    ${letters}
    <line x1="${iGlyph.x}" x2="${iGlyph.x}" y1="${iGlyph.stemTopBang}" y2="${iGlyph.stemBottomBang}"/>
    <circle cx="${iGlyph.x}" cy="${iGlyph.dotYBang}" r="${iGlyph.dotRadius}" fill="${bang}" stroke="none"/>
  </g>
  ${withSwoosh ? `<path d="${swooshPath}" stroke="url(#sw)" stroke-width="${SWOOSH_STROKE}" stroke-linecap="round" fill="none"/>` : ''}`;
}

/** size: canvas px; logoWidth: fraction of canvas; bg: background or null (transparent). */
function iconSvg(opts: { size: number; logoWidth: number; bg: boolean; mono?: boolean }) {
  const { size, logoWidth, bg, mono } = opts;
  const w = size * logoWidth;
  const scale = w / LOGO_VIEWBOX_W;
  const h = LOGO_VIEWBOX_H * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2 + size * 0.02;
  const color = mono ? '#000' : '#fff';
  const bang = mono ? '#000' : '#FF8A2A';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7B4DFF"/><stop offset="1" stop-color="#A77BFF"/></linearGradient>
    <linearGradient id="deco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B4DFF"/><stop offset="1" stop-color="#A77BFF"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="${NAVY2}"/><stop offset="1" stop-color="${NAVY}"/></radialGradient>
  </defs>
  ${
    bg
      ? `<rect width="${size}" height="${size}" fill="url(#glow)"/>
  <path d="M${-0.05 * size} ${0.78 * size} C${0.3 * size} ${0.62 * size} ${0.6 * size} ${0.95 * size} ${1.05 * size} ${0.7 * size}" stroke="url(#deco)" stroke-width="${size * 0.012}" stroke-opacity="0.45" fill="none"/>
  <path d="M${-0.05 * size} ${0.86 * size} C${0.35 * size} ${0.74 * size} ${0.65 * size} ${1.0 * size} ${1.05 * size} ${0.8 * size}" stroke="url(#deco)" stroke-width="${size * 0.007}" stroke-opacity="0.3" fill="none"/>`
      : ''
  }
  <g transform="translate(${x} ${y}) scale(${scale})">${wordmark(color, bang, !mono)}</g>
</svg>`;
}

const jobs: { file: string; svg: string; size: number; transparent: boolean }[] = [
  { file: 'icon.png', svg: iconSvg({ size: 1024, logoWidth: 0.78, bg: true }), size: 1024, transparent: false },
  // Android adaptive icon: keep the logo inside the 66 % safe zone, background colour comes from app config.
  { file: 'android-icon-foreground.png', svg: iconSvg({ size: 1024, logoWidth: 0.55, bg: false }), size: 1024, transparent: true },
  { file: 'android-icon-monochrome.png', svg: iconSvg({ size: 1024, logoWidth: 0.55, bg: false, mono: true }), size: 1024, transparent: true },
  { file: 'favicon.png', svg: iconSvg({ size: 196, logoWidth: 0.85, bg: true }), size: 196, transparent: false },
];

writeFileSync(join(OUT, 'icon.svg'), jobs[0].svg);

// 1×1 transparent PNG: the native splash shows only the background colour.
writeFileSync(
  join(OUT, 'splash-transparent.png'),
  Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'),
);

const { chromium } = await import('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const job of jobs) {
  await page.setViewportSize({ width: job.size, height: job.size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${job.svg}</body></html>`);
  await page.locator('svg').screenshot({ path: join(OUT, job.file), omitBackground: job.transparent });
  console.log('✓', job.file);
}
await browser.close();
