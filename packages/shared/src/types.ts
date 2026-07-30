export type RoomStatus = 'lobby' | 'countdown' | 'racing' | 'finished';

export type MaxPlayers = 2 | 4 | 6 | 8 | 10;

export type CityTheme = 'dendy';

export type CitySceneId = 'dubai' | 'murmansk' | 'monaco' | 'tokyo';

export interface CityPalette {
  skyTop: string;
  skyBottom: string;
  ground: string;
  road: string;
  building: string;
  buildingAlt: string;
  window: string;
  windowLit: string;
  accent: string;
  snow?: string;
  water?: string;
}

export interface Player {
  id: string;
  nickname: string;
  carId: string;
  progress: number;
  currentVolume: number;
  finishedAt?: number;
  isDemoBot?: boolean;
}

export interface Room {
  id: string;
  maxPlayers: MaxPlayers;
  city: string;
  eventLogoUrl?: string;
  availableCars: string[];
  status: RoomStatus;
  players: Player[];
  countdownValue?: number;
  createdAt: number;
}

export interface CityOption {
  id: CitySceneId;
  name: string;
  description: string;
  gradient: [string, string];
  accent: string;
  theme: CityTheme;
  scene: CitySceneId;
  palette: CityPalette;
}

export interface CarOption {
  id: string;
  name: string;
  color: string;
  city: CitySceneId;
}

export interface RaceResult {
  place: number;
  player: Player;
}
