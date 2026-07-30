import type { CityOption, CarOption, MaxPlayers, CitySceneId } from './types.js';

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
  // Мурманск — русские автомобили
  { id: 'mur_zhiguli', name: 'Жигули', color: '#d82800', city: 'murmansk' },
  { id: 'mur_volga', name: 'Волга', color: '#007800', city: 'murmansk' },
  { id: 'mur_uaz', name: 'УАЗик', color: '#fc9838', city: 'murmansk' },
  { id: 'mur_lada', name: 'Lada', color: '#0058f8', city: 'murmansk' },
  { id: 'mur_niva', name: 'Нива', color: '#787878', city: 'murmansk' },
  { id: 'mur_gazel', name: 'Газель', color: '#fcfcfc', city: 'murmansk' },
  { id: 'mur_moskvich', name: 'Москвич', color: '#00a800', city: 'murmansk' },
  { id: 'mur_pobeda', name: 'Победа', color: '#585858', city: 'murmansk' },
  { id: 'mur_oka', name: 'Ока', color: '#fc9838', city: 'murmansk' },
  { id: 'mur_kalina', name: 'Калина', color: '#d82800', city: 'murmansk' },

  // Дубай — внедорожники и джипы
  { id: 'dub_cruiser', name: 'Desert Cruiser', color: '#fcfcfc', city: 'dubai' },
  { id: 'dub_gwagon', name: 'Sand G-Wagon', color: '#585858', city: 'dubai' },
  { id: 'dub_dune', name: 'Dune Rover', color: '#fc9838', city: 'dubai' },
  { id: 'dub_pearl', name: 'Pearl SUV', color: '#e8eef2', city: 'dubai' },
  { id: 'dub_golden', name: 'Golden Jeep', color: '#ffd700', city: 'dubai' },
  { id: 'dub_oasis', name: 'Oasis Pickup', color: '#d82800', city: 'dubai' },
  { id: 'dub_mirage', name: 'Mirage Lux', color: '#0058a8', city: 'dubai' },
  { id: 'dub_falcon', name: 'Falcon 4×4', color: '#007800', city: 'dubai' },
  { id: 'dub_sunset', name: 'Sunset Hummer', color: '#ff4400', city: 'dubai' },
  { id: 'dub_royal', name: 'Royal Escalade', color: '#0c0c44', city: 'dubai' },

  // Токио — японские
  { id: 'tok_kei', name: 'Kei Drift', color: '#ff006e', city: 'tokyo' },
  { id: 'tok_drift', name: 'Neon Drift', color: '#fcfcfc', city: 'tokyo' },
  { id: 'tok_civic', name: 'Tokyo Civic', color: '#0058f8', city: 'tokyo' },
  { id: 'tok_samurai', name: 'Samurai GT', color: '#d82800', city: 'tokyo' },
  { id: 'tok_cherry', name: 'Cherry Kei', color: '#ff006e', city: 'tokyo' },
  { id: 'tok_midnight', name: 'Midnight RX', color: '#585858', city: 'tokyo' },
  { id: 'tok_sakura', name: 'Sakura Hatch', color: '#ff69b4', city: 'tokyo' },
  { id: 'tok_ae86', name: 'Turbo AE86', color: '#fcfcfc', city: 'tokyo' },
  { id: 'tok_supra', name: 'Rain Supra', color: '#ffd700', city: 'tokyo' },
  { id: 'tok_neon', name: 'Neon S2000', color: '#00d4ff', city: 'tokyo' },

  // Монако — европейские
  { id: 'mon_azure', name: 'Azure GT', color: '#0058a8', city: 'monaco' },
  { id: 'mon_riviera', name: 'Riviera Coupe', color: '#ffd700', city: 'monaco' },
  { id: 'mon_monte', name: 'Monte Carlo', color: '#d82800', city: 'monaco' },
  { id: 'mon_citro', name: 'French Blue', color: '#0058f8', city: 'monaco' },
  { id: 'mon_peugeot', name: 'Yellow Berlin', color: '#ffd700', city: 'monaco' },
  { id: 'mon_formula', name: 'Red Formula', color: '#d82800', city: 'monaco' },
  { id: 'mon_convert', name: 'Chic Convert', color: '#fc9838', city: 'monaco' },
  { id: 'mon_rally', name: 'Harbor Rally', color: '#007800', city: 'monaco' },
  { id: 'mon_gold', name: 'Gold Super', color: '#ffd700', city: 'monaco' },
  { id: 'mon_palace', name: 'Palace GT', color: '#585858', city: 'monaco' },
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

export function getCarsByCity(cityId: CitySceneId | string): CarOption[] {
  return CARS.filter((c) => c.city === cityId);
}

export function getCarIdsForCity(cityId: CitySceneId | string): string[] {
  return getCarsByCity(cityId).map((c) => c.id);
}

export function getCarById(id: string): CarOption | undefined {
  return CARS.find((c) => c.id === id);
}

export const DEFAULT_AVAILABLE_CARS = getCarIdsForCity('dubai');

export const BRAND = {
  name: 'ОриГонки',
  tagline: 'Кричи — и побеждай!',
  emoji: '🏁',
} as const;

/** Описание игры для экранов входа (8-bit стиль) */
export const GAME_INTRO = {
  title: 'ЧТО ЭТО?',
  headline: 'Голосовые гонки для мероприятий',
  essence: 'Кричи в телефон — машина едет быстрее. Кто громче, тот побеждает!',
  steps: [
    'Ведущий создаёт комнату и открывает большой экран',
    'Игроки сканируют QR-код на телефоне',
    'Разрешите микрофон и кричите — машина ускоряется',
    'На экране видно, кто лидирует — побеждает самый громкий',
  ],
  playerLine: 'Кричи в микрофон — твоя машина летит вперёд!',
} as const;

export function getCityById(id: string): CityOption {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}
