import fs from 'fs';
import path from 'path';
import express, { type Express } from 'express';

export function setupStaticFrontend(app: Express, serverDir: string): boolean {
  const publicDir = path.join(serverDir, '..', 'public');
  if (!fs.existsSync(publicDir)) return false;

  const adminDir = path.join(publicDir, 'admin');
  const screenDir = path.join(publicDir, 'bigscreen');
  const playerDir = path.join(publicDir, 'player');

  app.use('/admin', express.static(adminDir, { index: 'index.html' }));
  app.use('/screen', express.static(screenDir, { index: 'index.html' }));
  app.use(express.static(playerDir, { index: false }));

  app.get('/admin/*', (_req, res) => {
    res.sendFile(path.join(adminDir, 'index.html'));
  });

  app.get('/screen/*', (_req, res) => {
    res.sendFile(path.join(screenDir, 'index.html'));
  });

  app.get('/join/*', (_req, res) => {
    res.sendFile(path.join(playerDir, 'index.html'));
  });

  app.get('/', (_req, res) => {
    res.redirect('/admin/');
  });

  return true;
}
