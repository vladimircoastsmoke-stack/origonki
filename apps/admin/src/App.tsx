import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  SOCKET_EVENTS,
  CITIES,
  CARS,
  DEFAULT_AVAILABLE_CARS,
  MAX_PLAYER_OPTIONS,
  BRAND,
  type Room,
  type Player,
  type MaxPlayers,
} from '@decibel-racing/shared';
import { getSocket, getJoinUrl, getServerUrl, resolveBigScreenUrl } from './lib/socket';
import { useAdminAudio } from './hooks/useAdminAudio';
import './App.css';

type Step = 'create' | 'lobby';

function App() {
  const [step, setStep] = useState<Step>('create');
  const [room, setRoom] = useState<Room | null>(null);
  const [maxPlayers, setMaxPlayers] = useState<MaxPlayers>(4);
  const [selectedCity, setSelectedCity] = useState(CITIES[0].id);
  const [selectedCars, setSelectedCars] = useState<string[]>([...DEFAULT_AVAILABLE_CARS]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [results, setResults] = useState<(Player & { place: number })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locationTouched, setLocationTouched] = useState(false);

  const socket = getSocket();
  const { needsUnlock, unlock } = useAdminAudio(
    step,
    selectedCity,
    room?.city,
    room?.status,
    locationTouched,
  );

  const audioHint = needsUnlock ? (
    <button type="button" className="audio-unlock-hint" onClick={() => void unlock()}>
      🔊 Нажмите для музыки
    </button>
  ) : null;

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

  const allReady =
    room?.players.every((p) => p.carId) &&
    (room?.players.length ?? 0) >= 1 &&
    (room?.players.length ?? 0) <= (room?.maxPlayers ?? 10);

  if (step === 'create') {
    return (
      <div className="admin">
        {audioHint}
        <header className="admin-header">
          <div className="brand-logo">{BRAND.emoji}</div>
          <h1>{BRAND.name}</h1>
          <p>{BRAND.tagline} · Панель ведущего</p>
        </header>

        {error && <div className="section section-error">{error}</div>}

        <section className="section">
          <h2 className="section-title">Количество игроков</h2>
          <div className="radio-group radio-group-players">
            {MAX_PLAYER_OPTIONS.map((n) => (
              <div
                key={n}
                className={`radio-option ${maxPlayers === n ? 'selected' : ''}`}
                onClick={() => setMaxPlayers(n)}
              >
                <span className="radio-num">{n}</span>
                <span className="radio-label">игроков</span>
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
                className={`card card-dendy ${selectedCity === city.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCity(city.id);
                  setLocationTouched(true);
                }}
              >
                <div className={`card-preview admin-scene-preview pixel-scene-${city.scene}`} />
                <strong>{city.name}</strong>
                <p className="card-desc">{city.description}</p>
                <span className="card-badge">8-BIT</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Доступные машины ({selectedCars.length})</h2>
          <div className="card-grid card-grid-cars">
            {CARS.map((car) => (
              <div
                key={car.id}
                className={`card card-car ${selectedCars.includes(car.id) ? 'selected' : ''}`}
                onClick={() => toggleCar(car.id)}
              >
                <div className="car-emoji" style={{ color: car.color }}>{car.emoji}</div>
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
      {audioHint}
      <header className="admin-header admin-header-compact">
        <div className="admin-header-row">
          <h1>{BRAND.emoji} {BRAND.name}</h1>
          <span className={`status-badge status-${room?.status}`}>{room?.status}</span>
        </div>
      </header>

      {error && (
        <div className="section section-error">
          {error}
          <button className="btn btn-secondary btn-sm" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <section className="section qr-section">
        <div className="room-code">{room?.id}</div>
        <div className="qr-wrapper">
          {room && <QRCodeSVG value={getJoinUrl(room.id)} size={200} fgColor="#2D1B4E" />}
        </div>
        <p className="hint">Отсканируйте QR или введите код на телефоне</p>
        <p className="hint hint-sm">
          Big Screen:{' '}
          <a href={room ? resolveBigScreenUrl(room.id) : '#'} target="_blank" rel="noreferrer">
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
              <p className="hint hint-sm">PNG, JPG, SVG до 2 МБ</p>
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
            <li className="lobby-empty">Ожидаем игроков...</li>
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
