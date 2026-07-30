import { useEffect, useState, useCallback } from 'react';
import {
  ADMIN_MENU_TRACK,
  asCitySceneId,
  audioSettings,
  chiptune,
  type RoomStatus,
} from '@decibel-racing/shared';

type AdminStep = 'create' | 'lobby';

export function useAdminAudio(
  step: AdminStep,
  selectedCity: string,
  roomCity: string | undefined,
  roomStatus: RoomStatus | undefined,
  locationTouched: boolean,
) {
  const [needsUnlock, setNeedsUnlock] = useState(true);
  const [audioTick, setAudioTick] = useState(0);
  const cityId = asCitySceneId(step === 'lobby' && roomCity ? roomCity : selectedCity);

  const unlock = useCallback(async () => {
    const ok = await chiptune.unlock();
    if (ok) setNeedsUnlock(false);
  }, []);

  useEffect(() => audioSettings.subscribe(() => setAudioTick((n) => n + 1)), []);

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
    if (needsUnlock) return;

    if (!audioSettings.shouldPlayMusic()) {
      chiptune.stop();
      return;
    }

    if (step === 'lobby' && roomStatus === 'lobby') {
      chiptune.play(cityId, 'lobby');
      return;
    }

    if (step === 'create') {
      if (locationTouched) {
        chiptune.stop();
      } else {
        chiptune.playCustom('admin:menu', ADMIN_MENU_TRACK);
      }
      return;
    }

    chiptune.stop();
  }, [step, cityId, roomStatus, locationTouched, needsUnlock, audioTick]);

  return { needsUnlock, unlock };
}
