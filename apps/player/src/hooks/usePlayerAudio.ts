import { useEffect, useRef, useState, useCallback } from 'react';
import { SOCKET_EVENTS, chiptune, asCitySceneId, type CitySceneId } from '@decibel-racing/shared';
import type { Socket } from 'socket.io-client';

export function usePlayerAudio() {
  const [needsUnlock, setNeedsUnlock] = useState(true);

  const unlock = useCallback(async () => {
    const ok = await chiptune.unlock();
    if (ok) setNeedsUnlock(false);
  }, []);

  useEffect(() => {
    const tryAuto = () => {
      void unlock();
    };
    tryAuto();
    window.addEventListener('pointerdown', tryAuto);
    window.addEventListener('keydown', tryAuto);
    return () => {
      window.removeEventListener('pointerdown', tryAuto);
      window.removeEventListener('keydown', tryAuto);
    };
  }, [unlock]);

  return { needsUnlock, unlock, audioReady: !needsUnlock };
}

export function useCountdownBeep(
  socket: Socket,
  cityId: CitySceneId | string | undefined,
  audioReady: boolean,
) {
  const prevCountdown = useRef<number | undefined>();
  const city = cityId ? asCitySceneId(cityId) : undefined;

  useEffect(() => {
    if (!audioReady || !city) return;

    const onTick = (data: { value: number }) => {
      if (prevCountdown.current === data.value) return;
      prevCountdown.current = data.value;
      chiptune.playCountdownTick(data.value, city);
    };

    socket.on(SOCKET_EVENTS.SERVER_COUNTDOWN_TICK, onTick);
    return () => {
      socket.off(SOCKET_EVENTS.SERVER_COUNTDOWN_TICK, onTick);
    };
  }, [socket, city, audioReady]);
}
