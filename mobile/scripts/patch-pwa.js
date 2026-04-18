/**
 * Post-build script to inject PWA meta tags into dist/index.html.
 * Expo's Metro bundler regenerates index.html on every export,
 * so we patch it after the build.
 *
 * Usage: node scripts/patch-pwa.js
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

// Copy manifest.json and sw.js to dist if missing
for (const file of ['manifest.json', 'sw.js']) {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/`);
  }
}

const indexPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// Skip if already patched
if (html.includes('manifest.json')) {
  console.log('PWA tags already present — skipping.');
  process.exit(0);
}

// Inject PWA meta tags before </head>
const pwaMeta = `
    <meta name="theme-color" content="#0B5E8C" />
    <meta name="description" content="Hawaiʻi DOE financial literacy app teaching all 30 standards of the Personal Transition Plan requirement." />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="FinSkill" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />
    <link rel="manifest" href="/manifest.json" />`;

html = html.replace('</head>', pwaMeta + '\n  </head>');

// Inject service worker registration before </body>
const swScript = `
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>`;

html = html.replace('</body>', swScript + '\n</body>');

fs.writeFileSync(indexPath, html, 'utf-8');
console.log('PWA tags injected into dist/index.html');
