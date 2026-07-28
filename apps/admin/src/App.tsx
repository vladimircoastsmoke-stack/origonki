import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  SOCKET_EVENTS,
  CITIES,
  CARS,
  DEFAULT_AVAILABLE_CARS,
  type Room,
  type Player,
} from '@decibel-racing/shared';
import { getSocket, getJoinUrl, getServerUrl, resolveBigScreenUrl } from './lib/socket';
import './App.css';

type Step = 'create' | 'lobby';

function App() {
  const [step, setStep] = useState<Step>('create');
  const [room, setRoom] = useState<Room | null>(null);
  const [maxPlayers, setMaxPlayers] = useState<2 | 4>(4);
  const [selectedCity, setSelectedCity] = useState(CITIES[0].id);
  const [selectedCars, setSelectedCars] = useState<string[]>([...DEFAULT_AVAILABLE_CARS]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [results, setResults] = useState<(Player & { place: number })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = getSocket();

  useEffect(() => {
    socket.on(SOCKET_EVENTS.SERVER_ROOM_UPDATE, (updatedRoom: Room) => {
      if (room && updatedRoom.id === room.id) {
        setRoom(updatedRoom);
      }
    });

    socket.on(SOCKET_EVENTS.SERVER_RACE_FINISHED, (data: { results: (Player & { place: number })[] }) => {
      setResults(data.results);
    });

    socket.on(SOCKET_EVENTS.SERVER_ERROR, (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.off(SOCKET_EVENTS.SERVER_ROOM_UPDATE);
      socket.off(SOCKET_EVENTS.SERVER_RACE_FINISHED);
      socket.off(SOCKET_EVENTS.SERVER_ERROR);
    };
  }, [socket, room?.id]);

  const createRoom = useCallback(() => {
    socket.emit(
      SOCKET_EVENTS.ADMIN_CREATE_ROOM,
      { maxPlayers, city: selectedCity },
      (response: { roomId?: string; room?: Room; error?: string }) => {
        if (response.error) {
          setError(response.error);
          return;
        }
        if (response.room) {
          setRoom(response.room);
          socket.emit(SOCKET_EVENTS.ADMIN_SET_CARS, {
            roomId: response.room.id,
            carIds: selectedCars,
          });
          setStep('lobby');
        }
      }
    );
  }, [socket, maxPlayers, selectedCity, selectedCars]);

  const handleLogoUpload = async (file: File) => {
    if (!room) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const res = await fetch(`${getServerUrl()}/api/upload-logo/${room.id}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.logoUrl) {
        setLogoPreview(`${getServerUrl()}${data.logoUrl}`);
      }
    } catch {
      setError('Ошибка загрузки логотипа');
    }
  };

  const toggleCar = (carId: string) => {
    setSelectedCars((prev) =>
      prev.includes(carId)
        ? prev.length > 2
          ? prev.filter((c) => c !== carId)
          : prev
        : [...prev, carId]
    );
  };

  const startCountdown = () => {
    if (!room) return;
    setError(null);
    socket.emit(SOCKET_EVENTS.ADMIN_START_COUNTDOWN, { roomId: room.id });
  };

  const restartRace = () => {
    if (!room) return;
    setResults([]);
    socket.emit(SOCKET_EVENTS.ADMIN_RESTART_RACE, { roomId: room.id });
  };

  const newGame = () => {
    if (!room) return;
    setResults([]);
    socket.emit(SOCKET_EVENTS.ADMIN_NEW_GAME, { roomId: room.id });
  };

  const allReady = room?.players.every((p) => p.carId) && (room?.players.length ?? 0) >= 2;

  if (step === 'create') {
    return (
      <div className="admin">
        <header className="admin-header">
          <h1>🏎️ Decibel Racing</h1>
          <p>Панель ведущего</p>
        </header>

        {error && <div className="section" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{error}</div>}

        <section className="section">
          <h2 className="section-title">Количество игроков</h2>
          <div className="radio-group">
            {([2, 4] as const).map((n) => (
              <div
                key={n}
                className={`radio-option ${maxPlayers === n ? 'selected' : ''}`}
                onClick={() => setMaxPlayers(n)}
              >
                {n} игрока
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Выберите трассу</h2>
          <div className="card-grid">
            {CITIES.map((city) => (
              <div
                key={city.id}
                className={`card ${selectedCity === city.id ? 'selected' : ''}`}
                onClick={() => setSelectedCity(city.id)}
              >
                <div
                  className="card-preview"
                  style={{ background: `linear-gradient(135deg, ${city.gradient[0]}, ${city.gradient[1]})` }}
                />
                <strong>{city.name}</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  {city.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Доступные машины</h2>
          <div className="card-grid">
            {CARS.map((car) => (
              <div
                key={car.id}
                className={`card ${selectedCars.includes(car.id) ? 'selected' : ''}`}
                onClick={() => toggleCar(car.id)}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{car.emoji}</div>
                <strong>{car.name}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="btn-group">
          <button className="btn btn-primary" onClick={createRoom}>
            Создать комнату
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <h1>🏎️ Decibel Racing</h1>
        <span className={`status-badge status-${room?.status}`}>{room?.status}</span>
      </header>

      {error && (
        <div className="section" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '1rem' }}>
          {error}
          <button className="btn btn-secondary" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }} onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      <section className="section qr-section">
        <div className="room-code">{room?.id}</div>
        <div className="qr-wrapper">
          {room && <QRCodeSVG value={getJoinUrl(room.id)} size={200} />}
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Отсканируйте QR или введите код на телефоне
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Big Screen: <a href={room ? resolveBigScreenUrl(room.id) : '#'} target="_blank" rel="noreferrer">
            {room ? resolveBigScreenUrl(room.id) : ''}
          </a>
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Логотип мероприятия</h2>
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleLogoUpload(file);
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png,image/jpeg,image/svg+xml';
            input.onchange = () => {
              const file = input.files?.[0];
              if (file) handleLogoUpload(file);
            };
            input.click();
          }}
        >
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="logo-preview" />
          ) : (
            <>
              <p>📁 Перетащите логотип сюда</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PNG, JPG, SVG до 2 МБ</p>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">
          Лобби ({room?.players.length ?? 0}/{room?.maxPlayers})
        </h2>
        <ul className="lobby-list">
          {room?.players.map((player) => {
            const car = CARS.find((c) => c.id === player.carId);
            return (
              <li key={player.id} className="lobby-item">
                <span className="lobby-item-name">{player.nickname}</span>
                <span className="lobby-item-car">
                  {car ? `${car.emoji} ${car.name}` : '—'}
                </span>
                <span className={player.carId ? 'lobby-item-ready' : 'lobby-item-waiting'}>
                  {player.carId ? '✓ Готов' : 'Выбирает машину...'}
                </span>
              </li>
            );
          })}
          {room?.players.length === 0 && (
            <li style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              Ожидаем игроков...
            </li>
          )}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">Управление</h2>
        <div className="btn-group">
          <button className="btn btn-primary" onClick={startCountdown} disabled={!allReady || room?.status !== 'lobby'}>
            🏁 Старт
          </button>
          <button className="btn btn-secondary" onClick={restartRace} disabled={room?.status === 'lobby'}>
            🔄 Рестарт
          </button>
          <button className="btn btn-danger" onClick={newGame}>
            🆕 Новая игра
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <section className="section">
          <h2 className="section-title">Результаты</h2>
          <table className="results-table">
            <thead>
              <tr>
                <th>Место</th>
                <th>Игрок</th>
                <th>Машина</th>
                <th>Прогресс</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const car = CARS.find((c) => c.id === r.carId);
                return (
                  <tr key={r.id}>
                    <td className={`place-${r.place}`}>#{r.place}</td>
                    <td>{r.nickname}</td>
                    <td>{car ? `${car.emoji} ${car.name}` : '—'}</td>
                    <td>{Math.round(r.progress)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default App;
