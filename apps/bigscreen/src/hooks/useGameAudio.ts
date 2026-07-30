import { useEffect, useRef, useState, useCallback } from 'react';
import { chiptune, type CitySceneId } from '@decibel-racing/shared';

type RoomStatus = 'waiting' | 'countdown' | 'racing' | 'finished';

export function useGameAudio(
  roomStatus: RoomStatus | undefined,
  cityId: CitySceneId,
  countdown?: number,
) {
  const [needsUnlock, setNeedsUnlock] = useState(true);
  const prevCountdown = useRef<number | undefined>();
  const victoryPlayed = useRef(false);

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

  useEffect(() => {
    if (needsUnlock || !roomStatus) return;

    if (roomStatus === 'waiting') {
      victoryPlayed.current = false;
      chiptune.play(cityId, 'lobby');
      return;
    }

    if (roomStatus === 'racing') {
      victoryPlayed.current = false;
      chiptune.play(cityId, 'race');
      return;
    }

    if (roomStatus === 'finished') {
      chiptune.stop();
      if (!victoryPlayed.current) {
        victoryPlayed.current = true;
        chiptune.play(cityId, 'victory');
      }
      return;
    }

    if (roomStatus === 'countdown') {
      chiptune.stop();
    }
  }, [roomStatus, cityId, needsUnlock]);

  useEffect(() => {
    if (needsUnlock || roomStatus !== 'countdown') return;
    if (countdown === undefined) return;
    if (prevCountdown.current === countdown) return;
    prevCountdown.current = countdown;
    chiptune.playBeep(countdown === 0, cityId);
  }, [countdown, roomStatus, cityId, needsUnlock]);

  return { needsUnlock, unlock };
}
