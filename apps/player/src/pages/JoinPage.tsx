import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SOCKET_EVENTS,
  CARS,
  type Room,
  type Player,
} from '@decibel-racing/shared';
import { getSocket } from '../lib/socket';
import {
  useMicrophone,
  useVolumeSender,
  savePlayerSession,
  loadPlayerSession,
} from '../hooks/useMicrophone';

type Screen = 'nickname' | 'car' | 'waiting' | 'racing' | 'results' | 'mic-error';

export default function JoinPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [screen, setScreen] = useState<Screen>('nickname');
  const [nickname, setNickname] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [persistedId, setPersistedId] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myPlace, setMyPlace] = useState<number | null>(null);

  const socket = getSocket();
  const { volume, isActive, error: micError, start: startMic, stop: stopMic } = useMicrophone();

  const sendVolume = useCallback(
    (value: number) => {
      socket.emit(SOCKET_EVENTS.PLAYER_VOLUME, { value });
    },
    [socket]
  );

  useVolumeSender(volume, isActive && screen === 'racing', sendVolume);

  useEffect(() => {
    if (!roomId) return;

    const session = loadPlayerSession(roomId);
    if (session) {
      setNickname(session.nickname);
      setPersistedId(session.persistedId);
      socket.emit(
        SOCKET_EVENTS.PLAYER_REJOIN,
        { roomId, persistedId: session.persistedId },
        (response: { player?: Player; room?: Room; error?: string }) => {
          if (response.room) {
            setRoom(response.room);
            if (response.player) {
              setPlayer(response.player);
              if (response.player.carId) {
                setSelectedCar(response.player.carId);
                setScreen(response.room.status === 'racing' ? 'racing' : 'waiting');
              } else {
                setScreen('car');
              }
            }
          }
        }
      );
    }

    socket.on(SOCKET_EVENTS.SERVER_ROOM_UPDATE, (updatedRoom: Room) => {
      setRoom(updatedRoom);
      const me = updatedRoom.players.find(
        (p) => p.id === socket.id || (persistedId && p.nickname === nickname)
      );
      if (me) setPlayer(me);

      if (updatedRoom.status === 'countdown' || updatedRoom.status === 'racing') {
        if (screen !== 'racing' && me?.carId) {
          setScreen('racing');
          if (!isActive) startMic();
        }
      }
      if (updatedRoom.status === 'lobby' && screen === 'results') {
        setScreen('waiting');
        setMyPlace(null);
      }
    });

    socket.on(SOCKET_EVENTS.SERVER_RACE_FINISHED, (data: { results: (Player & { place: number })[] }) => {
      const me = data.results.find((r) => r.nickname === nickname);
      setMyPlace(me?.place ?? null);
      setScreen('results');
      stopMic();
    });

    return () => {
      socket.off(SOCKET_EVENTS.SERVER_ROOM_UPDATE);
      socket.off(SOCKET_EVENTS.SERVER_RACE_FINISHED);
    };
  }, [socket, roomId, persistedId, nickname, screen, isActive, startMic, stopMic]);

  const joinRoom = () => {
    if (!roomId || !nickname.trim()) return;
    setError(null);

    socket.emit(
      SOCKET_EVENTS.PLAYER_JOIN,
      { roomId, nickname: nickname.trim(), persistedId: persistedId ?? undefined },
      (response: { player?: Player; room?: Room; persistedId?: string; error?: string }) => {
        if (response.error) {
          setError(response.error);
          return;
        }
        if (response.room) setRoom(response.room);
        if (response.player) setPlayer(response.player);
        if (response.persistedId) {
          setPersistedId(response.persistedId);
          savePlayerSession(roomId, response.persistedId, nickname.trim());
        }
        setScreen('car');
      }
    );
  };

  const selectCar = (carId: string) => {
    setSelectedCar(carId);
    socket.emit(SOCKET_EVENTS.PLAYER_SELECT_CAR, { carId }, (response: { error?: string }) => {
      if (response?.error) {
        setError(response.error);
        setSelectedCar(null);
      } else {
        setScreen('waiting');
      }
    });
  };

  const availableCars = CARS.filter((c) => room?.availableCars.includes(c.id));
  const takenCars = new Set(room?.players.filter((p) => p.carId && p.id !== socket.id).map((p) => p.carId));

  if (screen === 'nickname') {
    return (
      <div className="player-screen">
        <h1 className="player-title">🏎️ Decibel Racing</h1>
        <p className="player-subtitle">Комната: {roomId}</p>
        <input
          className="player-input"
          placeholder="Ваш никнейм"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          autoFocus
        />
        {error && <p className="player-error">{error}</p>}
        <button className="player-btn" onClick={joinRoom} disabled={!nickname.trim()}>
          Войти
        </button>
      </div>
    );
  }

  if (screen === 'car') {
    return (
      <div className="player-screen">
        <h1 className="player-title">Выберите машину</h1>
        {error && <p className="player-error">{error}</p>}
        <div className="car-grid">
          {availableCars.map((car) => {
            const taken = takenCars.has(car.id);
            return (
              <button
                key={car.id}
                className={`car-card ${selectedCar === car.id ? 'selected' : ''} ${taken ? 'taken' : ''}`}
                onClick={() => !taken && selectCar(car.id)}
                disabled={taken}
              >
                <span className="car-emoji">{car.emoji}</span>
                <span className="car-name">{car.name}</span>
                {taken && <span className="car-taken-label">Занята</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === 'waiting') {
    return (
      <div className="player-screen waiting">
        <div className="pulse-icon">🏎️</div>
        <h1>Ждём старта...</h1>
        <p className="player-subtitle">
          {room?.players.length ?? 0}/{room?.maxPlayers} игроков
        </p>
        {selectedCar && (
          <p>{CARS.find((c) => c.id === selectedCar)?.emoji} {CARS.find((c) => c.id === selectedCar)?.name}</p>
        )}
      </div>
    );
  }

  if (screen === 'racing') {
    if (micError && !isActive) {
      return (
        <div className="player-screen mic-error">
          <h1>🎤 Нужен микрофон!</h1>
          {micError === 'permission_denied' && (
            <>
              <p>Разрешите доступ к микрофону для участия в гонке.</p>
              <div className="mic-instructions">
                <p><strong>iOS Safari:</strong> Настройки → Safari → Микрофон → Разрешить</p>
                <p><strong>Android Chrome:</strong> Нажмите 🔒 в адресной строке → Микрофон → Разрешить</p>
                <p>После этого нажмите кнопку ниже.</p>
              </div>
            </>
          )}
          {micError === 'no_microphone' && <p>Микрофон не найден на устройстве.</p>}
          <button className="player-btn" onClick={startMic}>
            🎤 Включить микрофон
          </button>
        </div>
      );
    }

    const myProgress = player?.progress ?? 0;
    const sorted = [...(room?.players ?? [])].sort((a, b) => b.progress - a.progress);
    const myRank = sorted.findIndex((p) => p.nickname === nickname) + 1;

    return (
      <div className="player-screen racing">
        <div className="rank-badge">#{myRank || '?'}</div>

        <motion.div
          className="volume-circle"
          animate={{
            scale: 1 + volume * 0.8,
            boxShadow: `0 0 ${20 + volume * 60}px rgba(0, 212, 255, ${0.3 + volume * 0.5})`,
          }}
          transition={{ duration: 0.1 }}
        >
          <span className="volume-emoji">🔊</span>
          <p className="volume-label">КРИЧИ!</p>
          <div className="volume-percent">{Math.round(volume * 100)}%</div>
        </motion.div>

        <div className="mini-progress">
          <div className="mini-progress-bar">
            <motion.div
              className="mini-progress-fill"
              animate={{ width: `${myProgress}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
          <span>{Math.round(myProgress)}%</span>
        </div>

        <div className="opponents">
          {sorted.filter((p) => p.nickname !== nickname).map((p) => (
            <div key={p.id} className="opponent-row">
              <span>{p.nickname}</span>
              <div className="opponent-bar">
                <div className="opponent-fill" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'results') {
    return (
      <div className="player-screen results">
        <div className="result-place">#{myPlace}</div>
        <h1>{myPlace === 1 ? '🏆 Победа!' : myPlace === 2 ? '🥈' : myPlace === 3 ? '🥉' : 'Финиш!'}</h1>
        <p className="player-subtitle">Вы заняли {myPlace} место</p>
        <button className="player-btn" onClick={() => setScreen('waiting')}>
          Играть ещё
        </button>
      </div>
    );
  }

  return null;
}
