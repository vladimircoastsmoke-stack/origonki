import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BRAND } from '@decibel-racing/shared';
import { loginHost } from './lib/api';

export default function LoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!slug) {
      setError('Неверная ссылка — откройте персональную ссылку от модератора');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginHost(slug, password);
      window.location.href = '/admin/';
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="brand">{BRAND.emoji}</div>
      <h1>{BRAND.name}</h1>
      <p className="subtitle">Вход организатора</p>

      <div className="card">
        {!slug && <p className="error">Откройте вашу персональную ссылку вида /host/XXXX</p>}
        {error && <p className="error">{error}</p>}
        <label className="label">Пароль</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void submit()}
          autoFocus
        />
        <button type="button" className="btn" onClick={() => void submit()} disabled={loading || !slug}>
          {loading ? 'Вход...' : 'Войти в панель'}
        </button>
      </div>
    </div>
  );
}
