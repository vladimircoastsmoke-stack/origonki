import type { CityOption, CarOption, MaxPlayers } from './types.js';

export const MAX_PLAYER_OPTIONS: MaxPlayers[] = [2, 4, 6, 8, 10];

/** NES / Dendy палитры трасс */
export const CITIES: CityOption[] = [
  {
    id: 'dubai',
    name: 'Ночной Дубай',
    description: '8-bit пустыня, пиксельные небоскрёбы и звёздное небо',
    gradient: ['#0c0c44', '#5c94fc'],
    accent: '#fc9838',
    theme: 'dendy',
    scene: 'dubai',
    palette: {
      skyTop: '#0c0c44',
      skyBottom: '#5c94fc',
      ground: '#fc9838',
      road: '#d82800',
      building: '#0c0c44',
      buildingAlt: '#1c1c6e',
      window: '#fc9838',
      windowLit: '#fcfcfc',
      accent: '#fc9838',
    },
  },
  {
    id: 'murmansk',
    name: 'Зимний Мурманск',
    description: 'Серые хрущёвки, снег и северное сияние',
    gradient: ['#586878', '#98a8b8'],
    accent: '#a8e8fc',
    theme: 'dendy',
    scene: 'murmansk',
    palette: {
      skyTop: '#586878',
      skyBottom: '#788898',
      ground: '#e8eef2',
      road: '#687888',
      building: '#787878',
      buildingAlt: '#686868',
      window: '#404040',
      windowLit: '#fc9838',
      accent: '#a8e8fc',
      snow: '#fcfcfc',
    },
  },
  {
    id: 'monaco',
    name: 'Трасса Монако',
    description: '8-bit Лазурный берег, яхты и горные скалы',
    gradient: ['#0058a8', '#00a8d8'],
    accent: '#ffd700',
    theme: 'dendy',
    scene: 'monaco',
    palette: {
      skyTop: '#0058a8',
      skyBottom: '#5c94fc',
      ground: '#fc9838',
      road: '#787878',
      building: '#fc9838',
      buildingAlt: '#d82800',
      window: '#0058f8',
      windowLit: '#fcfcfc',
      accent: '#ffd700',
      water: '#0088d8',
    },
  },
  {
    id: 'tokyo',
    name: 'Токио Дрифт',
    description: 'Неоновые вывески, дождь и ночные улицы',
    gradient: ['#1a0830', '#580858'],
    accent: '#ff006e',
    theme: 'dendy',
    scene: 'tokyo',
    palette: {
      skyTop: '#1a0830',
      skyBottom: '#380838',
      ground: '#282828',
      road: '#404040',
      building: '#180818',
      buildingAlt: '#280828',
      window: '#ff006e',
      windowLit: '#00d4ff',
      accent: '#ff006e',
    },
  },
];

export const CARS: CarOption[] = [
  { id: 'zhiguli', name: 'Жигули', color: '#d82800', emoji: '🚗' },
  { id: 'volga', name: 'Волга', color: '#007800', emoji: '🚙' },
  { id: 'uaz', name: 'УАЗик', color: '#fc9838', emoji: '🛻' },
  { id: 'rocket', name: 'Ракета', color: '#0058f8', emoji: '🚀' },
  { id: 'blaze', name: 'Огонь', color: '#ff4400', emoji: '🔥' },
  { id: 'nova', name: 'Звезда', color: '#00a800', emoji: '⭐' },
  { id: 'shadow', name: 'Тень', color: '#585858', emoji: '🦅' },
  { id: 'turbo', name: 'Турбо', color: '#b800b8', emoji: '💨' },
  { id: 'pixel', name: 'Пиксель', color: '#fc9838', emoji: '🕹️' },
  { id: 'dendy', name: 'Денди', color: '#d82800', emoji: '🎮' },
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
  MAX_PLAYERS: 10,
  MAX_VOLUME: 1,
  LOGO_MAX_SIZE_MB: 2,
  ALLOWED_LOGO_TYPES: ['image/png', 'image/jpeg', 'image/svg+xml'],
  MIN_PLAYERS_TO_START: 1,
} as const;

export const DEFAULT_AVAILABLE_CARS = CARS.map((c) => c.id);

export const BRAND = {
  name: 'ОриГонки',
  tagline: 'Кричи — и побеждай!',
  emoji: '🏁',
} as const;

export function getCityById(id: string): CityOption {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}
