import { useEffect, useRef } from 'react';
import { SOCKET_EVENTS, audioSettings, chiptune, asCitySceneId, type CitySceneId } from '@decibel-racing/shared';
import type { Socket } from 'socket.io-client';

export function useCountdownBeep(
  socket: Socket,
  cityId: CitySceneId | string,
  audioReady: boolean,
) {
  const prevCountdown = useRef<number | undefined>();
  const city = asCitySceneId(cityId);

  useEffect(() => {
    if (!audioReady) return;

    const onTick = (data: { value: number }) => {
      if (!audioSettings.shouldPlaySfx()) return;
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
