import type { Player, Room, MaxPlayers } from '@decibel-racing/shared';
import {
  GAME_CONFIG,
  getCarIdsForCity,
  generateRoomId,
  calculateProgressTick,
  getRaceResults,
} from '@decibel-racing/shared';

interface PlayerRuntime extends Player {
  smoothedVolume: number;
  clientType?: 'admin' | 'player' | 'bigscreen';
  persistedId?: string;
  isDemoBot?: boolean;
}

export const DEMO_BOT_ID_PREFIX = 'demo-bot:';

interface RoomRuntime extends Omit<Room, 'players'> {
  players: PlayerRuntime[];
  organizerId?: string;
  gameLoopInterval?: ReturnType<typeof setInterval>;
  countdownInterval?: ReturnType<typeof setInterval>;
  adminSocketId?: string;
  raceFinishedPending?: boolean;
}

const rooms = new Map<string, RoomRuntime>();

export function getRoomCount(): number {
  return rooms.size;
}

export function createRoom(maxPlayers: MaxPlayers, city: string, organizerId?: string): Room {
  if (rooms.size >= GAME_CONFIG.MAX_ROOMS) {
    throw new Error('Достигнут лимит одновременных комнат');
  }

  let id = generateRoomId();
  while (rooms.has(id)) {
    id = generateRoomId();
  }

  const room: RoomRuntime = {
    id,
    maxPlayers,
    city,
    availableCars: getCarIdsForCity(city),
    status: 'lobby',
    players: [],
    createdAt: Date.now(),
    organizerId,
  };

  rooms.set(id, room);
  return serializeRoom(room);
}

export function getRoom(roomId: string): RoomRuntime | undefined {
  return rooms.get(roomId);
}

export function assertRoomOrganizer(roomId: string, organizerId: string): RoomRuntime {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  if (room.organizerId && room.organizerId !== organizerId) {
    throw new Error('Нет доступа к этой комнате');
  }
  return room;
}

export function deleteRoom(roomId: string): void {
  const room = rooms.get(roomId);
  if (room) {
    stopGameLoop(room);
    stopCountdown(room);
    rooms.delete(roomId);
  }
}

export function serializeRoom(room: RoomRuntime): Room {
  return {
    id: room.id,
    maxPlayers: room.maxPlayers,
    city: room.city,
    eventLogoUrl: room.eventLogoUrl,
    availableCars: room.availableCars,
    status: room.status,
    countdownValue: room.countdownValue,
    players: room.players.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      carId: p.carId,
      progress: p.progress,
      currentVolume: p.currentVolume,
      finishedAt: p.finishedAt,
      isDemoBot: p.isDemoBot,
    })),
    createdAt: room.createdAt,
  };
}

export function addPlayer(
  roomId: string,
  socketId: string,
  nickname: string,
  persistedId?: string
): { player: Player; persistedId: string } {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  if (room.status !== 'lobby') throw new Error('Гонка уже началась');
  if (room.players.length >= room.maxPlayers) throw new Error('Комната заполнена');

  const existing = room.players.find((p) => p.id === socketId);
  if (existing) {
    return {
      player: existing,
      persistedId: existing.persistedId || persistedId || crypto.randomUUID(),
    };
  }

  const pid = persistedId || crypto.randomUUID();
  const player: PlayerRuntime = {
    id: socketId,
    nickname,
    carId: '',
    progress: 0,
    currentVolume: 0,
    smoothedVolume: 0,
    persistedId: pid,
  };

  room.players.push(player);
  return { player, persistedId: pid };
}

export function addDemoBot(roomId: string): Player {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  if (room.status !== 'lobby') throw new Error('Тест-бот только в лобби');

  const botId = `${DEMO_BOT_ID_PREFIX}${roomId}`;
  const existing = room.players.find((p) => p.id === botId);
  if (existing) return existing;

  if (room.players.length >= room.maxPlayers) {
    throw new Error('Комната заполнена — увеличьте лимит игроков');
  }

  const freeCar =
    room.availableCars.find((carId) => !room.players.some((p) => p.carId === carId)) ??
    room.availableCars[0];
  if (!freeCar) throw new Error('Нет доступных машин');

  const player: PlayerRuntime = {
    id: botId,
    nickname: 'Тест-бот',
    carId: freeCar,
    progress: 0,
    currentVolume: 0,
    smoothedVolume: 0,
    persistedId: `demo-${roomId}`,
    isDemoBot: true,
  };

  room.players.push(player);
  return player;
}

function tickDemoBots(room: RoomRuntime): void {
  if (room.status !== 'racing') return;
  const t = Date.now() / 1000;
  for (const player of room.players) {
    if (!player.isDemoBot) continue;
    const seed = player.id.charCodeAt(player.id.length - 1);
    player.currentVolume = Math.max(
      0,
      Math.min(1, 0.55 + 0.35 * Math.sin(t * 2.2 + seed)),
    );
  }
}

export function rejoinPlayer(
  roomId: string,
  socketId: string,
  persistedId: string
): Player | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  const player = room.players.find((p) => p.persistedId === persistedId);
  if (!player) return null;

  const oldId = player.id;
  player.id = socketId;

  if (room.status === 'racing' || room.status === 'countdown') {
    return player;
  }

  return player;
}

