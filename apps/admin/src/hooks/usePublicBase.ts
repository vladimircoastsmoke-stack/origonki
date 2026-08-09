import { useEffect, useState } from 'react';
import { getServerUrl } from '../lib/socket';

/** HTTPS-домен для QR (origonki.ru), даже если админка открыта по IP. */
export function usePublicBase(): string | null {
  const [publicBase, setPublicBase] = useState<string | null>(
    import.meta.env.VITE_PLAYER_URL?.replace(/\/$/, '') || null,
  );

  useEffect(() => {
    fetch(`${getServerUrl()}/api/public-config`)
      .then((r) => r.json())
      .then((data: { publicUrl?: string | null }) => {
        if (data.publicUrl) setPublicBase(data.publicUrl.replace(/\/$/, ''));
      })
      .catch(() => {});
  }, []);

  return publicBase;
}
