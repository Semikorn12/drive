/**
 * Builds the browser preview for GitHub Pages into ./dist-web
 *   npm run build:web
 * The site is served at https://<user>.github.io/drive/ → base URL /drive.
 */
import { execSync } from 'node:child_process';
import { copyFileSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'dist-web';
rmSync(OUT, { recursive: true, force: true });
execSync(`npx expo export --platform web --output-dir ${OUT} --clear`, {
  stdio: 'inherit',
  env: { ...process.env, EXPO_BASE_URL: process.env.EXPO_BASE_URL ?? '/drive' },
});
// Make it feel like an app on the iPhone: dark browser bars, full screen from the home screen.
const base = process.env.EXPO_BASE_URL ?? '/drive';
const head = [
  '<meta name="theme-color" content="#070F2B">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="Dr!ve">',
  `<link rel="apple-touch-icon" href="${base}/apple-touch-icon.png">`,
  `<link rel="manifest" href="${base}/manifest.webmanifest">`,
  '<style>html,body{background:#070F2B;overscroll-behavior:none}</style>',
].join('');
let html = readFileSync(`${OUT}/index.html`, 'utf8');
html = html.replace(/<meta name="viewport" content="([^"]*)"/, (_m, c) =>
  `<meta name="viewport" content="${c.includes('viewport-fit') ? c : c + ', viewport-fit=cover'}"`,
);
html = html.replace('</head>', `${head}</head>`);
writeFileSync(`${OUT}/index.html`, html);

// GitHub Pages: don't run Jekyll (it would hide the "_expo" folder) …
writeFileSync(`${OUT}/.nojekyll`, '');
// … and serve the app for every path (single-page app).
copyFileSync(`${OUT}/index.html`, `${OUT}/404.html`);
console.log(`\n✓ Web preview built in ${OUT}/`);
