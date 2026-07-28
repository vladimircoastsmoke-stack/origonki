import type { CityOption, CarOption } from './types.js';

export const CITIES: CityOption[] = [
  {
    id: 'dubai',
    name: 'Ночной Дубай',
    description: 'Неоновые небоскрёбы и пустынные огни',
    gradient: ['#0a0a2e', '#1a1a4e'],
    accent: '#00d4ff',
  },
  {
    id: 'monaco',
    name: 'Трасса Монако',
    description: 'Прибрежная трасса у Средиземного моря',
    gradient: ['#0d2137', '#1a3a5c'],
    accent: '#ffd700',
  },
  {
    id: 'murmansk',
    name: 'Зимний Мурманск',
    description: 'Северное сияние и снежные просторы',
    gradient: ['#0a1628', '#1a3050'],
    accent: '#7dd3fc',
  },
  {
    id: 'tokyo',
    name: 'Токио Дрифт',
    description: 'Неоновые улицы и ночной трафик',
    gradient: ['#1a0a2e', '#2a1a4e'],
    accent: '#ff006e',
  },
];

export const CARS: CarOption[] = [
  { id: 'speedster', name: 'Speedster X', color: '#ff3366', emoji: '🏎️' },
  { id: 'thunder', name: 'Thunder Bolt', color: '#ffaa00', emoji: '⚡' },
  { id: 'phantom', name: 'Phantom GT', color: '#9966ff', emoji: '👻' },
  { id: 'rocket', name: 'Rocket Racer', color: '#00ccff', emoji: '🚀' },
  { id: 'blaze', name: 'Blaze Fury', color: '#ff4400', emoji: '🔥' },
  { id: 'nova', name: 'Nova Star', color: '#00ff88', emoji: '⭐' },
  { id: 'shadow', name: 'Shadow Hawk', color: '#666699', emoji: '🦅' },
  { id: 'turbo', name: 'Turbo V8', color: '#ff0066', emoji: '💨' },
];

export const GAME_CONFIG = {
  TICK_RATE_MS: 33,
  VOLUME_SEND_INTERVAL_MS: 100,
  COUNTDOWN_SECONDS: 3,
  VOLUME_THRESHOLD: 0.05,
  MAX_PROGRESS: 100,
  BASE_SPEED: 0.08,
  SMOOTHING_ALPHA: 0.15,
  MAX_ROOMS: 10,
  MAX_VOLUME: 1,
  LOGO_MAX_SIZE_MB: 2,
  ALLOWED_LOGO_TYPES: ['image/png', 'image/jpeg', 'image/svg+xml'],
} as const;

export const DEFAULT_AVAILABLE_CARS = CARS.map((c) => c.id);
