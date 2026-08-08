import { resolveServerUrl } from '@decibel-racing/shared';

export function getServerUrl(): string {
  return resolveServerUrl(import.meta.env.VITE_SERVER_URL);
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getServerUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? 'Ошибка запроса');
  }
  return data as T;
}

export function fullHostUrl(slug: string): string {
  return `${window.location.origin}/host/${slug}`;
}
