import { GAME_CONFIG } from './constants.js';

export interface ProgressState {
  progress: number;
  smoothedVolume: number;
}

export function smoothVolume(currentSmoothed: number, newVolume: number): number {
  const alpha = GAME_CONFIG.SMOOTHING_ALPHA;
  return currentSmoothed + alpha * (newVolume - currentSmoothed);
}

export function effectiveSpeed(volume: number): number {
  if (volume < GAME_CONFIG.VOLUME_THRESHOLD) {
    return 0;
  }
  const normalized = (volume - GAME_CONFIG.VOLUME_THRESHOLD) / (1 - GAME_CONFIG.VOLUME_THRESHOLD);
  return normalized * GAME_CONFIG.BASE_SPEED;
}

export function calculateProgressTick(
  state: ProgressState,
  rawVolume: number
): ProgressState {
  const smoothedVolume = smoothVolume(state.smoothedVolume, rawVolume);
  const speed = effectiveSpeed(smoothedVolume);
  const newProgress = Math.min(
    GAME_CONFIG.MAX_PROGRESS,
    state.progress + speed
  );
  return {
    progress: newProgress,
    smoothedVolume,
  };
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function getRaceResults<T extends { progress: number; finishedAt?: number }>(
  players: T[]
): (T & { place: number })[] {
  const sorted = [...players].sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress;
    if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
    return 0;
  });
  return sorted.map((p, i) => ({ ...p, place: i + 1 }));
}
