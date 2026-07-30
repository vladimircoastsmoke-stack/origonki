import { useEffect, useState, useCallback } from 'react';
import { audioSettings } from '@decibel-racing/shared';

export function useAudioMute() {
  const [muted, setMuted] = useState(audioSettings.isUserMuted());

  useEffect(() => audioSettings.subscribe(() => setMuted(audioSettings.isUserMuted())), []);

  const toggle = useCallback(() => {
    audioSettings.toggleUserMuted();
  }, []);

  return { muted, toggle };
}
