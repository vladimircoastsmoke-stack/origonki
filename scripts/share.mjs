#!/usr/bin/env node
/**
 * Публичный HTTPS-URL для теста с другом.
 * Пробует Pinggy → localhost.run → localtunnel
 */
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'apps/server/public');

function getLocalIp() {
  for (const iface of Object.values(networkInterfaces())) {
    for (const cfg of iface ?? []) {
      if (cfg.family === 'IPv4' && !cfg.internal) return cfg.address;
    }
  }
  return null;
}

function printUrls(baseUrl, localIp) {
  const base = baseUrl.replace(/\/$/, '');
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  ✅ ГОТОВО! Ваши ссылки (открывайте в браузере):');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  Admin:   ${base}/admin/`);
  console.log(`  Screen:  ${base}/screen/?room=КОД`);
  console.log(`  Player:  ${base}/join/КОД`);
  console.log('════════════════════════════════════════════════════════\n');

  if (localIp) {
    console.log('  📶 Запасной вариант (друг в той же Wi-Fi, команда 4):');
    console.log(`     http://${localIp}:3001/join/КОД`);
    console.log('     (на iPhone микрофон не работает — только Android)\n');
  }
  console.log('  ❌ Не закрывайте это окно пока играете!\n');
}

function spawnTunnel(name, cmd, args, urlPattern, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    console.log(`   Пробую ${name}...`);
    const proc = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let foundUrl = null;

    const timer = setTimeout(() => {
      if (!foundUrl) {
        proc.kill();
        reject(new Error(`${name} timeout`));
      }
    }, timeoutMs);

    function onData(data) {
      const text = data.toString();
      process.stdout.write(text);
      if (foundUrl) return;
      const match = text.match(urlPattern);
      if (match) {
        foundUrl = match[0].replace(/[^\w:/.?=&-]/g, '');
        clearTimeout(timer);
        console.log(`\n   ✓ ${name} подключён!\n`);
        resolve({ url: foundUrl, proc, close: () => proc.kill() });
      }
    }

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.on('close', () => {
      if (!foundUrl) {
        clearTimeout(timer);
        reject(new Error(`${name} closed`));
      }
    });
  });
}

async function startServer() {
  if (!existsSync(publicDir)) {
    console.log('📦 Собираю production-бандл...');
    const pnpm = existsSync(join(root, 'node_modules/.bin/pnpm'))
      ? join(root, 'node_modules/.bin/pnpm')
      : 'npx --yes pnpm@9.15.0';
    execSync(`${pnpm} build:prod`, { cwd: root, stdio: 'inherit' });
  }

  try {
    const pid = execSync('lsof -ti :3001 2>/dev/null', { encoding: 'utf8' }).trim();
    if (pid) {
      console.log('⚠️  Останавливаю старый сервер...');
      execSync(`kill ${pid.split('\n').join(' ')} 2>/dev/null`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  } catch { /* ok */ }

  console.log('🚀 Запускаю сервер на порту 3001...\n');

  return spawn('node', ['apps/server/dist/index.js'], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'inherit',
  });
}

async function startTunnel(localIp) {
  console.log('🌐 Создаю HTTPS-туннель (без пароля)...\n');

  const providers = [
    {
      name: 'Pinggy',
      cmd: 'ssh',
      args: [
        '-p', '443',
        '-R0:localhost:3001',
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ServerAliveInterval=30',
        '-o', 'ServerAliveCountMax=3',
        '-o', 'ConnectTimeout=15',
        'a.pinggy.io',
      ],
      pattern: /https:\/\/[^\s]+/,
    },
    {
      name: 'localhost.run',
      cmd: 'ssh',
      args: [
        '-R', '80:localhost:3001',
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ServerAliveInterval=30',
        '-o', 'ConnectTimeout=15',
        'nokey@localhost.run',
      ],
      pattern: /https:\/\/[^\s]+\.localhost\.run/,
    },
  ];

  for (const p of providers) {
    try {
      const tunnel = await spawnTunnel(p.name, p.cmd, p.args, p.pattern);
      printUrls(tunnel.url, localIp);
      return tunnel;
    } catch {
      console.log(`   ✗ ${p.name} не сработал, пробую следующий...\n`);
    }
  }

  // localtunnel — последний вариант (нужен пароль IP на loca.lt)
  try {
    const { default: localtunnel } = await import('localtunnel');
    const lt = await localtunnel({ port: 3001 });
    console.log('   ✓ localtunnel (loca.lt) — нужен пароль IP на первой странице!\n');
    printUrls(lt.url, localIp);
    console.log('  ⚠️  loca.lt часто не открывается! Лучше используйте команду 4 (Wi-Fi)\n');
    return { url: lt.url, close: () => lt.close() };
  } catch {
    /* fall through */
  }

  console.log('\n❌ HTTPS-туннель не получился.\n');
  if (localIp) {
    console.log('════════════════════════════════════════════════════════');
    console.log('  👉 ИСПОЛЬЗУЙТЕ КОМАНДУ 4 (работает у вас!):');
    console.log('     Двойной клик: 4-ТЕСТ-В-WIFI.command');
    console.log('════════════════════════════════════════════════════════');
    printUrls(`http://${localIp}:3001`, localIp);
  }
  return null;
}

console.log('🏎️  Decibel Racing — публичный URL для теста\n');

const localIp = getLocalIp();
const server = await startServer();
await new Promise((r) => setTimeout(r, 2000));
const tunnel = await startTunnel(localIp);

process.on('SIGINT', () => {
  tunnel?.close?.();
  server.kill();
  process.exit(0);
});

await new Promise(() => {});
