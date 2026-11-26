/**
 * Builds the browser preview for GitHub Pages into ./dist-web
 *   npm run build:web
 * The site is served at https://<user>.github.io/drive/ → base URL /drive.
 */
import { execSync } from 'node:child_process';
import { copyFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'dist-web';
const BASE = process.env.EXPO_BASE_URL ?? '/drive';
// Unique id per build. The app compares it with version.json to notice a newer deploy
// (GitHub Pages lets browsers cache index.html for 10 minutes).
let sha = 'local';
try {
  sha = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // not a git checkout – fine
}
const BUILD_ID = `${sha}-${Date.now().toString(36)}`;

rmSync(OUT, { recursive: true, force: true });
execSync(`npx expo export --platform web --output-dir ${OUT} --clear`, {
  stdio: 'inherit',
  env: { ...process.env, EXPO_BASE_URL: BASE, EXPO_PUBLIC_BASE_URL: BASE, EXPO_PUBLIC_BUILD_ID: BUILD_ID },
});
writeFileSync(`${OUT}/version.json`, JSON.stringify({ build: BUILD_ID }));
// GitHub Pages: don't run Jekyll (it would hide the "_expo" folder) …
writeFileSync(`${OUT}/.nojekyll`, '');
// … and serve the app for every path (single-page app).
copyFileSync(`${OUT}/index.html`, `${OUT}/404.html`);
console.log(`\n✓ Web preview built in ${OUT}/`);
