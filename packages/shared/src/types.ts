export type RoomStatus = 'lobby' | 'countdown' | 'racing' | 'finished';

export interface Player {
  id: string;
  nickname: string;
  carId: string;
  progress: number;
  currentVolume: number;
  finishedAt?: number;
}

export interface Room {
  id: string;
  maxPlayers: 2 | 4;
  city: string;
  eventLogoUrl?: string;
  availableCars: string[];
  status: RoomStatus;
  players: Player[];
  countdownValue?: number;
  createdAt: number;
}

export interface CityOption {
  id: string;
  name: string;
  description: string;
  gradient: [string, string];
  accent: string;
}

export interface CarOption {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export interface RaceResult {
  place: number;
  player: Player;
}
