import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { APPS, DASHBOARD_PORT, startDashboardServer } from './dashboard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const BACKEND_PORTS = [
  { port: 3001, label: 'MHStreams addon API' },
  { port: 3232, label: 'MHMetadata addon API' },
];

const RESERVED_PORTS = [
  ...APPS.map((app) => ({
    port: Number(new URL(app.url).port),
    label: app.name,
  })),
  ...BACKEND_PORTS,
  { port: DASHBOARD_PORT, label: 'Root dashboard' },
];

const PROCESSES = [
  {
    name: 'MHStreams Core',
    cwd: path.join(repoRoot, 'MHStreams'),
    ...commandSpec(localBin(path.join(repoRoot, 'MHStreams'), 'tsc'), [
      '-w',
      '--preserveWatchOutput',
      '-p',
      'packages/core/tsconfig.json',
    ]),
  },
  {
    name: 'MHStreams API',
    cwd: path.join(repoRoot, 'MHStreams'),
    ...commandSpec(localBin(path.join(repoRoot, 'MHStreams'), 'cross-env'), [
      'NODE_ENV=development',
      localBin(path.join(repoRoot, 'MHStreams'), 'tsx'),
      'watch',
      'packages/server/src/server.ts',
    ]),
  },
  {
    name: 'MHStreams UI',
    cwd: path.join(repoRoot, 'MHStreams/packages/frontend'),
    ...commandSpec(localBin(path.join(repoRoot, 'MHStreams/packages/frontend'), 'next'), [
      'dev',
      '--turbopack',
    ]),
  },
  {
    name: 'MHMetadata API',
    cwd: path.join(repoRoot, 'MHMetadata'),
    ...commandSpec('node', [
      '--watch',
      'addon/server.js',
    ]),
  },
  {
    name: 'MHMetadata UI',
    cwd: path.join(repoRoot, 'MHMetadata'),
    ...commandSpec('npm', [
      'run',
      'dev',
      '--',
      '--host',
      '127.0.0.1',
      '--port',
      '5173',
      '--strictPort',
    ]),
  },
  {
    name: 'MHTV',
    cwd: path.join(repoRoot, 'MHTV'),
    ...commandSpec('npm', ['run', 'dev']),
  },
];

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const PREFIX_COLORS = [COLORS.green, COLORS.blue, COLORS.magenta, COLORS.cyan];
const children = [];
let dashboardServer = null;
let shuttingDown = false;

function commandSpec(name, args) {
  if (process.platform === 'win32') {
    const commandLine = [name, ...args]
      .map((part) =>
        /[\s"]/u.test(part) ? `"${part.replace(/"/g, '""')}"` : part
      )
      .join(' ');

    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', commandLine],
    };
  }

  return {
    command: name,
    args,
  };
}

function localBin(projectDir, name) {
  const extension = process.platform === 'win32' ? '.cmd' : '';
  return path.join(projectDir, 'node_modules', '.bin', `${name}${extension}`);
}

async function runSetup(command, args, cwd, label) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} failed with exit code ${code}`));
    });

    proc.on('error', reject);
  });
}

async function ensureDependencies() {
  const checks = [
    {
      label: 'MHStreams dependencies',
      file: localBin(path.join(repoRoot, 'MHStreams'), 'tsc'),
      install: () =>
        runSetup(
          commandSpec('pnpm', ['install']).command,
          commandSpec('pnpm', ['install']).args,
          path.join(repoRoot, 'MHStreams'),
          'MHStreams install'
        ),
    },
    {
      label: 'MHMetadata dependencies',
      file: localBin(path.join(repoRoot, 'MHMetadata'), 'vite'),
      install: () =>
        runSetup(
          commandSpec('npm', ['install']).command,
          commandSpec('npm', ['install']).args,
          path.join(repoRoot, 'MHMetadata'),
          'MHMetadata install'
        ),
    },
    {
      label: 'MHTV dependencies',
      file: localBin(path.join(repoRoot, 'MHTV'), 'tsx'),
      install: () =>
        runSetup(
          commandSpec('npm', ['install']).command,
          commandSpec('npm', ['install']).args,
          path.join(repoRoot, 'MHTV'),
          'MHTV install'
        ),
    },
  ];

  for (const check of checks) {
    if (fs.existsSync(check.file)) {
      continue;
    }

    console.log(`${COLORS.yellow}${check.label} missing. Installing...${COLORS.reset}`);
    await check.install();
  }
}

function prefixStream(stream, name, color) {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      process.stdout.write(
        `${color}[${name}]${COLORS.reset} ${line}\n`
      );
    }
  });

  stream.on('end', () => {
    if (buffer.trim()) {
      process.stdout.write(
        `${color}[${name}]${COLORS.reset} ${buffer}\n`
      );
    }
  });
}

function isPortBusy(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
      socket.destroy();
      resolve(true);
    });

    const finish = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(400);
    socket.once('error', finish);
    socket.once('timeout', finish);
  });
}

async function assertPortsAvailable() {
  const busy = [];

  for (const item of RESERVED_PORTS) {
    if (await isPortBusy(item.port)) {
      busy.push(item);
    }
  }

  if (!busy.length) {
    return;
  }

  console.error(`${COLORS.red}Reserved local dev ports are already in use:${COLORS.reset}`);
  for (const item of busy) {
    console.error(`- ${item.port} (${item.label})`);
  }
  console.error(
    `${COLORS.dim}Free those ports, then rerun \`npm run dev\` from ${repoRoot}.${COLORS.reset}`
  );
  process.exit(1);
}

function spawnProcess(proc, index) {
  const color = PREFIX_COLORS[index % PREFIX_COLORS.length];
  const child = spawn(proc.command, proc.args, {
    cwd: proc.cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  prefixStream(child.stdout, proc.name, color);
  prefixStream(child.stderr, proc.name, color);

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `exit code ${code}`;
    console.error(`${COLORS.red}[${proc.name}] stopped with ${reason}.${COLORS.reset}`);
    shutdown(1);
  });

  children.push(child);
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (dashboardServer) {
    dashboardServer.close();
  }

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }
    process.exit(exitCode);
  }, 250);
}

async function main() {
  await ensureDependencies();
  await assertPortsAvailable();

  dashboardServer = startDashboardServer();

  console.log(`${COLORS.dim}Starting MHStreams, MHMetadata, and MHTV...${COLORS.reset}`);

  PROCESSES.forEach((proc, index) => spawnProcess(proc, index));
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

main().catch((error) => {
  console.error(error);
  shutdown(1);
});
