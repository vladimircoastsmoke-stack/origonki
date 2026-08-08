import express, { type Express } from 'express';
import { createServer } from 'http';
import { Server, type Socket } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  SOCKET_EVENTS,
  GAME_CONFIG,
  type MaxPlayers,
} from '@decibel-racing/shared';
import {
  createRoom,
  getRoom,
  serializeRoom,
  assertRoomOrganizer,
  addPlayer,
  rejoinPlayer,
  selectCar,
  updateVolume,
  findRoomIdByPersistedId,
  setRoomLogo,
  setRoomCity,
  setRoomCars,
  setRoomMaxPlayers,
  startCountdown,
  restartRace,
  newGame,
  deleteRoom,
  removePlayer,
  getRaceResultsForRoom,
  getActiveRooms,
  consumeRaceFinished,
  addDemoBot,
} from './rooms.js';
import { setupStaticFrontend } from './static.js';
import { createAuthRouter } from './auth/routes.js';
import {
  getOrganizerFromCookieHeader,
  isOrganizerAuthRequired,
} from './auth/sessions.js';
import type { OrganizerRow } from './auth/organizers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');
const isProduction = process.env.NODE_ENV === 'production';

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app: Express = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);

const allowedOrigins = isProduction
  ? true
  : process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', createAuthRouter());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: GAME_CONFIG.LOGO_MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if ((GAME_CONFIG.ALLOWED_LOGO_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый формат файла'));
    }
  },
});

app.post('/api/upload-logo/:roomId', upload.single('logo'), (req, res) => {
  const roomId = String(req.params.roomId);
  if (isOrganizerAuthRequired()) {
    const organizer = getOrganizerFromCookieHeader(req.headers.cookie);
    if (!organizer) {
      return res.status(401).json({ error: 'Требуется вход' });
    }
    try {
      assertRoomOrganizer(roomId, organizer.id);
    } catch (err) {
      return res.status(403).json({ error: (err as Error).message });
    }
  }
  const room = getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Комната не найдена' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  const logoUrl = `/uploads/${req.file.filename}`;
  setRoomLogo(roomId, logoUrl);
  broadcastRoomUpdate(roomId);
  res.json({ logoUrl });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

const socketRooms = new Map<string, string>();

function resolveOrganizer(socket: Socket): OrganizerRow | null {
  return getOrganizerFromCookieHeader(socket.handshake.headers.cookie);
}

function requireOrganizer(socket: Socket): OrganizerRow | null {
  if (!isOrganizerAuthRequired()) return null;
  const organizer = resolveOrganizer(socket);
  if (!organizer) {
    socket.emit(SOCKET_EVENTS.SERVER_ERROR, {
      message: 'Войдите по вашей ссылке организатора',
    });
  }
  return organizer;
}

function guardRoom(socket: Socket, roomId: string): boolean {
  if (!isOrganizerAuthRequired()) return true;
  const organizer = resolveOrganizer(socket);
  if (!organizer) return false;
  try {
    assertRoomOrganizer(roomId, organizer.id);
    return true;
  } catch (err) {
    socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message: (err as Error).message });
    return false;
  }
}

function broadcastRoomUpdate(roomId: string): void {
  const room = getRoom(roomId);
  if (!room) return;
  io.to(roomId).emit(SOCKET_EVENTS.SERVER_ROOM_UPDATE, serializeRoom(room));
}

