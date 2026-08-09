/** Client-side URL helpers (safe to use in browser bundles). */
export function resolveServerUrl(envUrl?: string): string {
  if (envUrl && envUrl.length > 0) return envUrl;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3001';
}

/** Базовый публичный URL сайта (HTTPS-домен для QR и ссылок). */
export function resolvePublicBase(envUrl?: string, serverPublicUrl?: string | null): string {
  if (serverPublicUrl && serverPublicUrl.length > 0) return serverPublicUrl.replace(/\/$/, '');
  if (envUrl && envUrl.length > 0) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3001';
}

export function resolvePlayerJoinUrl(
  roomId: string,
  envPlayerUrl?: string,
  serverPublicUrl?: string | null,
): string {
  return `${resolvePublicBase(envPlayerUrl, serverPublicUrl)}/join/${roomId}`;
}

export function resolveBigScreenUrl(roomId: string, publicBase?: string | null): string {
  const base = resolvePublicBase(undefined, publicBase);
  if (base) return `${base}/screen/?room=${roomId}`;
  return `/screen/?room=${roomId}`;
}
