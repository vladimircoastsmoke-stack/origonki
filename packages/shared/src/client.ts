/** Client-side URL helpers (safe to use in browser bundles). */
export function resolveServerUrl(envUrl?: string): string {
  if (envUrl && envUrl.length > 0) return envUrl;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3001';
}

export function resolvePlayerJoinUrl(roomId: string, envPlayerUrl?: string): string {
  const base =
    envPlayerUrl && envPlayerUrl.length > 0
      ? envPlayerUrl.replace(/\/$/, '')
      : typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:5175';
  return `${base}/join/${roomId}`;
}

export function resolveBigScreenUrl(roomId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/screen/?room=${roomId}`;
  }
  return `/screen/?room=${roomId}`;
}
