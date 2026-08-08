import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { db } from './db.js';

export interface OrganizerRow {
  id: string;
  email: string;
  slug: string;
  password_hash: string;
  blocked: number;
  created_at: number;
}

export interface OrganizerPublic {
  id: string;
  email: string;
  slug: string;
  blocked: boolean;
  createdAt: number;
}

const SLUG_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function newId(): string {
  return randomBytes(12).toString('hex');
}

function newSlug(): string {
  let slug = '';
  for (let i = 0; i < 8; i += 1) {
    slug += SLUG_CHARS[randomBytes(1)[0] % SLUG_CHARS.length];
  }
  return slug;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let pwd = '';
  for (let i = 0; i < 10; i += 1) {
    pwd += chars[randomBytes(1)[0] % chars.length];
  }
  return pwd;
}

function toPublic(row: OrganizerRow): OrganizerPublic {
  return {
    id: row.id,
    email: row.email,
    slug: row.slug,
    blocked: row.blocked === 1,
    createdAt: row.created_at,
  };
}

export function listOrganizers(): OrganizerPublic[] {
  const rows = db.prepare('SELECT * FROM organizers ORDER BY created_at DESC').all() as OrganizerRow[];
  return rows.map(toPublic);
}

export function getOrganizerBySlug(slug: string): OrganizerRow | undefined {
  return db.prepare('SELECT * FROM organizers WHERE slug = ?').get(slug) as OrganizerRow | undefined;
}

export function getOrganizerById(id: string): OrganizerRow | undefined {
  return db.prepare('SELECT * FROM organizers WHERE id = ?').get(id) as OrganizerRow | undefined;
}

export function createOrganizer(email: string, plainPassword?: string): {
  organizer: OrganizerPublic;
  plainPassword: string;
  hostUrl: string;
} {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) {
    throw new Error('Укажите корректный email');
  }

  const existing = db.prepare('SELECT id FROM organizers WHERE email = ?').get(normalized);
  if (existing) {
    throw new Error('Организатор с таким email уже есть');
  }

  let slug = newSlug();
  while (db.prepare('SELECT id FROM organizers WHERE slug = ?').get(slug)) {
    slug = newSlug();
  }

  const password = plainPassword?.trim() || generatePassword();
  if (password.length < 6) {
    throw new Error('Пароль минимум 6 символов');
  }

  const id = newId();
  const password_hash = bcrypt.hashSync(password, 10);
  const created_at = Date.now();

  db.prepare(
    'INSERT INTO organizers (id, email, slug, password_hash, blocked, created_at) VALUES (?, ?, ?, ?, 0, ?)',
  ).run(id, normalized, slug, password_hash, created_at);

  const organizer = toPublic(getOrganizerById(id)!);
  return {
    organizer,
    plainPassword: password,
    hostUrl: `/host/${slug}`,
  };
}

export function verifyOrganizerPassword(slug: string, password: string): OrganizerRow | null {
  const row = getOrganizerBySlug(slug);
  if (!row || row.blocked === 1) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return row;
}

export function setOrganizerBlocked(id: string, blocked: boolean): OrganizerPublic | null {
  const row = getOrganizerById(id);
  if (!row) return null;
  db.prepare('UPDATE organizers SET blocked = ? WHERE id = ?').run(blocked ? 1 : 0, id);
  return toPublic(getOrganizerById(id)!);
}

export function resetOrganizerPassword(id: string, plainPassword?: string): {
  organizer: OrganizerPublic;
  plainPassword: string;
} | null {
  const row = getOrganizerById(id);
  if (!row) return null;
  const password = plainPassword?.trim() || generatePassword();
  const password_hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE organizers SET password_hash = ? WHERE id = ?').run(password_hash, id);
  return {
    organizer: toPublic(getOrganizerById(id)!),
    plainPassword: password,
  };
}
