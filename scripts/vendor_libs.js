/* Copies the browser builds of jsPDF and SheetJS into www/vendor so the app
   works offline and does not depend on a CDN at runtime. Runs automatically
   after `npm install`/`npm ci` via the postinstall script. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vendorDir = path.join(root, 'www', 'vendor');

const libs = [
  { from: path.join('jspdf', 'dist', 'jspdf.umd.min.js'), to: 'jspdf.umd.min.js' },
  { from: path.join('xlsx', 'dist', 'xlsx.full.min.js'), to: 'xlsx.full.min.js' },
];

fs.mkdirSync(vendorDir, { recursive: true });

for (const lib of libs) {
  const src = path.join(root, 'node_modules', lib.from);
  const dst = path.join(vendorDir, lib.to);
  if (!fs.existsSync(src)) {
    console.error(`[vendor] missing ${src}. Run "npm install" first.`);
    process.exit(1);
  }
  fs.copyFileSync(src, dst);
  console.log(`[vendor] ${lib.to}`);
}

// Bundle the Firebase module with the same offline-friendly app assets.
try {
  const esbuild = require('esbuild');
  esbuild.buildSync({
    entryPoints: [path.join(root, 'www', 'firebase-sync.js')],
    bundle: true,
    format: 'iife',
    target: ['es2020'],
    outfile: path.join(vendorDir, 'firebase-sync.js'),
    minify: true,
  });
  console.log('[vendor] firebase-sync.js');
} catch (err) {
  console.error('[vendor] Firebase bundle failed:', err.message);
  process.exit(1);
}
