#!/usr/bin/env node
// Downloads the dash-licenses JAR to the location expected by @eclipse-dash/nodejs-wrapper.
// The upstream package hardcodes a Nexus 2 URL that returns 404 since the Eclipse Foundation
// migrated to Nexus 3. This script pre-populates the JAR so the wrapper skips its own download.

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JAR_URL =
  'https://repo.eclipse.org/repository/dash-maven2/org/eclipse/dash/org.eclipse.dash.licenses/1.1.0/org.eclipse.dash.licenses-1.1.0.jar';
const JAR_PATH = path.resolve(
  __dirname,
  '../node_modules/@eclipse-dash/nodejs-wrapper/download/dash-licenses.jar'
);
const MIN_VALID_SIZE = 1_000_000; // 1 MB — same threshold used by the wrapper

if (fs.existsSync(JAR_PATH) && fs.statSync(JAR_PATH).size >= MIN_VALID_SIZE) {
  console.log('dash-licenses.jar already present, skipping download.');
  process.exit(0);
}

fs.mkdirSync(path.dirname(JAR_PATH), { recursive: true });

console.log(`Downloading dash-licenses.jar from:\n  ${JAR_URL}`);

/**
 * Downloads a file from the given URL to the specified destination, following redirects.
 *
 * @param {string} url - The URL to download from.
 * @param {string} dest - The destination file path.
 * @param {number} [redirects=5] - The number of allowed redirects.
 * @returns {void}
 */
function download(url, dest, redirects = 5) {
  if (redirects === 0) {
    console.error('Too many redirects');
    process.exit(1);
  }
  https
    .get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest, redirects - 1);
      }
      if (res.statusCode !== 200) {
        console.error(`Download failed with HTTP ${res.statusCode}`);
        process.exit(1);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(dest).size;
        if (size < MIN_VALID_SIZE) {
          fs.unlinkSync(dest);
          console.error(`Downloaded file is too small (${size} bytes) — possibly an error page.`);
          process.exit(1);
        }
        console.log(`dash-licenses.jar downloaded successfully (${(size / 1024 / 1024).toFixed(1)} MB).`);
      });
    })
    .on('error', (err) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      console.error(`Download error: ${err.message}`);
      process.exit(1);
    });
}

download(JAR_URL, JAR_PATH);
