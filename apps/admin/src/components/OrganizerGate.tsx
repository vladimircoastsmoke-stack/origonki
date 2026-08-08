import { useEffect, useState, type ReactNode } from 'react';
import { BRAND } from '@decibel-racing/shared';
import { getServerUrl } from './lib/socket';

type AuthState = 'loading' | 'ok' | 'denied';

export function OrganizerGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>('loading');
  const [organizerEmail, setOrganizerEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const configRes = await fetch(`${getServerUrl()}/api/auth/config`, {
          credentials: 'include',
        });
        const config = (await configRes.json()) as { requireOrganizerAuth?: boolean };

        if (!config.requireOrganizerAuth) {
          if (!cancelled) setState('ok');
          return;
        }

        const meRes = await fetch(`${getServerUrl()}/api/auth/me`, { credentials: 'include' });
        const me = (await meRes.json()) as {
          role: string | null;
          organizer?: { email: string };
        };

        if (me.role === 'organizer') {
          if (!cancelled) {
            setOrganizerEmail(me.organizer?.email ?? null);
            setState('ok');
          }
          return;
        }

        if (!cancelled) setState('denied');
      } catch {
        if (!cancelled) setState('denied');
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="admin auth-screen">
        <p className="hint">Загрузка...</p>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="admin auth-screen">
        <h1>{BRAND.emoji} {BRAND.name}</h1>
        <p className="hint section-hint">
          Войдите по персональной ссылке организатора и паролю, которые выдал модератор.
        </p>
        <p className="hint hint-sm">Формат ссылки: {window.location.origin}/host/ваш-код</p>
      </div>
    );
  }

  return (
    <>
      {organizerEmail && (
        <div className="organizer-badge" title={organizerEmail}>
          {organizerEmail}
        </div>
      )}
      {children}
    </>
  );
}
