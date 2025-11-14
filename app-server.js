// app-server.js — static + /state sync + GitHub proxy (Express 5, no external deps except express)
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
app.use(
  express.static(STATIC_DIR, {
    etag: true,
    lastModified: true,
    fallthrough: true,
    index: ['index.html'],
  }),
);

// ---- JSON body for sync API ----
app.use(express.json({ limit: '2mb' }));

<<<<<<< HEAD
// ---- /state sync (LAN) ----
=======
// ---- /state sync ----
// 같은 오리진에서만 쓸 거라면 CORS 전혀 필요 없음.
// (추후에 LAN 다른 오리진에서 읽게 만들고 싶으면, 여기서 직접 헤더만 추가해주면 됨.)

>>>>>>> 77df32c (GLitchers14 angle review tracker)
function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
<<<<<<< HEAD
=======
    // 프론트 기본값과 맞춰 줌 (version:7, manual:[])
>>>>>>> 77df32c (GLitchers14 angle review tracker)
    return {
      repo: 'google/angle',
      branch: 'main',
      reviews: {},
      manual: [],
<<<<<<< HEAD
      meta: { version: 7, updatedAt: 0 }
=======
      meta: { version: 7, updatedAt: 0 },
>>>>>>> 77df32c (GLitchers14 angle review tracker)
    };
  }
}

function writeState(obj) {
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, STATE_FILE);
}

<<<<<<< HEAD
app.get('/state', (req, res) => res.json(readState()));
=======
app.get('/state', (req, res) => {
  res.json(readState());
});
>>>>>>> 77df32c (GLitchers14 angle review tracker)

app.post('/state', (req, res) => {
  const incoming = req.body || {};
  const current = readState();
  const curT = (current.meta && current.meta.updatedAt) || 0;
  const inT = (incoming.meta && incoming.meta.updatedAt) || 0;

<<<<<<< HEAD
=======
  // updatedAt이 더 최신인 쪽만 적용
>>>>>>> 77df32c (GLitchers14 angle review tracker)
  if (inT >= curT) {
    writeState(incoming);
    return res.json({ ok: true, applied: true });
  }
  return res.json({ ok: true, applied: false, reason: 'stale' });
});

<<<<<<< HEAD
// ---- GitHub API proxy (지금은 프론트에서 안 쓰더라도 남겨둠) ----
=======
// ---- GitHub API proxy ----
>>>>>>> 77df32c (GLitchers14 angle review tracker)
app.use('/gh', async (req, res) => {
  try {
    // /gh/repos/... 형태를 https://api.github.com/repos/... 로 포워딩
    const targetPath = req.originalUrl.replace(/^\/gh\/?/, '');
    const url = `https://api.github.com/${targetPath}`;

<<<<<<< HEAD
=======
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'angle-review-tracker',
    };
    if (GH_TOKEN) {
      headers.Authorization = `Bearer ${GH_TOKEN}`;
    }

>>>>>>> 77df32c (GLitchers14 angle review tracker)
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
<<<<<<< HEAD
      resp.headers.get('content-type') || 'application/json; charset=utf-8'
=======
      resp.headers.get('content-type') || 'application/json; charset=utf-8',
>>>>>>> 77df32c (GLitchers14 angle review tracker)
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
<<<<<<< HEAD
    `[app-server] GH proxy: ${GH_TOKEN ? 'enabled (token set)' : 'enabled (NO TOKEN; 60 req/hr shared)'}`
=======
    `[app-server] GH proxy: ${
      GH_TOKEN ? 'enabled (token set)' : 'enabled (NO TOKEN; 60 req/hr shared)'
    }`,
>>>>>>> 77df32c (GLitchers14 angle review tracker)
  );
  console.log(`[app-server] listening:  http://0.0.0.0:${PORT}`);
  console.log(`[app-server] open:       http://localhost:${PORT}/index.html`);
});
