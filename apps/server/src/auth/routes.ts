import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  listOrganizers,
  createOrganizer,
  setOrganizerBlocked,
  resetOrganizerPassword,
  verifyOrganizerPassword,
} from './organizers.js';
import {
  createSuperAdminSession,
  createOrganizerSession,
  destroySession,
  getAuthContext,
  isOrganizerAuthRequired,
  isSuperAdminPasswordValid,
} from './sessions.js';

function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  const { isSuperAdmin } = getAuthContext(req);
  if (!isSuperAdmin) {
    res.status(401).json({ error: 'Требуется вход супер-админа' });
    return;
  }
  next();
}

export function createAuthRouter(): Router {
  const router = Router();

  router.get('/config', (_req, res) => {
    res.json({ requireOrganizerAuth: isOrganizerAuthRequired() });
  });

  router.get('/me', (req, res) => {
    const { isSuperAdmin, organizer } = getAuthContext(req);
    if (isSuperAdmin) {
      res.json({ role: 'superadmin' });
      return;
    }
    if (organizer) {
      res.json({
        role: 'organizer',
        organizer: {
          id: organizer.id,
          email: organizer.email,
          slug: organizer.slug,
        },
      });
      return;
    }
    res.json({ role: null });
  });

  router.post('/logout', (req, res) => {
    destroySession(req, res);
    res.json({ ok: true });
  });

  router.post('/superadmin/login', (req, res) => {
    const password = String(req.body?.password ?? '');
    if (!isSuperAdminPasswordValid(password)) {
      res.status(401).json({ error: 'Неверный пароль' });
      return;
    }
    createSuperAdminSession(res);
    res.json({ ok: true, role: 'superadmin' });
  });

  router.get('/superadmin/organizers', requireSuperAdmin, (_req, res) => {
    res.json({ organizers: listOrganizers() });
  });

  router.post('/superadmin/organizers', requireSuperAdmin, (req, res) => {
    try {
      const email = String(req.body?.email ?? '');
      const password = req.body?.password ? String(req.body.password) : undefined;
      const result = createOrganizer(email, password);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.patch('/superadmin/organizers/:id', requireSuperAdmin, (req, res) => {
    const id = String(req.params.id);
    if (req.body?.blocked !== undefined) {
      const organizer = setOrganizerBlocked(id, Boolean(req.body.blocked));
      if (!organizer) {
        res.status(404).json({ error: 'Не найден' });
        return;
      }
      res.json({ organizer });
      return;
    }
    res.status(400).json({ error: 'Нет изменений' });
  });

  router.post('/superadmin/organizers/:id/reset-password', requireSuperAdmin, (req, res) => {
    const id = String(req.params.id);
    const password = req.body?.password ? String(req.body.password) : undefined;
    const result = resetOrganizerPassword(id, password);
    if (!result) {
      res.status(404).json({ error: 'Не найден' });
      return;
    }
    res.json(result);
  });

  router.post('/host/:slug/login', (req, res) => {
    const slug = String(req.params.slug);
    const password = String(req.body?.password ?? '');
    const organizer = verifyOrganizerPassword(slug, password);
    if (!organizer) {
      res.status(401).json({ error: 'Неверная ссылка или пароль' });
      return;
    }
    createOrganizerSession(res, organizer.id);
    res.json({
      ok: true,
      organizer: {
        id: organizer.id,
        email: organizer.email,
        slug: organizer.slug,
      },
    });
  });

  return router;
}
