import { io, Socket } from 'socket.io-client';
import { resolveServerUrl } from '@decibel-racing/shared';

const SERVER_URL = resolveServerUrl(import.meta.env.VITE_SERVER_URL);

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      // polling надёжнее через HTTPS-туннели (Pinggy, ngrok)
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
  }
  return socket;
}

export function isSocketConnected(): boolean {
  return getSocket().connected;
}
