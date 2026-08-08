import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { db } from './db.js';
import { getOrganizerById, type OrganizerRow } from './organizers.js';

const COOKIE_NAME = 'origonki_session';
const SESSION_DAYS = 30;

type SessionKind = 'superadmin' | 'organizer';

interface SessionRow {
  token: string;
  kind: SessionKind;
  organizer_id: string | null;
  expires_at: number;
}

function newToken(): string {
  return randomBytes(32).toString('hex');
}

function expiresAt(): number {
  return Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
}

function insertSession(kind: SessionKind, organizerId?: string): string {
  const token = newToken();
  db.prepare('INSERT INTO sessions (token, kind, organizer_id, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    kind,
    organizerId ?? null,
    expiresAt(),
  );
  return token;
}

export function setSessionCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

function getTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getSession(token: string): SessionRow | undefined {
  return db
    .prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?')
    .get(token, Date.now()) as SessionRow | undefined;
}

export function createSuperAdminSession(res: Response): void {
  const token = insertSession('superadmin');
  setSessionCookie(res, token);
}

export function createOrganizerSession(res: Response, organizerId: string): void {
  const token = insertSession('organizer', organizerId);
  setSessionCookie(res, token);
}

export function destroySession(req: Request, res: Response): void {
  const token = getTokenFromRequest(req);
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  clearSessionCookie(res);
}

export function getAuthContext(req: Request): {
  isSuperAdmin: boolean;
  organizer: OrganizerRow | null;
} {
  const token = getTokenFromRequest(req);
  if (!token) return { isSuperAdmin: false, organizer: null };

  const session = getSession(token);
  if (!session) return { isSuperAdmin: false, organizer: null };

  if (session.kind === 'superadmin') {
    return { isSuperAdmin: true, organizer: null };
  }

  if (session.kind === 'organizer' && session.organizer_id) {
    const organizer = getOrganizerById(session.organizer_id);
    if (!organizer || organizer.blocked === 1) {
      return { isSuperAdmin: false, organizer: null };
    }
    return { isSuperAdmin: false, organizer };
  }

  return { isSuperAdmin: false, organizer: null };
}

export function getOrganizerFromCookieHeader(cookieHeader: string | undefined): OrganizerRow | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  const session = getSession(token);
  if (!session || session.kind !== 'organizer' || !session.organizer_id) return null;
  const organizer = getOrganizerById(session.organizer_id);
  if (!organizer || organizer.blocked === 1) return null;
  return organizer;
}

export function isOrganizerAuthRequired(): boolean {
  return process.env.REQUIRE_ORGANIZER_AUTH === '1';
}

export function isSuperAdminPasswordValid(password: string): boolean {
  const expected = process.env.SUPERADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
