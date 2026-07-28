import { io, Socket } from 'socket.io-client';
import { resolveServerUrl } from '@decibel-racing/shared';

const SERVER_URL = resolveServerUrl(import.meta.env.VITE_SERVER_URL);

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}
