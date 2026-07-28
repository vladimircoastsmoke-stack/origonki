import { useEffect, useRef, useState, useCallback } from 'react';
import { GAME_CONFIG } from '@decibel-racing/shared';

export function useMicrophone() {
  const [volume, setVolume] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const start = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const measure = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const normalizedVolume = Math.min(1, rms * 4);
        setVolume(normalizedVolume);
        rafRef.current = requestAnimationFrame(measure);
      };

      measure();
      setIsActive(true);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('permission_denied');
      } else if (e.name === 'NotFoundError') {
        setError('no_microphone');
      } else {
        setError('unknown');
      }
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    setIsActive(false);
    setVolume(0);
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { volume, isActive, error, start, stop };
}

export function useVolumeSender(
  volume: number,
  isActive: boolean,
  sendFn: (value: number) => void
) {
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSentRef.current >= GAME_CONFIG.VOLUME_SEND_INTERVAL_MS) {
        sendFn(volume);
        lastSentRef.current = now;
      }
    }, GAME_CONFIG.VOLUME_SEND_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [volume, isActive, sendFn]);
}

export function getStorageKey(roomId: string): string {
  return `decibel-racing:${roomId}`;
}

export function savePlayerSession(roomId: string, persistedId: string, nickname: string): void {
  localStorage.setItem(getStorageKey(roomId), JSON.stringify({ persistedId, nickname }));
}

export function loadPlayerSession(roomId: string): { persistedId: string; nickname: string } | null {
  try {
    const raw = localStorage.getItem(getStorageKey(roomId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
