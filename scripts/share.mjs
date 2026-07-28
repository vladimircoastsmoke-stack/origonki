#!/usr/bin/env node
/**
 * Быстрый публичный URL для теста с другом (через Cloudflare Tunnel).
 * Не требует регистрации. HTTPS из коробки — микрофон на телефоне работает.
 */
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'apps/server/public');

console.log('🏎️  Decibel Racing — публичный URL для теста\n');

if (!existsSync(publicDir)) {
  console.log('📦 Собираю production-бандл...');
  execSync('pnpm build:prod', { cwd: root, stdio: 'inherit' });
}

console.log('🚀 Запускаю сервер на порту 3001...\n');

const server = spawn('node', ['apps/server/dist/index.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
});

await new Promise((r) => setTimeout(r, 2000));

console.log('\n🌐 Создаю публичный HTTPS-туннель...\n');
console.log('═══════════════════════════════════════════════════');
console.log('  Скопируйте URL ниже и отправьте другу:');
console.log('  • Admin:  URL/admin/');
console.log('  • Player: URL/join/КОД_КОМНАТЫ');
console.log('  • Screen: URL/screen/?room=КОД');
console.log('═══════════════════════════════════════════════════\n');

const tunnel = spawn(
  'npx',
  ['--yes', 'cloudflared@latest', 'tunnel', '--protocol', 'http2', '--url', 'http://localhost:3001'],
  { cwd: root, stdio: 'inherit' }
);

process.on('SIGINT', () => {
  tunnel.kill();
  server.kill();
  process.exit(0);
});
