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
    if (pid) {
      execSync(`kill ${pid.split('\n').join(' ')} 2>/dev/null`);
    }
  } catch { /* ok */ }
}

function spawnTunnel(name, cmd, args, urlPattern, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    console.log(`   → ${name}...`);
    const proc = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let foundUrl = null;

    const timer = setTimeout(() => {
      if (!foundUrl) {
        proc.kill();
        reject(new Error(`${name}: timeout`));
      }
    }, timeoutMs);

    function onData(data) {
      const text = data.toString();
      if (process.env.TUNNEL_DEBUG) process.stdout.write(text);
      if (foundUrl) return;
      const match = text.match(urlPattern);
      if (match) {
        foundUrl = match[0].replace(/[^\w:/.?=&%-]/g, '');
        clearTimeout(timer);
        console.log(`   ✓ ${name} OK\n`);
        resolve({ url: foundUrl, close: () => proc.kill() });
      }
    }

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.on('close', (code) => {
      if (!foundUrl) {
        clearTimeout(timer);
        reject(new Error(`${name}: closed (${code})`));
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
      '-o', 'ServerAliveInterval=30',
      '-o', 'ConnectTimeout=20',
      'a.pinggy.io',
    ],
    pattern: /https:\/\/[^\s]+/,
  },
  {
    name: 'localhost.run (HTTPS)',
    cmd: 'ssh',
    args: [
      '-R', '80:localhost:3001',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=30',
      '-o', 'ConnectTimeout=20',
      'nokey@localhost.run',
    ],
    pattern: /https:\/\/[^\s]+\.localhost\.run/,
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
      console.log('   ✗ ngrok заблокирован для вашего IP (Россия/VPN)\n');
    } else {
      console.log(`   ✗ ngrok: ${msg.slice(0, 80)}\n`);
    }
    return null;
  }
}

export async function createHttpsTunnel(port = 3001, ngrokToken) {
  console.log('🌐 Ищу HTTPS-туннель для iPhone...\n');

  for (const p of PROVIDERS) {
    try {
      return await spawnTunnel(p.name, p.cmd, p.args, p.pattern);
    } catch {
      console.log(`   ✗ ${p.name} не сработал\n`);
    }
  }

  const ngrok = await tryNgrok(port, ngrokToken);
  if (ngrok) return ngrok;

  return null;
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
  console.log('════════════════════════════════════════════════════════');
  console.log('  Варианты:');
  console.log('════════════════════════════════════════════════════════');
  if (localIp) {
    console.log(`  1. Wi-Fi (Android): bash 4-ТЕСТ-В-WIFI.command`);
    console.log(`     http://${localIp}:3001/admin/\n`);
  }
  console.log('  2. Постоянный HTTPS (лучше для iPhone):');
  console.log('     bash 2-ДЕПЛОЙ-НА-RENDER.command\n');
  console.log('  3. VPN на другую страну + bash 5-ТЕСТ-НА-IPHONE.sh\n');
}
