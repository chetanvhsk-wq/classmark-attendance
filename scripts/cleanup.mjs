#!/usr/bin/env node

/** Removes only known disposable local artifacts; source and user assets are untouched. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const disposable = ['.DS_Store', 'www/.DS_Store', 'www/vendor/.DS_Store'];
const removed = [];

for (const relative of disposable) {
  const file = path.join(root, relative);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    try {
      fs.unlinkSync(file);
      removed.push(relative);
    } catch (error) {
      if (error.code !== 'EPERM' && error.code !== 'EACCES') throw error;
      console.warn(`Skipped protected file: ${relative}`);
    }
  }
}

console.log(removed.length ? `Removed: ${removed.join(', ')}` : 'Nothing to clean.');
