import { spawn, execSync } from 'child_process';
import { networkInterfaces } from 'os';

export function getLocalIp() {
  for (const iface of Object.values(networkInterfaces())) {
    for (const cfg of iface ?? []) {
      if (cfg.family === 'IPv4' && !cfg.internal) return cfg.address;
    }
  }
  return null;
}

export function killPort(port) {
  try {
    const pid = execSync(`lsof -ti :${port} 2>/dev/null`, { encoding: 'utf8' }).trim();
    if (pid) execSync(`kill ${pid.split('\n').join(' ')} 2>/dev/null`);
  } catch { /* ok */ }
}

/** Из текста SSH-вывода достать URL туннеля */
function extractTunnelUrl(text) {
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('https://')) continue;
    if (trimmed.includes('dashboard.pinggy') || trimmed.includes('openssh.com')) continue;

    if (/pinggy\.(net|link|io)|pinggy-free\.link|localhost\.run|lhr\.life/.test(trimmed)) {
      const m = trimmed.match(/https:\/\/[^\s]+/);
      if (m) return m[0].replace(/[^\w:/.?=&%-]+$/, '');
    }
  }
  return null;
}

function spawnTunnel(name, cmd, args, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    console.log(`   → ${name}...`);
    let buffer = '';
    let settled = false;
    const proc = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        proc.kill();
        reject(new Error(`${name}: timeout (подождите и попробуйте снова)`));
      }
    }, timeoutMs);

    function tryResolve() {
      if (settled) return;
      const url = extractTunnelUrl(buffer);
      if (url) {
        settled = true;
        clearTimeout(timer);
        console.log(`\n   ✓ ${name} OK\n`);
        resolve({ url, close: () => proc.kill() });
      }
    }

    function onData(data) {
      const chunk = data.toString();
      buffer += chunk;
      for (const line of chunk.split(/\r?\n/)) {
        if (
          line.includes('pinggy') ||
          line.includes('localhost.run') ||
          line.includes('lhr.life') ||
          line.includes('https://')
        ) {
          console.log('  ', line.trim());
        }
      }
      tryResolve();
    }

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(err);
      }
    });
    proc.on('close', (code) => {
      if (settled) return;
      tryResolve();
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`${name}: нет URL (код ${code})`));
      }
    });
  });
}

const PROVIDERS = [
  {
    name: 'Pinggy (HTTPS)',
    cmd: 'ssh',
    args: [
      '-p', '443',
      '-R0:localhost:3001',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'ServerAliveInterval=30',
      '-o', 'ConnectTimeout=25',
      '-o', 'LogLevel=ERROR',
      'free@a.pinggy.io',
    ],
  },
  {
    name: 'localhost.run (HTTPS)',
    cmd: 'ssh',
    args: [
      '-R', '80:localhost:3001',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'ServerAliveInterval=30',
      '-o', 'ConnectTimeout=25',
      '-o', 'LogLevel=ERROR',
      'nokey@localhost.run',
    ],
  },
];

export async function tryNgrok(port, authtoken) {
  if (!authtoken) return null;
  try {
    const ngrok = await import('@ngrok/ngrok');
    const listener = await ngrok.default.forward({ addr: port, authtoken });
    const url = listener.url();
    if (!url) return null;
    console.log('   ✓ ngrok OK\n');
    return { url, close: () => listener.close() };
  } catch (err) {
    const msg = String(err.message || err);
    if (msg.includes('9040') || msg.includes('IP address')) {
      console.log('   ✗ ngrok заблокирован для вашего IP\n');
    } else {
      console.log(`   ✗ ngrok: ${msg.slice(0, 100)}\n`);
    }
    return null;
  }
}

export async function createHttpsTunnel(port = 3001, ngrokToken) {
  console.log('🌐 Создаю HTTPS-туннель (1–2 минуты)...\n');

  for (const p of PROVIDERS) {
    try {
      return await spawnTunnel(p.name, p.cmd, p.args);
    } catch (e) {
      console.log(`   ✗ ${e.message}\n`);
    }
  }

  return tryNgrok(port, ngrokToken);
}

export function printIphoneUrls(base, localIp) {
  const url = base.replace(/\/$/, '');
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  ✅ iPhone готов! HTTPS-ссылки:');
  console.log('════════════════════════════════════════════════════════');
  console.log(`  📱 Admin:   ${url}/admin/`);
  console.log(`  📱 Player:  ${url}/join/КОД   ← на iPhone`);
  console.log(`  🖥 Screen:  ${url}/screen/?room=КОД`);
  console.log('════════════════════════════════════════════════════════');
  if (localIp) {
    console.log(`\n  📶 Wi-Fi (Android): http://${localIp}:3001/join/КОД`);
  }
  console.log('\n  iPhone: Разрешить микрофон → кричать в телефон');
  console.log('  ❌ Не закрывайте это окно!\n');
}

export function printFailureHelp(localIp) {
  console.log('\n❌ HTTPS-туннель не получился.\n');
  console.log('  1. Wi-Fi (Android):  bash 4-ТЕСТ-В-WIFI.command');
  if (localIp) console.log(`     http://${localIp}:3001/admin/\n`);
  console.log('  2. iPhone (надёжно): bash 2-ДЕПЛОЙ-НА-RENDER.command\n');
}
