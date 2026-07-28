import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  SOCKET_EVENTS,
  CITIES,
  CARS,
  type Room,
  type Player,
} from '@decibel-racing/shared';
import { getSocket, getJoinUrl, getServerUrl } from './lib/socket';
import { RaceTrack } from './components/RaceTrack';
import { Countdown, Podium } from './components/Overlays';
import './App.css';

function App() {
  const params = new URLSearchParams(window.location.search);
  const roomIdParam = params.get('room');

  const [room, setRoom] = useState<Room | null>(null);
  const [countdown, setCountdown] = useState<number | undefined>();
  const [results, setResults] = useState<(Player & { place: number })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = getSocket();

  useEffect(() => {
    if (!roomIdParam) {
      setError('Укажите room ID в URL: ?room=XXXX');
      return;
    }

    socket.emit(SOCKET_EVENTS.BIGSCREEN_JOIN, { roomId: roomIdParam }, (response: { room?: Room; error?: string }) => {
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.room) setRoom(response.room);
    });

    socket.on(SOCKET_EVENTS.SERVER_ROOM_UPDATE, (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on(SOCKET_EVENTS.SERVER_COUNTDOWN_TICK, (data: { value: number }) => {
      setCountdown(data.value);
    });

    socket.on(SOCKET_EVENTS.SERVER_RACE_FINISHED, (data: { results: (Player & { place: number })[] }) => {
      setResults(data.results);
    });

    return () => {
      socket.off(SOCKET_EVENTS.SERVER_ROOM_UPDATE);
      socket.off(SOCKET_EVENTS.SERVER_COUNTDOWN_TICK);
      socket.off(SOCKET_EVENTS.SERVER_RACE_FINISHED);
    };
  }, [socket, roomIdParam]);

  const city = CITIES.find((c) => c.id === room?.city) || CITIES[0];
  const logoUrl = room?.eventLogoUrl ? `${getServerUrl()}${room.eventLogoUrl}` : undefined;

  if (error) {
    return (
      <div className="bigscreen error-screen">
        <h1>⚠️ {error}</h1>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bigscreen loading-screen">
        <div className="loading-spinner" />
        <p>Подключение...</p>
      </div>
    );
  }

  if (room.status === 'countdown') {
    return (
      <div className="bigscreen">
        <Countdown value={countdown ?? room.countdownValue} />
      </div>
    );
  }

  if (room.status === 'finished' && results.length > 0) {
    return (
      <div className="bigscreen">
        <Podium results={results} logoUrl={logoUrl} />
      </div>
    );
  }

  if (room.status === 'racing') {
    return (
      <div className="bigscreen">
        <div className="race-header">
          <h1 className="race-title">{city.name}</h1>
          {logoUrl && <img src={logoUrl} alt="Event" className="race-logo" />}
        </div>
        <RaceTrack
          players={room.players}
          maxPlayers={room.maxPlayers}
          cityGradient={city.gradient}
          accent={city.accent}
        />
      </div>
    );
  }

  return (
    <div className="bigscreen lobby-screen" style={{ background: `linear-gradient(135deg, ${city.gradient[0]}, ${city.gradient[1]})` }}>
      {logoUrl && <img src={logoUrl} alt="Event" className="lobby-logo" />}
      <h1 className="lobby-title">🏎️ Decibel Racing</h1>
      <p className="lobby-subtitle">{city.name}</p>

      <div className="lobby-qr">
        <div className="qr-wrapper">
          <QRCodeSVG value={getJoinUrl(room.id)} size={280} />
        </div>
        <div className="lobby-code">{room.id}</div>
        <p className="lobby-hint">Отсканируйте QR или введите код</p>
      </div>

      <div className="lobby-players">
        <h2>Игроки ({room.players.length}/{room.maxPlayers})</h2>
        <div className="player-chips">
          {room.players.map((p) => {
            const car = CARS.find((c) => c.id === p.carId);
            return (
              <div key={p.id} className="player-chip">
                <span>{car?.emoji || '👤'}</span>
                <span>{p.nickname}</span>
                {p.carId && <span className="chip-ready">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