export function selectCar(roomId: string, socketId: string, carId: string): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  if (room.status !== 'lobby') throw new Error('Нельзя менять машину во время гонки');
  if (!room.availableCars.includes(carId)) throw new Error('Машина недоступна');

  const taken = room.players.some((p) => p.carId === carId && p.id !== socketId);
  if (taken) throw new Error('Машина уже занята');

  const player = room.players.find((p) => p.id === socketId);
  if (!player) throw new Error('Игрок не найден');
  player.carId = carId;
}

export function updateVolume(roomId: string, socketId: string, value: number): void {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'racing') return;

  const player = room.players.find((p) => p.id === socketId);
  if (!player) return;

  player.currentVolume = Math.max(0, Math.min(1, value));
}

export function setRoomLogo(roomId: string, logoUrl: string): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  room.eventLogoUrl = logoUrl;
}

export function setRoomCity(roomId: string, city: string): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  if (room.status !== 'lobby') throw new Error('Нельзя менять город во время гонки');
  room.city = city;
  room.availableCars = getCarIdsForCity(city);
  room.players.forEach((p) => {
    p.carId = '';
  });
}

export function setRoomMaxPlayers(roomId: string, maxPlayers: MaxPlayers): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  if (room.status !== 'lobby') throw new Error('Нельзя менять лимит во время гonки');
  if (room.players.length > maxPlayers) {
    throw new Error(`Уже подключено ${room.players.length} — нельзя меньше ${room.players.length}`);
  }
  room.maxPlayers = maxPlayers;
}

export function setRoomCars(roomId: string, carIds: string[]): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  if (room.status !== 'lobby') throw new Error('Нельзя менять машины во время гонки');
  room.availableCars = carIds;
}

export function startCountdown(roomId: string): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');
  const minPlayers = process.env.ALLOW_SOLO === '1' ? 1 : 2;
  if (room.players.length < minPlayers) {
    throw new Error(`Нужно минимум ${minPlayers} игрок${minPlayers === 1 ? '' : 'а'}`);
  }
  if (room.players.some((p) => !p.carId)) throw new Error('Не все игроки выбрали машину');

  room.status = 'countdown';
  room.countdownValue = GAME_CONFIG.COUNTDOWN_SECONDS;

  stopCountdown(room);
  room.countdownInterval = setInterval(() => {
    if (room.countdownValue === undefined) return;
    room.countdownValue -= 1;
    if (room.countdownValue <= 0) {
      stopCountdown(room);
      startRace(room);
    }
  }, 1000);
}

function stopCountdown(room: RoomRuntime): void {
  if (room.countdownInterval) {
    clearInterval(room.countdownInterval);
    room.countdownInterval = undefined;
  }
}

function startRace(room: RoomRuntime): void {
  room.status = 'racing';
  room.countdownValue = undefined;
  room.players.forEach((p) => {
    p.progress = 0;
    p.currentVolume = 0;
    p.smoothedVolume = 0;
    p.finishedAt = undefined;
  });

  stopGameLoop(room);
  room.gameLoopInterval = setInterval(() => {
    tickRoom(room);
  }, GAME_CONFIG.TICK_RATE_MS);
}

function stopGameLoop(room: RoomRuntime): void {
  if (room.gameLoopInterval) {
    clearInterval(room.gameLoopInterval);
    room.gameLoopInterval = undefined;
  }
}

function tickRoom(room: RoomRuntime): void {
  if (room.status !== 'racing') return;

  tickDemoBots(room);

  let finishedCount = 0;

  for (const player of room.players) {
    const result = calculateProgressTick(
      { progress: player.progress, smoothedVolume: player.smoothedVolume },
      player.currentVolume
    );
    player.progress = result.progress;
    player.smoothedVolume = result.smoothedVolume;

    if (player.progress >= GAME_CONFIG.MAX_PROGRESS && !player.finishedAt) {
      player.finishedAt = Date.now();
      player.progress = GAME_CONFIG.MAX_PROGRESS;
    }
    if (player.finishedAt) finishedCount++;
  }

  if (finishedCount > 0 && (finishedCount === room.players.length || finishedCount === 1)) {
    finishRace(room);
  }
}

function finishRace(room: RoomRuntime): void {
  stopGameLoop(room);
  room.status = 'finished';
  room.raceFinishedPending = true;
}

export function getActiveRooms(): RoomRuntime[] {
  return [...rooms.values()];
}

export function consumeRaceFinished(roomId: string): boolean {
  const room = rooms.get(roomId);
  if (room?.raceFinishedPending) {
    room.raceFinishedPending = false;
    return true;
  }
  return false;
}

export function restartRace(roomId: string): void {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Комната не найдена');

  stopGameLoop(room);
  stopCountdown(room);
  room.status = 'lobby';
  room.countdownValue = undefined;
  room.raceFinishedPending = false;
  room.players.forEach((p) => {
    p.progress = 0;
    p.currentVolume = 0;
    p.smoothedVolume = 0;
    p.finishedAt = undefined;
  });
}

export function newGame(roomId: string): void {
  restartRace(roomId);
  const room = rooms.get(roomId);
  if (room) {
    room.players = [];
  }
}

export function removePlayer(roomId: string, socketId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;
  room.players = room.players.filter((p) => p.id !== socketId);
}

export function findRoomIdByPersistedId(persistedId: string): string | undefined {
  for (const [id, room] of rooms) {
    if (room.players.some((p) => p.persistedId === persistedId)) {
      return id;
    }
  }
  return undefined;
}

export function getRaceResultsForRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return getRaceResults(room.players);
}
