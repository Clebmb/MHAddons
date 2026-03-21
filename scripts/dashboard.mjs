import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DASHBOARD_PORT = 4100;

export const APPS = [
  {
    id: 'mhstreams',
    name: 'MHStreams',
    description: 'Streaming media aggregation addon',
    icon: 'movie',
    url: 'http://localhost:3200',
    links: [
      { label: 'Open Addon', url: 'http://localhost:3200' },
    ],
  },
  {
    id: 'mhmetadata',
    name: 'MHMetadata',
    description: 'Metadata Aggregation addon',
    icon: 'database',
    url: 'http://localhost:5173',
    links: [
      { label: 'Open Addon', url: 'http://localhost:5173' },
    ],
  },
  {
    id: 'mhtv',
    name: 'MHTV',
    description: 'Live TV/IPTV Addon',
    icon: 'live_tv',
    badge: 'EXPERIMENTAL',
    url: 'http://localhost:7000',
    links: [{ label: 'Open Addon', url: 'http://localhost:7000' }],
  },
];

const STATUS_TIMEOUT_MS = 800;
const DASHBOARD_FAVICON_PATH = path.resolve('favicon.ico');

function checkUrl(urlString) {
  const { hostname, port, protocol } = new URL(urlString);
  const resolvedPort =
    port || (protocol === 'https:' ? 443 : protocol === 'http:' ? 80 : 0);

  return new Promise((resolve) => {
    const socket = net.createConnection(
      { host: hostname, port: Number(resolvedPort) },
      () => {
        socket.destroy();
        resolve(true);
      }
    );

    const finish = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(STATUS_TIMEOUT_MS);
    socket.once('error', finish);
    socket.once('timeout', finish);
  });
}

