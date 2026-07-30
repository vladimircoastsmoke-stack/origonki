#!/usr/bin/env node
/**
 * Авто-деплой: сборка → коммит → push → Render пересобирает сам
 */
import { execSync, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const GITHUB_REPO = 'https://github.com/vladimircoastsmoke-stack/origonki.git';
const GITHUB_USER = 'vladimircoastsmoke-stack';
const RENDER_SERVICE_URL = 'https://dashboard.render.com/';
const LIVE_URL = 'https://decibel-racing.onrender.com';

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, stdio: opts.silent ? 'pipe' : 'inherit', encoding: 'utf8' });
}

function runSafe(cmd) {
  try {
    return run(cmd, { silent: true }).trim();
  } catch {
    return null;
  }
}

function openUrl(url) {
  const platform = process.platform;
  if (platform === 'darwin') spawnSync('open', [url]);
  else if (platform === 'win32') spawnSync('cmd', ['/c', 'start', url]);
  else spawnSync('xdg-open', [url]);
}

function ask(question, hidden = false) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    if (hidden && process.stdin.isTTY) {
      process.stdout.write(question);
      const stdin = process.stdin;
      stdin.setRawMode?.(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      let value = '';
      const onData = (ch) => {
        if (ch === '\n' || ch === '\r' || ch === '\u0004') {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(value.trim());
        } else if (ch === '\u0003') {
          process.exit(1);
        } else if (ch === '\u007f') {
          value = value.slice(0, -1);
        } else {
          value += ch;
          process.stdout.write('*');
        }
      };
      stdin.on('data', onData);
      return;
    }
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

console.log('');
console.log('🚀 ОриГonki — авто-деплой');
console.log('══════════════════════════════════════');
console.log('');

const pnpm = existsSync(join(root, 'node_modules/.bin/pnpm'))
  ? join(root, 'node_modules/.bin/pnpm')
  : 'npx --yes pnpm@9.15.0';

console.log('📦 Проверяю сборку...');
try {
  run(`${pnpm} build:prod`);
} catch {
  console.log('');
  console.log('❌ Сборка не прошла. Исправьте ошибки и запустите снова.');
  process.exit(1);
}

console.log('');
console.log('✅ Сборка OK');
console.log('');

if (!existsSync(join(root, '.git'))) {
  run('git init');
  run('git branch -M main');
}

if (!runSafe('git remote get-url origin')) {
  run(`git remote add origin "${GITHUB_REPO}"`);
} else {
  run(`git remote set-url origin "${GITHUB_REPO}"`);
}

const status = runSafe('git status --porcelain');
if (status) {
  console.log('💾 Сохраняю изменения...');
  run('git add -A');
  run('git commit -m "deploy: авто-деплой — музыка, фиксы"');
} else {
  console.log('ℹ️  Нет новых изменений для коммита.');
}

console.log('');
console.log('📡 Репозиторий:', GITHUB_REPO);
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  Токен GitHub (CLASSIC):');
console.log('  https://github.com/settings/tokens/new');
console.log('  → галочка: repo');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const token = await ask('Вставьте токен и Enter: ');

if (!token) {
  console.log('❌ Токен пустой.');
  process.exit(1);
}

console.log('');
console.log('📤 Отправляю на GitHub...');

try {
  run(`git push "https://${GITHUB_USER}:${token}@github.com/vladimircoastsmoke-stack/origonki.git" main`);
} catch {
  console.log('');
  console.log('❌ Push не удался. Проверьте токен (нужен classic, scope: repo).');
  process.exit(1);
}

run(`git remote set-url origin "${GITHUB_REPO}"`);

console.log('');
console.log('✅ Код на GitHub!');
console.log('');
console.log('☁️  Render автоматически пересоберёт сайт за 3–5 минут.');
console.log('   (если сервис decibel-racing уже подключён к репозиторию)');
console.log('');
console.log('   Админка:  ' + LIVE_URL + '/admin/');
console.log('   Экран:    ' + LIVE_URL + '/screen/?room=КОД');
console.log('   Игроки:   ' + LIVE_URL + '/join/');
console.log('');
console.log('   Статус деплоя:');
console.log('   ' + RENDER_SERVICE_URL);
console.log('');

openUrl(RENDER_SERVICE_URL);

await ask('Enter для выхода...');
