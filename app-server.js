// app-server.js — static + /state sync + GitHub proxy (Express 5 safe)
const fs = require('fs');
const path = require('path');
const express = require('express');

// 포트: 기본값을 3000으로 맞춘다 (docker-compose, 예전 로그와 일치)
const PORT = Number(process.env.PORT || 3000);

const STATE_FILE = process.env.STATE_FILE || path.join(process.cwd(), 'state.json');
const STATIC_DIR = process.env.STATIC_DIR || process.cwd();
const GH_TOKEN = process.env.GITHUB_TOKEN || '';

const app = express();

// ---- Static ----
app.use(express.static(STATIC_DIR, {
  etag: true,
  lastModified: true,
  fallthrough: true,
  index: ['index.html']
}));

// ---- JSON body for sync API ----
app.use(express.json({ limit: '2mb' }));

// ---- /state sync (LAN) ----
function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {
      repo: 'google/angle',
      branch: 'main',
      reviews: {},
      manual: [],
      meta: { version: 7, updatedAt: 0 }
    };
  }
}

function writeState(obj) {
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, STATE_FILE);
}

app.get('/state', (req, res) => res.json(readState()));

app.post('/state', (req, res) => {
  const incoming = req.body || {};
  const current = readState();
  const curT = (current.meta && current.meta.updatedAt) || 0;
  const inT = (incoming.meta && incoming.meta.updatedAt) || 0;

  if (inT >= curT) {
    writeState(incoming);
    return res.json({ ok: true, applied: true });
  }
  return res.json({ ok: true, applied: false, reason: 'stale' });
});

// ---- GitHub API proxy (지금은 프론트에서 안 쓰더라도 남겨둠) ----
app.use('/gh', async (req, res) => {
  try {
    const targetPath = req.originalUrl.replace(/^\/gh\/?/, '');
    const url = `https://api.github.com/${targetPath}`;
    const headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'angle-review-tracker'
    };
    if (GH_TOKEN) headers['Authorization'] = `Bearer ${GH_TOKEN}`;

    const opts = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      opts.body = JSON.stringify(req.body || {});
      headers['Content-Type'] = 'application/json';
    }

    const resp = await fetch(url, opts);
    const text = await resp.text();

    res.status(resp.status);
    res.set(
      'Content-Type',
      resp.headers.get('content-type') || 'application/json; charset=utf-8'
    );
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[app-server] static: ${STATIC_DIR}`);
  console.log(`[app-server] state file: ${STATE_FILE}`);
  console.log(
    `[app-server] GH proxy: ${GH_TOKEN ? 'enabled (token set)' : 'enabled (NO TOKEN; 60 req/hr shared)'}`
  );
  console.log(`[app-server] listening:  http://0.0.0.0:${PORT}`);
  console.log(`[app-server] open:       http://localhost:${PORT}/index.html`);
});
