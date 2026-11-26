#!/usr/bin/env node
/**
 * TerraFauna // Modern Zero-Dependency Dev Server
 * Serves ES6 web application with accurate MIME types, CORS headers,
 * Range requests for audio streaming, and automatic browser launch.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORT = 8000;
const FALLBACK_PORTS = [8000, 5173, 3000, 8080];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? `start "" "${url}"` :
                   process.platform === 'darwin' ? `open "${url}"` :
                   `xdg-open "${url}"`;
  exec(startCmd, () => {});
}

function createServer() {
  return http.createServer((req, res) => {
    // CORS & Dev headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    let parsedUrl = req.url.split('?')[0];
    let sanitizedPath = path.normalize(decodeURIComponent(parsedUrl));
    if (sanitizedPath === '/' || sanitizedPath === '\\') {
      sanitizedPath = '/index.html';
    }

    const filePath = path.join(__dirname, sanitizedPath);

    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>404 Not Found</h1><p>The requested biological resource <code>${parsedUrl}</code> does not exist.</p>`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Support Range requests for bioacoustics audio streams
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stats.size,
          'Content-Type': contentType
        });
        fs.createReadStream(filePath).pipe(res);
      }
    });
  });
}

function startServer(portIndex = 0) {
  const port = FALLBACK_PORTS[portIndex];
  const server = createServer();

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[WARN] Port ${port} in use, trying next fallback...`);
      if (portIndex + 1 < FALLBACK_PORTS.length) {
        startServer(portIndex + 1);
      } else {
        console.error(`[ERROR] All fallback ports in use: ${FALLBACK_PORTS.join(', ')}`);
        process.exit(1);
      }
    } else {
      console.error('[ERROR]', err);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    const ipUrl = `http://127.0.0.1:${port}`;
    console.log('\n' + '='.repeat(62));
    console.log(' 🧬 TERRAFAUNA // GLOBAL ZOOLOGICAL ATLAS ACTIVE');
    console.log('='.repeat(62));
    console.log(` ➜  Local:   ${url}/`);
    console.log(` ➜  IPv4:    ${ipUrl}/`);
    console.log(' ➜  Mode:    Development (Zoological & Bioacoustic Archive)');
    console.log('='.repeat(62) + '\n');

    if (!process.env.TERRAFAUNA_NO_OPEN) {
      openBrowser(url);
    }
  });
}

startServer();
