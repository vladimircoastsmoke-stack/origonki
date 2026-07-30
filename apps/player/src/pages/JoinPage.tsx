import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SOCKET_EVENTS,
  BRAND,
  getCityById,
  getCarById,
  type Room,
  type Player,
} from '@decibel-racing/shared';
import { getSocket, isSocketConnected } from '../lib/socket';
import {
  useMicrophone,
  useVolumeSender,
  savePlayerSession,
  loadPlayerSession,
} from '../hooks/useMicrophone';
import { GameIntroBox } from '../components/GameIntro';
import { ShoutHero } from '../components/ShoutHero';
import { CarSpriteMini } from '../components/CarSprite';
import { usePlayerAudio, useCountdownBeep } from '../hooks/usePlayerAudio';

type Screen = 'nickname' | 'car' | 'waiting' | 'racing' | 'results' | 'mic-error';

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
      {connected ? '● Связь с сервером' : '○ Нет связи с сервером'}
    </div>
  );
}

function RoomStatusHint({ room }: { room: Room | null }) {
  if (!room) return null;
  if (room.status === 'lobby') {
    return <p className="status-hint">Ждём, пока ведущий нажмёт «Старт»</p>;
  }
  if (room.status === 'countdown') {
    return <p className="status-hint">Старт через {room.countdownValue ?? '…'}</p>;
  }
  if (room.status === 'finished') {
    return <p className="status-hint">Гонка завершена</p>;
  }
  return null;
}

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
  const [connected, setConnected] = useState(isSocketConnected());

  const persistedIdRef = useRef<string | null>(null);
  persistedIdRef.current = persistedId;

  const socket = getSocket();
  const { volume, isActive, error: micError, start: startMic, stop: stopMic } = useMicrophone();
  const { audioReady } = usePlayerAudio();
  useCountdownBeep(socket, room?.city, audioReady);

  const city = room ? getCityById(room.city) : null;

  useEffect(() => {
    const cls = city ? `theme-city-${city.scene}` : '';
    document.body.className = cls;
    return () => {
      document.body.className = '';
    };
  }, [city?.scene]);

  const sendVolume = useCallback(
    (value: number) => {
      if (!socket.connected) return;
      socket.emit(SOCKET_EVENTS.PLAYER_VOLUME, {
        value,
        persistedId: persistedIdRef.current ?? undefined,
      });
    },
    [socket]
  );

  useVolumeSender(volume, isActive && screen === 'racing', sendVolume);

  const applyRoomUpdate = useCallback(
    (updatedRoom: Room) => {
      setRoom(updatedRoom);
      const me = updatedRoom.players.find(
        (p) =>
          p.id === socket.id ||
          (persistedIdRef.current && p.nickname === nickname) ||
          updatedRoom.players.length === 1
      );
      if (me) setPlayer(me);

      if (updatedRoom.status === 'countdown' || updatedRoom.status === 'racing') {
        setScreen((current) => {
          const hasCar = updatedRoom.players.some(
            (p) => p.id === socket.id || p.nickname === nickname
          );
          if (current !== 'racing' && current !== 'results' && hasCar) {
            return 'racing';
          }
          return current;
        });
      }
    },
    [socket.id, nickname]
  );

  useEffect(() => {
    if (!roomId) return;

    const session = loadPlayerSession(roomId);
    if (session) {
      setNickname(session.nickname);
      setPersistedId(session.persistedId);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !persistedId) return;

    const rejoin = () => {
      socket.emit(
        SOCKET_EVENTS.PLAYER_REJOIN,
        { roomId, persistedId },
        (response: { player?: Player; room?: Room; error?: string }) => {
          if (response.error) return;
          if (response.room) applyRoomUpdate(response.room);
          if (response.player) {
            setPlayer(response.player);
            if (response.player.carId) {
              setSelectedCar(response.player.carId);
              const status = response.room?.status;
              setScreen((current) => {
                if (current === 'results') return current;
                if (status === 'racing' || status === 'countdown') return 'racing';
                return 'waiting';
              });
            } else {
              setScreen('car');
            }
          }
        }
      );
    };

    socket.on('connect', rejoin);
    if (socket.connected) rejoin();

    return () => {
      socket.off('connect', rejoin);
    };
  }, [roomId, persistedId, socket, applyRoomUpdate]);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    socket.on(SOCKET_EVENTS.SERVER_ROOM_UPDATE, applyRoomUpdate);

    socket.on(SOCKET_EVENTS.SERVER_RACE_FINISHED, (data: { results: (Player & { place: number })[] }) => {
      const me = data.results.find((r) => r.nickname === nickname);
      setMyPlace(me?.place ?? null);
      setScreen('results');
      stopMic();
    });

    return () => {
      socket.off(SOCKET_EVENTS.SERVER_ROOM_UPDATE, applyRoomUpdate);
      socket.off(SOCKET_EVENTS.SERVER_RACE_FINISHED);
    };
  }, [socket, applyRoomUpdate, nickname, stopMic]);

  useEffect(() => {
    if (screen === 'racing' && !isActive && !micError && window.isSecureContext) {
      startMic();
    }
  }, [screen, isActive, micError, startMic]);

  const handleStartMic = () => {
    startMic();
  };

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

  const availableCars = (room?.availableCars ?? [])
    .map((id) => getCarById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const takenCars = new Set(room?.players.filter((p) => p.carId && p.id !== socket.id).map((p) => p.carId));

  if (screen === 'nickname') {
    return (
      <div className="player-screen">
        <ConnectionBadge connected={connected} />
        <div className="brand-mark">{BRAND.emoji}</div>
        <h1 className="player-title">{BRAND.name}</h1>
        <p className="player-subtitle">Комната: {roomId}</p>
        <GameIntroBox variant="player" />
        <input
          className="player-input"
          placeholder="Ваш никнейм"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          autoFocus
        />
        {error && <p className="player-error">{error}</p>}
        <button className="player-btn" onClick={joinRoom} disabled={!nickname.trim() || !connected}>
          Войти
        </button>
        {!connected && (
          <p className="player-error" style={{ marginTop: '1rem' }}>
            Подключение к серверу… Подождите пару секунд.
          </p>
        )}
      </div>
    );
  }

  if (screen === 'car') {
    return (
      <div className="player-screen">
        <ConnectionBadge connected={connected} />
        <ShoutHero className="player-hero-compact" />
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
                <CarSpriteMini carId={car.id} />
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
        <ConnectionBadge connected={connected} />
        <ShoutHero className="player-hero-compact" />
        <div className="pulse-icon">🏎️</div>
        <h1>Ждём старта...</h1>
        <RoomStatusHint room={room} />
        <p className="player-subtitle">
          {room?.players.length ?? 0}/{room?.maxPlayers} игроков
        </p>
        {selectedCar && (() => {
          const car = getCarById(selectedCar);
          return car ? (
            <p className="waiting-car">
              <CarSpriteMini carId={car.id} /> {car.name}
            </p>
          ) : null;
        })()}
        {!window.isSecureContext && (
          <p className="player-error" style={{ marginTop: '1rem' }}>
            ⚠️ Микрофон на iPhone работает только по HTTPS.<br />
            Используйте ссылку из «5-ТЕСТ-НА-IPHONE», не Wi-Fi.
          </p>
        )}
        {window.isSecureContext && !isActive && (
          <button className="player-btn" style={{ marginTop: '1.5rem' }} onClick={handleStartMic}>
            🎤 Проверить микрофон
          </button>
        )}
        {isActive && (
          <p style={{ color: 'var(--success)', marginTop: '1rem' }}>✓ Микрофон готов!</p>
        )}
      </div>
    );
  }

  if (screen === 'racing') {
    if (!isActive) {
      return (
        <div className="player-screen mic-error">
          <ConnectionBadge connected={connected} />
          <h1>🎤 Включите микрофон!</h1>
          {!connected && (
            <p className="player-error">Нет связи с сервером — громкость не доходит до игры.</p>
          )}
          {room?.status === 'lobby' && (
            <p className="status-hint">Гонка ещё не началась — попросите ведущего нажать «Старт»</p>
          )}
          {micError === 'insecure' && (
            <>
              <p className="player-error">
                Вы открыли игру по HTTP (Wi-Fi). На iPhone микрофон <strong>не работает</strong> без HTTPS.
              </p>
              <div className="mic-instructions">
                <p><strong>Решение:</strong></p>
                <p>1. На компьютере запустите <strong>5-ТЕСТ-НА-IPHONE</strong></p>
                <p>2. Откройте <strong>https://....pinggy.net/join/{roomId}</strong></p>
              </div>
            </>
          )}
          {micError === 'permission_denied' && (
            <>
              <p>Разрешите доступ к микрофону.</p>
              <div className="mic-instructions">
                <p><strong>iOS Safari:</strong> Настройки → Safari → Микрофон → Разрешить</p>
                <p><strong>Android Chrome:</strong> 🔒 в адресной строке → Микрофон → Разрешить</p>
              </div>
            </>
          )}
          {micError === 'no_microphone' && <p>Микрофон не найден.</p>}
          {micError === 'unsupported' && (
            <p className="player-error">Откройте в Chrome или Safari.</p>
          )}
          {!micError && <p>Нажмите кнопку и разрешите микрофон.</p>}
          {micError !== 'insecure' && (
            <button
              type="button"
              className="player-btn mic-btn"
              onClick={handleStartMic}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleStartMic();
              }}
            >
              🎤 Включить микрофон
            </button>
          )}
        </div>
      );
    }

    const myProgress = player?.progress ?? 0;
    const sorted = [...(room?.players ?? [])].sort((a, b) => b.progress - a.progress);
    const myRank = sorted.findIndex((p) => p.nickname === nickname) + 1;
    const raceActive = room?.status === 'racing';

    return (
      <div className="player-screen racing">
        <ConnectionBadge connected={connected} />
        {!raceActive && <RoomStatusHint room={room} />}
        {!connected && (
          <p className="player-error">Нет связи — машина не едет. Перезагрузите страницу.</p>
        )}

        <div className="rank-badge">#{myRank || '?'}</div>

        <motion.div
          className="volume-circle"
          animate={{
            scale: 1 + volume * 0.8,
            boxShadow: city
              ? `0 0 ${20 + volume * 40}px ${city.palette.accent}88`
              : `0 0 ${20 + volume * 60}px rgba(255, 107, 44, ${0.3 + volume * 0.5})`,
          }}
          transition={{ duration: 0.1 }}
        >
          <span className="volume-emoji">🔊</span>
          <p className="volume-label">{raceActive ? 'КРИЧИ!' : 'ЖДЁМ СТАРТ'}</p>
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
        <ShoutHero className="player-hero-compact" />
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
