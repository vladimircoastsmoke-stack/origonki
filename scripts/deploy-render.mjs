#!/usr/bin/env node
/**
 * Деплой на Render: коммит → push → открыть Render Blueprint
 */
import { execSync, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

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

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

console.log('');
console.log('☁️  Decibel Racing — деплой на Render');
console.log('══════════════════════════════════════');
console.log('');

// Проверка git
if (!existsSync(join(root, '.git'))) {
  console.log('📁 Инициализирую git...');
  run('git init');
  run('git branch -M main');
}

// Коммит незакоммиченных изменений
const status = runSafe('git status --porcelain');
if (status) {
  console.log('💾 Сохраняю изменения...');
  run('git add -A');
  run('git commit -m "deploy: update" || true');
}

const remote = runSafe('git remote get-url origin');

if (!remote) {
  console.log('');
  console.log('📌 GitHub-репозиторий ещё не подключён.');
  console.log('');
  console.log('   1. Откройте: https://github.com/new');
  console.log('      Название: decibel-racing');
  console.log('      (можно Private)');
  console.log('');

  openUrl('https://github.com/new');

  const repoUrl = await ask('   2. Вставьте URL репозитория (https://github.com/USER/decibel-racing.git): ');

  if (!repoUrl || !repoUrl.includes('github.com')) {
    console.log('❌ Неверный URL. Запустите команду снова.');
    process.exit(1);
  }

  run(`git remote add origin "${repoUrl}"`);
  console.log('');
  console.log('📤 Отправляю код на GitHub...');
  run('git push -u origin main');
} else {
  console.log(`📡 Репозиторий: ${remote}`);
  console.log('📤 Отправляю код на GitHub...');
  try {
    run('git push origin main');
  } catch {
    run('git push -u origin main');
  }
}

console.log('');
console.log('✅ Код на GitHub!');
console.log('');
console.log('🌐 Открываю Render для финального шага...');
console.log('');
console.log('   В браузере:');
console.log('   → New Blueprint Instance');
console.log('   → Подключите репозиторий decibel-racing');
console.log('   → Нажмите Apply');
console.log('   → Подождите ~5 минут');
console.log('');
console.log('   После деплоя ваш URL:');
console.log('   https://decibel-racing-xxxx.onrender.com/admin/');
console.log('');

openUrl('https://dashboard.render.com/blueprints');

await ask('Нажмите Enter, когда закончите...');
