import { resolveServerUrl, BRAND } from '@decibel-racing/shared';

export function getServerUrl(): string {
  return resolveServerUrl(import.meta.env.VITE_SERVER_URL);
}

export async function loginHost(slug: string, password: string): Promise<void> {
  const res = await fetch(`${getServerUrl()}/api/auth/host/${slug}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? 'Ошибка входа');
  }
}
