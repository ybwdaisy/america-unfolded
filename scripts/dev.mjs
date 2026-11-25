import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const built = spawnSync(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
if (built.status) process.exit(built.status);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const local = path.resolve('dist', '.' + pathname);
      if (!local.startsWith(path.resolve('dist') + path.sep) && local !== path.resolve('dist'))
        throw Error('path');
      let file = local;
      try {
        const s = await fs.stat(file);
        if (s.isDirectory()) file = path.join(file, 'index.html');
      } catch {}
      let data;
      try {
        data = await fs.readFile(file);
      } catch {
        file = 'dist/404.html';
        data = await fs.readFile(file);
        res.statusCode = 404;
      }
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(data);
    } catch {
      res.statusCode = 400;
      res.end('Invalid request');
    }
  })
  .listen(4173, '127.0.0.1', () => console.log('Local: http://localhost:4173'));
