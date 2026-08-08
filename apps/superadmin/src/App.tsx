import { useCallback, useEffect, useState } from 'react';
import { BRAND } from '@decibel-racing/shared';
import { api, fullHostUrl } from './lib/api';

interface Organizer {
  id: string;
  email: string;
  slug: string;
  blocked: boolean;
  createdAt: number;
}

interface CreatedOrganizer {
  organizer: Organizer;
  plainPassword: string;
  hostUrl: string;
}

export default function App() {
  const [role, setRole] = useState<'loading' | 'guest' | 'superadmin'>('loading');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [email, setEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [created, setCreated] = useState<CreatedOrganizer | null>(null);
  const [resetInfo, setResetInfo] = useState<{ email: string; password: string; slug: string } | null>(null);

  const loadMe = useCallback(async () => {
    const me = await api<{ role: string | null }>('/api/auth/me');
    setRole(me.role === 'superadmin' ? 'superadmin' : 'guest');
  }, []);

  const loadOrganizers = useCallback(async () => {
    const data = await api<{ organizers: Organizer[] }>('/api/auth/superadmin/organizers');
    setOrganizers(data.organizers);
  }, []);

  useEffect(() => {
    loadMe().catch(() => setRole('guest'));
  }, [loadMe]);

  useEffect(() => {
    if (role === 'superadmin') {
      loadOrganizers().catch((e: Error) => setError(e.message));
    }
  }, [role, loadOrganizers]);

  const login = async () => {
    setError(null);
    try {
      await api('/api/auth/superadmin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setRole('superadmin');
      setPassword('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' });
    setRole('guest');
    setOrganizers([]);
  };

  const createOrganizer = async () => {
    setError(null);
    setCreated(null);
    try {
      const result = await api<CreatedOrganizer>('/api/auth/superadmin/organizers', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: customPassword || undefined,
        }),
      });
      setCreated(result);
      setEmail('');
      setCustomPassword('');
      await loadOrganizers();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const toggleBlock = async (org: Organizer) => {
    setError(null);
    try {
      await api(`/api/auth/superadmin/organizers/${org.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ blocked: !org.blocked }),
      });
      await loadOrganizers();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const resetPassword = async (org: Organizer) => {
    setError(null);
    setResetInfo(null);
    try {
      const result = await api<{ organizer: Organizer; plainPassword: string }>(
        `/api/auth/superadmin/organizers/${org.id}/reset-password`,
        { method: 'POST', body: JSON.stringify({}) },
      );
      setResetInfo({
        email: result.organizer.email,
        password: result.plainPassword,
        slug: result.organizer.slug,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copyCredentials = (slug: string, pwd: string, mail: string) => {
    const text = `ОриГonki — доступ организатора\n\nСсылка: ${fullHostUrl(slug)}\nПароль: ${pwd}\nEmail: ${mail}`;
    void navigator.clipboard.writeText(text);
  };

  if (role === 'loading') {
    return <div className="page">Загрузка...</div>;
  }

  if (role === 'guest') {
    return (
      <div className="page">
        <h1>{BRAND.emoji} Офис {BRAND.name}</h1>
        <p className="subtitle">Вход супер-админа</p>
        <div className="card" style={{ maxWidth: 420 }}>
          {error && <p className="error">{error}</p>}
          <div className="field">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void login()}
            />
          </div>
          <button type="button" className="btn" onClick={() => void login()}>
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <h1>{BRAND.emoji} Офис модератора</h1>
          <p className="subtitle">Подключение покупателей игры</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => void logout()}>
          Выйти
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h2>+ Новый организатор</h2>
        <div className="field">
          <label>Email покупателя</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@company.ru"
          />
        </div>
        <div className="field">
          <label>Пароль (необязательно — сгенерируется сам)</label>
          <input
            type="text"
            value={customPassword}
            onChange={(e) => setCustomPassword(e.target.value)}
            placeholder="минимум 6 символов"
          />
        </div>
        <button type="button" className="btn" onClick={() => void createOrganizer()} disabled={!email.trim()}>
          Создать доступ
        </button>

        {created && (
          <div className="success-box">
            <strong>Готово — отправьте клиенту:</strong>
            <br />
            Ссылка: {fullHostUrl(created.organizer.slug)}
            <br />
            Пароль: {created.plainPassword}
            <br />
            Email: {created.organizer.email}
            <br />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '0.75rem' }}
              onClick={() =>
                copyCredentials(created.organizer.slug, created.plainPassword, created.organizer.email)
              }
            >
              Скопировать
            </button>
          </div>
        )}
      </div>

      {resetInfo && (
        <div className="success-box">
          <strong>Новый пароль для {resetInfo.email}:</strong>
          <br />
          {resetInfo.password}
          <br />
          Ссылка: {fullHostUrl(resetInfo.slug)}
        </div>
      )}

      <div className="card">
        <h2>Организаторы ({organizers.length})</h2>
        {organizers.length === 0 ? (
          <p className="subtitle">Пока никого нет</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Ссылка</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((org) => (
                <tr key={org.id}>
                  <td>{org.email}</td>
                  <td>/host/{org.slug}</td>
                  <td className={org.blocked ? 'badge-blocked' : 'badge-active'}>
                    {org.blocked ? 'Заблокирован' : 'Активен'}
                  </td>
                  <td>
                    <div className="actions">
                      <button type="button" className="btn btn-secondary" onClick={() => void toggleBlock(org)}>
                        {org.blocked ? 'Разблок.' : 'Блок.'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => void resetPassword(org)}>
                        Новый пароль
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