function emitCountdownTick(roomId: string): void {
  const room = getRoom(roomId);
  if (!room || room.countdownValue === undefined) return;
  io.to(roomId).emit(SOCKET_EVENTS.SERVER_COUNTDOWN_TICK, {
    value: room.countdownValue,
  });
}

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.ADMIN_CREATE_ROOM, (data: { maxPlayers: MaxPlayers; city: string }, cb) => {
    try {
      const organizer = requireOrganizer(socket);
      if (isOrganizerAuthRequired() && !organizer) {
        cb?.({ error: 'Требуется вход организатора' });
        return;
      }
      const room = createRoom(data.maxPlayers, data.city, organizer?.id);
      socket.join(room.id);
      socketRooms.set(socket.id, room.id);
      const runtime = getRoom(room.id);
      if (runtime) runtime.adminSocketId = socket.id;
      cb({ roomId: room.id, room });
    } catch (err) {
      cb({ error: (err as Error).message });
    }
  });

  socket.on(SOCKET_EVENTS.ADMIN_JOIN_ROOM, (data: { roomId: string }, cb) => {
    const room = getRoom(data.roomId);
    if (!room) return cb({ error: 'Комната не найдена' });
    if (!guardRoom(socket, data.roomId)) {
      return cb({ error: 'Нет доступа к комнате' });
    }
    socket.join(data.roomId);
    socketRooms.set(socket.id, data.roomId);
    room.adminSocketId = socket.id;
    cb({ room: serializeRoom(room) });
  });

  socket.on(SOCKET_EVENTS.BIGSCREEN_JOIN, (data: { roomId: string }, cb) => {
    const room = getRoom(data.roomId);
    if (!room) return cb({ error: 'Комната не найдена' });
    socket.join(data.roomId);
    socketRooms.set(socket.id, data.roomId);
    cb({ room: serializeRoom(room) });
  });

  socket.on(SOCKET_EVENTS.ADMIN_SELECT_CITY, (data: { roomId: string; city: string }) => {
    if (!guardRoom(socket, data.roomId)) return;
    try {
      setRoomCity(data.roomId, data.city);
      broadcastRoomUpdate(data.roomId);
    } catch (err) {
      socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message: (err as Error).message });
    }
  });

  socket.on(SOCKET_EVENTS.ADMIN_SET_CARS, (data: { roomId: string; carIds: string[] }) => {
    if (!guardRoom(socket, data.roomId)) return;
    try {
      setRoomCars(data.roomId, data.carIds);
      broadcastRoomUpdate(data.roomId);
    } catch (err) {
      socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message: (err as Error).message });
    }
  });

  socket.on(
    SOCKET_EVENTS.ADMIN_SET_MAX_PLAYERS,
    (data: { roomId: string; maxPlayers: MaxPlayers }, cb) => {
      if (!guardRoom(socket, data.roomId)) {
        cb?.({ error: 'Нет доступа' });
        return;
      }
      try {
        setRoomMaxPlayers(data.roomId, data.maxPlayers);
        broadcastRoomUpdate(data.roomId);
        cb?.({ ok: true });
      } catch (err) {
        const message = (err as Error).message;
        socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message });
        cb?.({ error: message });
      }
    },
  );

  socket.on(SOCKET_EVENTS.ADMIN_CLOSE_ROOM, (data: { roomId: string }, cb) => {
    if (!guardRoom(socket, data.roomId)) {
      cb?.({ error: 'Нет доступа' });
      return;
    }
    deleteRoom(data.roomId);
    socket.leave(data.roomId);
    socketRooms.delete(socket.id);
    cb?.({ ok: true });
  });

  socket.on(SOCKET_EVENTS.ADMIN_START_COUNTDOWN, (data: { roomId: string }) => {
    if (!guardRoom(socket, data.roomId)) return;
    try {
      startCountdown(data.roomId);
      broadcastRoomUpdate(data.roomId);
      const room = getRoom(data.roomId);
      if (room) {
        emitCountdownTick(data.roomId);
        const tickWatcher = setInterval(() => {
          const r = getRoom(data.roomId);
          if (!r || r.status !== 'countdown') {
            clearInterval(tickWatcher);
            if (r?.status === 'racing') {
              broadcastRoomUpdate(data.roomId);
            }
            return;
          }
          emitCountdownTick(data.roomId);
          broadcastRoomUpdate(data.roomId);
        }, 1000);
      }
    } catch (err) {
      socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message: (err as Error).message });
    }
  });

  socket.on(SOCKET_EVENTS.ADMIN_RESTART_RACE, (data: { roomId: string }, cb) => {
    if (!guardRoom(socket, data.roomId)) {
      cb?.({ error: 'Нет доступа' });
      return;
    }
    try {
      restartRace(data.roomId);
      broadcastRoomUpdate(data.roomId);
      const room = getRoom(data.roomId);
      cb?.({ room: room ? serializeRoom(room) : undefined });
    } catch (err) {
      const message = (err as Error).message;
      socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message });
      cb?.({ error: message });
    }
  });

  socket.on(SOCKET_EVENTS.ADMIN_NEW_GAME, (data: { roomId: string }, cb) => {
    if (!guardRoom(socket, data.roomId)) {
      cb?.({ error: 'Нет доступа' });
      return;
    }
    try {
      newGame(data.roomId);
      broadcastRoomUpdate(data.roomId);
      const room = getRoom(data.roomId);
      cb?.({ room: room ? serializeRoom(room) : undefined });
    } catch (err) {
      const message = (err as Error).message;
      socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message });
      cb?.({ error: message });
    }
  });

  socket.on(SOCKET_EVENTS.ADMIN_ADD_DEMO_BOT, (data: { roomId: string }, cb) => {
    if (!guardRoom(socket, data.roomId)) {
      cb?.({ error: 'Нет доступа' });
      return;
    }
    try {
      addDemoBot(data.roomId);
      broadcastRoomUpdate(data.roomId);
      const room = getRoom(data.roomId);
      cb?.({ room: room ? serializeRoom(room) : undefined });
    } catch (err) {
      const message = (err as Error).message;
      socket.emit(SOCKET_EVENTS.SERVER_ERROR, { message });
      cb?.({ error: message });
    }
  });

  socket.on(
    SOCKET_EVENTS.PLAYER_JOIN,
    (data: { roomId: string; nickname: string; persistedId?: string }, cb) => {
      try {
        const room = getRoom(data.roomId);
        if (!room) return cb({ error: 'Комната не найдена' });

        socket.join(data.roomId);
        socketRooms.set(socket.id, data.roomId);

        const { player, persistedId } = addPlayer(data.roomId, socket.id, data.nickname, data.persistedId);

        broadcastRoomUpdate(data.roomId);
        cb({ player, room: serializeRoom(room), persistedId });
      } catch (err) {
        cb({ error: (err as Error).message });
      }
    }
  );

  socket.on(
    SOCKET_EVENTS.PLAYER_REJOIN,
    (data: { roomId: string; persistedId: string }, cb) => {
      const room = getRoom(data.roomId);
      if (!room) return cb({ error: 'Комната не найдена' });

      const player = rejoinPlayer(data.roomId, socket.id, data.persistedId);
      if (!player) return cb({ error: 'Игрок не найден' });

      socket.join(data.roomId);
      socketRooms.set(socket.id, data.roomId);
      cb({ player, room: serializeRoom(room) });
    }
  );

  socket.on(SOCKET_EVENTS.PLAYER_SELECT_CAR, (data: { carId: string }, cb) => {
    const roomId = socketRooms.get(socket.id);
    if (!roomId) return cb?.({ error: 'Не в комнате' });
    try {
      selectCar(roomId, socket.id, data.carId);
      broadcastRoomUpdate(roomId);
      cb?.({ ok: true });
    } catch (err) {
      cb?.({ error: (err as Error).message });
    }
  });

  socket.on(SOCKET_EVENTS.PLAYER_VOLUME, (data: { value: number; persistedId?: string }) => {
    let roomId = socketRooms.get(socket.id);
    if (!roomId && data.persistedId) {
      roomId = findRoomIdByPersistedId(data.persistedId);
      if (roomId) {
        rejoinPlayer(roomId, socket.id, data.persistedId);
        socket.join(roomId);
        socketRooms.set(socket.id, roomId);
      }
    }
    if (!roomId) return;
    updateVolume(roomId, socket.id, data.value);
  });

  socket.on('disconnect', () => {
    const roomId = socketRooms.get(socket.id);
    if (roomId) {
      const room = getRoom(roomId);
      if (room && room.status === 'lobby') {
        removePlayer(roomId, socket.id);
        broadcastRoomUpdate(roomId);
      }
    }
    socketRooms.delete(socket.id);
  });
});

setInterval(() => {
  for (const room of getActiveRooms()) {
    if (room.status === 'racing') {
      broadcastRoomUpdate(room.id);
    }
    if (consumeRaceFinished(room.id)) {
      broadcastRoomUpdate(room.id);
      const results = getRaceResultsForRoom(room.id);
      io.to(room.id).emit(SOCKET_EVENTS.SERVER_RACE_FINISHED, { results });
    }
  }
}, GAME_CONFIG.TICK_RATE_MS);

if (isProduction) {
  const served = setupStaticFrontend(app, __dirname);
  if (served) {
    console.log('📦 Serving production frontend from /admin, /screen, /join');
  }
}

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log(`🏁  ОриГонки server running on port ${PORT}`);
});

export { io, app, httpServer };
