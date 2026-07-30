import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  SOCKET_EVENTS,
  CITIES,
  BRAND,
  getCityById,
  type Room,
  type Player,
} from '@decibel-racing/shared';
import { getSocket, getJoinUrl, getServerUrl } from './lib/socket';
import { RaceTrack } from './components/RaceTrack';
import { Countdown, Podium } from './components/Overlays';
import { PixelScene } from './components/PixelScene';
import { CarSpriteMini } from './components/CarSprite';
import { useGameAudio } from './hooks/useGameAudio';
import { GameIntroBox } from './components/GameIntro';
import { ShoutHero } from './components/ShoutHero';
import './App.css';
import './pixel-scenes.css';

function CityBackdrop({ cityId }: { cityId: string }) {
  const city = getCityById(cityId);
  return (
    <>
      <PixelScene city={city} />
      <div className="scanlines" aria-hidden />
    </>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const roomIdParam = params.get('room');

  const [room, setRoom] = useState<Room | null>(null);
  const [countdown, setCountdown] = useState<number | undefined>();
  const [results, setResults] = useState<(Player & { place: number })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = getSocket();
  const city = getCityById(room?.city ?? CITIES[0].id);
  const logoUrl = room?.eventLogoUrl ? `${getServerUrl()}${room.eventLogoUrl}` : undefined;

  const audioStatus = room?.status === 'countdown'
    ? 'countdown'
    : room?.status === 'racing'
      ? 'racing'
      : room?.status === 'finished'
        ? 'finished'
        : room
          ? 'waiting'
          : undefined;

  const { needsUnlock, unlock } = useGameAudio(audioStatus, city.id, countdown);

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

  const audioHint = needsUnlock ? (
    <button type="button" className="audio-unlock-hint" onClick={() => void unlock()}>
      🔊 Нажмите для музыки
    </button>
  ) : null;

  if (error) {
    return (
      <div className="bigscreen theme-dendy error-screen">
        <ShoutHero className="bigscreen-hero" />
        <h1>⚠️ {error}</h1>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bigscreen theme-dendy loading-screen">
        <ShoutHero className="bigscreen-hero" />
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (room.status === 'countdown') {
    return (
      <div className={`bigscreen theme-dendy scene-${city.scene}`}>
        <CityBackdrop cityId={city.id} />
        <Countdown value={countdown ?? room.countdownValue} city={city} />
        {audioHint}
      </div>
    );
  }

  if (room.status === 'finished' && results.length > 0) {
    return (
      <div className={`bigscreen theme-dendy scene-${city.scene}`}>
        <CityBackdrop cityId={city.id} />
        <Podium results={results} logoUrl={logoUrl} city={city} />
        {audioHint}
      </div>
    );
  }

  if (room.status === 'racing') {
    return (
      <div className={`bigscreen theme-dendy scene-${city.scene}`}>
        <CityBackdrop cityId={city.id} />
        <div className="race-header">
          <h1 className="race-title">{city.name}</h1>
          {logoUrl && <img src={logoUrl} alt="Event" className="race-logo" />}
        </div>
        <RaceTrack players={room.players} maxPlayers={room.maxPlayers} city={city} />
        {audioHint}
      </div>
    );
  }

  return (
    <div className={`bigscreen theme-dendy lobby-screen lobby-dendy scene-${city.scene}`}>
      <CityBackdrop cityId={city.id} />
      {audioHint}
      {logoUrl && <img src={logoUrl} alt="Event" className="lobby-logo" />}
      <h1 className="lobby-title">{BRAND.emoji} {BRAND.name}</h1>
      <p className="lobby-subtitle">{city.name}</p>

      <GameIntroBox variant="compact" />

      <div className="lobby-qr">
        <div className="qr-wrapper">
          <QRCodeSVG value={getJoinUrl(room.id)} size={280} fgColor="#0c0c44" />
        </div>
        <div className="lobby-code">{room.id}</div>
        <p className="lobby-hint">Отсканируйте QR или введите код</p>
      </div>

      <div className="lobby-players">
        <h2>Игроки ({room.players.length}/{room.maxPlayers})</h2>
        <div className="player-chips">
          {room.players.map((p) => (
            <div key={p.id} className="player-chip">
              {p.carId ? <CarSpriteMini carId={p.carId} /> : <span>👤</span>}
              <span>{p.nickname}</span>
              {p.carId && <span className="chip-ready">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