function renderDashboard() {
  const appCards = APPS.map(
    (app) => `
      <article class="card" data-app="${app.id}">
        <div class="card-header">
          <div>
            <div class="addon-title">
              <span class="material-symbols-outlined addon-icon">${app.icon}</span>
              <h2>${app.name}</h2>
              ${app.badge ? `<span class="badge badge-warning">${app.badge}</span>` : ''}
            </div>
          </div>
          <span class="status" data-status="${app.id}">Checking</span>
        </div>
        <p class="description">${app.description}</p>
        <p class="port">Primary URL: <code>${app.url}</code></p>
        <div class="actions">
          ${app.links
            .map(
              (link) =>
                `<a class="button" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`
            )
            .join('')}
        </div>
      </article>
    `
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MH Addon Dashboard</title>
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
  <style>
    :root {
      color-scheme: dark;
      --bg: #09111b;
      --panel: rgba(16, 25, 36, 0.92);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f7fb;
      --muted: #9db0c4;
      --accent: #39e079;
      --accent-strong: #8ef2b3;
      --shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
      font-family: Inter, system-ui, sans-serif;
    }

    * { box-sizing: border-box; }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined' !important;
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      display: inline-block;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top right, rgba(57, 224, 121, 0.18), transparent 28%),
        radial-gradient(circle at bottom left, rgba(46, 112, 161, 0.18), transparent 30%),
        var(--bg);
      color: var(--text);
    }

    main {
      max-width: 1120px;
      margin: 0 auto;
      padding: 48px 20px 64px;
    }

    .hero {
      margin-bottom: 28px;
      text-align: center;
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--accent-strong);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .eyebrow-link {
      color: inherit;
      text-decoration: none;
    }

    .eyebrow-link:hover {
      color: #ffffff;
    }

    h1, h2 {
      margin: 0;
      letter-spacing: -0.03em;
    }

    h1 {
      font-size: clamp(2.4rem, 6vw, 4.5rem);
      margin-bottom: 14px;
      background: linear-gradient(135deg, #ffffff 0%, var(--accent) 72%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h2 {
      font-size: 1.45rem;
    }

    .subtitle {
      max-width: 760px;
      margin: 0;
      color: var(--muted);
      line-height: 1.65;
      font-size: 1rem;
    }

    .hero-logo {
      width: 72px;
      height: 72px;
      margin: 0 auto 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, var(--accent), #1f8f63);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 30px rgba(60, 229, 138, 0.25);
    }

    .hero-logo-link {
      display: inline-flex;
      text-decoration: none;
    }

    .hero-logo svg {
      width: 30px;
      height: 30px;
      display: block;
    }

    .hero-logo path {
      fill: none;
      stroke: #ffffff;
      stroke-width: 2.4;
      stroke-linejoin: round;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin: 24px 0 28px;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }

    .meta-card,
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(16px);
    }

    .meta-card {
      padding: 18px 20px;
    }

    .meta-label {
      color: var(--muted);
      font-size: 0.85rem;
      margin-bottom: 8px;
    }

    .meta-value {
      font-size: 1rem;
      font-weight: 700;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }

    .card {
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .addon-title {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .addon-icon {
      color: var(--accent);
      font-size: 1.5rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 0 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .badge-warning {
      background: rgba(255, 210, 70, 0.18);
      border: 1px solid rgba(255, 210, 70, 0.38);
      color: #ffd246;
    }

    .status {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 88px;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.06);
      color: var(--muted);
    }

    .status.up {
      background: rgba(57, 224, 121, 0.14);
      color: var(--accent-strong);
    }

    .status.down {
      background: rgba(255, 124, 124, 0.14);
      color: #ffadad;
    }

    .description,
    .port,
    .footer {
      color: var(--muted);
      line-height: 1.6;
    }

    .port {
      margin: 0 0 20px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0 16px;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 700;
      color: #08111a;
      background: var(--accent);
    }

    .button:hover {
      background: #5ae78f;
    }

    code {
      color: var(--accent-strong);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    .footer {
      margin-top: 24px;
      font-size: 0.92rem;
      text-align: center;
    }

    @media (max-width: 980px) {
      .meta,
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow"><a class="eyebrow-link" href="https://mediahoard.pages.dev" target="_blank" rel="noreferrer">MediaHoard</a></p>
      <a class="hero-logo-link" href="https://mediahoard.pages.dev" target="_blank" rel="noreferrer" aria-label="Open MediaHoard">
        <div class="hero-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 5.5L18 12L7 18.5V5.5Z" />
          </svg>
        </div>
      </a>
      <h1>MH Addon Dashboard</h1>
    </section>

    <section class="meta">
      <div class="meta-card">
        <div class="meta-label">Dashboard</div>
        <div class="meta-value"><code>http://localhost:${DASHBOARD_PORT}</code></div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Reserved Ports</div>
        <div class="meta-value"><code>3200 3201 3232 5173 7000</code></div>
      </div>
    </section>

    <section class="grid">
      ${appCards}
    </section>

    <p class="footer">Status refreshes automatically. If a card stays unavailable, check the root terminal output for the child process that failed.</p>
  </main>
  <script>
    async function refreshStatuses() {
      try {
        const response = await fetch('/api/apps');
        const apps = await response.json();
        apps.forEach((app) => {
          const node = document.querySelector('[data-status="' + app.id + '"]');
          if (!node) return;
          node.textContent = app.up ? 'Running' : 'Unavailable';
          node.classList.toggle('up', app.up);
          node.classList.toggle('down', !app.up);
        });
      } catch {
      }
    }

    refreshStatuses();
    setInterval(refreshStatuses, 3000);
  </script>
</body>
</html>`;
}

export async function getAppStatuses() {
  return Promise.all(
    APPS.map(async (app) => ({
      id: app.id,
      name: app.name,
      url: app.url,
      up: await checkUrl(app.url),
    }))
  );
}

export function startDashboardServer(port = DASHBOARD_PORT) {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400).end('Bad request');
      return;
    }

    if (req.url === '/api/apps') {
      const payload = await getAppStatuses();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(payload));
      return;
    }

    if (req.url === '/favicon.ico') {
      try {
        const favicon = fs.readFileSync(DASHBOARD_FAVICON_PATH);
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(favicon);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
      }
      return;
    }

    if (req.url === '/' || req.url.startsWith('/?')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDashboard());
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`[dashboard] http://localhost:${port}`);
  });

  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startDashboardServer();
}
