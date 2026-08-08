import { cpSync, rmSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'apps/server/public');

const copies = [
  ['apps/admin/dist', 'admin'],
  ['apps/bigscreen/dist', 'bigscreen'],
  ['apps/player/dist', 'player'],
  ['apps/superadmin/dist', 'superadmin'],
  ['apps/host/dist', 'host'],
];

if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true });
}
mkdirSync(publicDir, { recursive: true });

for (const [src, dest] of copies) {
  const from = join(root, src);
  const to = join(publicDir, dest);
  cpSync(from, to, { recursive: true });
  console.log(`✓ ${src} → apps/server/public/${dest}`);
}

console.log('\n✅ Production bundle ready in apps/server/public/');
