import { useEffect, useRef, useState, useCallback } from 'react';
import { audioSettings, chiptune, type CitySceneId } from '@decibel-racing/shared';

type RoomStatus = 'waiting' | 'countdown' | 'racing' | 'finished';

export function useGameAudio(
  roomStatus: RoomStatus | undefined,
  cityId: CitySceneId,
  countdown?: number,
) {
  const [needsUnlock, setNeedsUnlock] = useState(true);
  const [audioTick, setAudioTick] = useState(0);
  const prevCountdown = useRef<number | undefined>();

  const unlock = useCallback(async () => {
    const ok = await chiptune.unlock();
    if (ok) setNeedsUnlock(false);
  }, []);

  useEffect(() => audioSettings.subscribe(() => setAudioTick((n) => n + 1)), []);

  useEffect(() => {
    audioSettings.setBigScreenActive(true);
    return () => {
      audioSettings.setBigScreenActive(false);
    };
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

    if (!audioSettings.shouldPlayLobbyMusic(roomStatus)) {
      chiptune.stop();
      return;
    }

    if (roomStatus === 'waiting') {
      chiptune.play(cityId, 'lobby');
    }
  }, [roomStatus, cityId, needsUnlock, audioTick]);

  useEffect(() => {
    if (needsUnlock || roomStatus !== 'countdown') return;
    if (!audioSettings.shouldPlaySfx()) return;
    if (countdown === undefined) return;
    if (prevCountdown.current === countdown) return;
    prevCountdown.current = countdown;
    chiptune.playCountdownTick(countdown, cityId);
  }, [countdown, roomStatus, cityId, needsUnlock, audioTick]);

  return { needsUnlock, unlock };
}
