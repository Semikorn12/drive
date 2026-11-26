/**
 * Builds the browser preview for GitHub Pages into ./dist-web
 *   npm run build:web
 * The site is served at https://<user>.github.io/drive/ → base URL /drive.
 */
import { execSync } from 'node:child_process';
import { copyFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'dist-web';
rmSync(OUT, { recursive: true, force: true });
execSync(`npx expo export --platform web --output-dir ${OUT} --clear`, {
  stdio: 'inherit',
  env: { ...process.env, EXPO_BASE_URL: process.env.EXPO_BASE_URL ?? '/drive' },
});
// GitHub Pages: don't run Jekyll (it would hide the "_expo" folder) …
writeFileSync(`${OUT}/.nojekyll`, '');
// … and serve the app for every path (single-page app).
copyFileSync(`${OUT}/index.html`, `${OUT}/404.html`);
console.log(`\n✓ Web preview built in ${OUT}/`);
