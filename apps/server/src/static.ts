import fs from 'fs';
import path from 'path';
import express, { type Express } from 'express';

function mountSpa(app: Express, urlPrefix: string, dir: string): void {
  if (!fs.existsSync(dir)) return;
  app.use(urlPrefix, express.static(dir, { index: 'index.html' }));
  app.get(`${urlPrefix}/*`, (_req, res) => {
    res.sendFile(path.join(dir, 'index.html'));
  });
}

export function setupStaticFrontend(app: Express, serverDir: string): boolean {
  const publicDir = path.join(serverDir, '..', 'public');
  if (!fs.existsSync(publicDir)) return false;

  const adminDir = path.join(publicDir, 'admin');
  const screenDir = path.join(publicDir, 'bigscreen');
  const playerDir = path.join(publicDir, 'player');
  const superadminDir = path.join(publicDir, 'superadmin');
  const hostDir = path.join(publicDir, 'host');

  mountSpa(app, '/admin', adminDir);
  mountSpa(app, '/screen', screenDir);
  mountSpa(app, '/superadmin', superadminDir);
  mountSpa(app, '/host', hostDir);

  app.use(express.static(playerDir, { index: false }));

  app.get('/join/*', (_req, res) => {
    res.sendFile(path.join(playerDir, 'index.html'));
  });

  app.get('/', (_req, res) => {
    res.redirect('/host/');
  });

  return true;
}
