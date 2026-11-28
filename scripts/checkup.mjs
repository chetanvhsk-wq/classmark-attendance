#!/usr/bin/env node

/** Lightweight project health check; intentionally uses only Node built-ins. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const requiredFiles = [
  'package.json',
  'www/index.html',
  'www/manifest.json',
  'server.js',
  'www/vendor/jspdf.umd.min.js',
  'www/vendor/xlsx.full.min.js',
  'www/vendor/firebase-sync.js',
];

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) {
    const generatedVendor = relative.startsWith('www/vendor/');
    if (!generatedVendor || fs.existsSync(path.join(root, 'node_modules'))) failures.push(`Missing ${relative}`);
  }
}

const htmlPath = path.join(root, 'www/index.html');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (!/<html\b/i.test(html)) failures.push('www/index.html has no <html> element');
  if (!/<\/html>\s*$/i.test(html)) failures.push('www/index.html does not end with </html>');

  for (const [, relative] of html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)) {
    if (/^(?:https?:|data:|mailto:|javascript:|\/)/i.test(relative)) continue;
    const target = path.join(path.dirname(htmlPath), relative);
    const generatedVendor = relative.startsWith('vendor/');
    if (!fs.existsSync(target) && (!generatedVendor || fs.existsSync(path.join(root, 'node_modules')))) {
      failures.push(`Broken HTML reference: www/${relative}`);
    }
  }
}

const jsFiles = ['server.js', 'lib/firebase-token.js', 'lib/gemini-proxy.js', 'api/gemini/generate.js', 'api/gemini/status.js'];
for (const relative of jsFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) continue;
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) failures.push(`JavaScript syntax error in ${relative}`);
}

if (failures.length) {
  console.error('Classmark checkup failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Classmark checkup passed (${requiredFiles.length} required files, ${jsFiles.length} JS files checked).`);
