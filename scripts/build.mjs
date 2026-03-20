import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DASHBOARD_PORT, startDashboardServer } from './dashboard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const BUILD_STEPS = [
  {
    name: 'MHTV',
    cwd: path.join(repoRoot, 'MHTV'),
    command: 'npm',
    args: ['run', 'build'],
  },
  {
    name: 'MHMetadata',
    cwd: path.join(repoRoot, 'MHMetadata'),
    command: 'npm',
    args: ['run', 'build'],
  },
  {
    name: 'MHStreams Frontend',
    cwd: path.join(repoRoot, 'MHStreams', 'packages', 'frontend'),
    command: 'npm',
    args: ['run', 'build'],
  },
];

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

function runStep(step) {
  const spec = commandSpec(step.command, step.args);

  return new Promise((resolve, reject) => {
    console.log(
      `${COLORS.cyan}==>${COLORS.reset} Building ${step.name} ${COLORS.dim}(${step.cwd})${COLORS.reset}`
    );

    const proc = spawn(spec.command, spec.args, {
      cwd: step.cwd,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${step.name} build failed with exit code ${code}`));
    });
  });
}

function openBrowser(url) {
  const options = { detached: true, stdio: 'ignore', shell: false };

  if (process.platform === 'win32') {
    const proc = spawn('cmd.exe', ['/d', '/s', '/c', 'start', '', url], options);
    proc.unref();
    return;
  }

  if (process.platform === 'darwin') {
    const proc = spawn('open', [url], options);
    proc.unref();
    return;
  }

  const proc = spawn('xdg-open', [url], options);
  proc.unref();
}

async function main() {
  try {
    for (const step of BUILD_STEPS) {
      await runStep(step);
    }

    console.log(`${COLORS.green}All addon builds completed successfully.${COLORS.reset}`);

    const dashboardUrl = `http://localhost:${DASHBOARD_PORT}`;
    startDashboardServer();
    console.log(
      `${COLORS.yellow}Dashboard started at ${dashboardUrl}. Press Ctrl+C to stop it.${COLORS.reset}`
    );
    openBrowser(dashboardUrl);
  } catch (error) {
    console.error(
      `${COLORS.red}${error instanceof Error ? error.message : String(error)}${COLORS.reset}`
    );
    process.exit(1);
  }
}

main();
