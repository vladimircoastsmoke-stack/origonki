#!/usr/bin/env node
/**
 * Тест на iPhone — HTTPS через Pinggy / localhost.run
 * (ngrok часто заблокирован в РФ — ERR_NGROK_9040)
 */
import { spawn, execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  getLocalIp,
  killPort,
  createHttpsTunnel,
  printIphoneUrls,
  printFailureHelp,
} from './tunnel.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'apps/server/public');
const envPath = join(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

async function startServer() {
  if (!existsSync(publicDir)) {
    console.log('📦 Собираю приложение...');
    const pnpm = existsSync(join(root, 'node_modules/.bin/pnpm'))
      ? join(root, 'node_modules/.bin/pnpm')
      : 'npx --yes pnpm@9.15.0';
    execSync(`${pnpm} build:prod`, { cwd: root, stdio: 'inherit' });
  }

  killPort(3001);
  await new Promise((r) => setTimeout(r, 500));

  console.log('🚀 Запускаю сервер на порту 3001...\n');
  return spawn('node', ['apps/server/dist/index.js'], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'inherit',
  });
}

console.log('🏎️  Decibel Racing — тест на iPhone\n');

loadEnv();
const localIp = getLocalIp();
const server = await startServer();
await new Promise((r) => setTimeout(r, 2000));

const tunnel = await createHttpsTunnel(3001, process.env.NGROK_AUTHTOKEN);

if (!tunnel) {
  printFailureHelp(localIp);
  server.kill();
  process.exit(1);
}

printIphoneUrls(tunnel.url, localIp);
spawn('open', [`${tunnel.url.replace(/\/$/, '')}/admin/`], { stdio: 'ignore' });

process.on('SIGINT', () => {
  tunnel.close?.();
  server.kill();
  process.exit(0);
});

await new Promise(() => {});
