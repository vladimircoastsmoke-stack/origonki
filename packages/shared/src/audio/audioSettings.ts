import { chiptune } from './chiptuneEngine.js';
import { resolveBigScreenUrl } from '../client.js';

const STORAGE_KEY = 'origonki:audioMuted';
const CHANNEL_NAME = 'origonki-audio';

type AudioMessage =
  | { type: 'user-mute'; muted: boolean }
  | { type: 'bigscreen-active'; active: boolean };

export function isBigScreenApp(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('/screen');
}

class AudioSettingsManager {
  private userMuted = false;
  private bigScreenActive = false;
  private listeners = new Set<() => void>();
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    this.userMuted = localStorage.getItem(STORAGE_KEY) === '1';
    chiptune.setMuted(this.userMuted);

    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<AudioMessage>) => {
        this.handleMessage(event.data);
      };
    } catch {
      /* BroadcastChannel unavailable */
    }
  }

  private handleMessage(message: AudioMessage): void {
    if (message.type === 'user-mute') {
      this.applyUserMuted(message.muted, false);
    } else if (message.type === 'bigscreen-active') {
      this.applyBigScreenActive(message.active, false);
    }
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private applyUserMuted(muted: boolean, broadcast: boolean): void {
    if (this.userMuted === muted) return;
    this.userMuted = muted;
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    chiptune.setMuted(muted);
    if (muted) chiptune.stop();
    if (broadcast) {
      this.channel?.postMessage({ type: 'user-mute', muted });
    }
  }

  private applyBigScreenActive(active: boolean, broadcast: boolean): void {
    if (this.bigScreenActive === active) return;
    this.bigScreenActive = active;
    if (active && !isBigScreenApp()) {
      chiptune.stop();
    }
    if (broadcast) {
      this.channel?.postMessage({ type: 'bigscreen-active', active });
    }
  }

  isUserMuted(): boolean {
    return this.userMuted;
  }

  isBigScreenActive(): boolean {
    return this.bigScreenActive;
  }

  /** Background music (lobby/menu tracks). */
  shouldPlayMusic(): boolean {
    if (this.userMuted) return false;
    if (this.bigScreenActive && !isBigScreenApp()) return false;
    return true;
  }

  /** Countdown beeps and other SFX. */
  shouldPlaySfx(): boolean {
    if (this.userMuted) return false;
    if (this.bigScreenActive && !isBigScreenApp()) return false;
    return true;
  }

  /** Only lobby/waiting — no music during countdown, race, or finish. */
  shouldPlayLobbyMusic(roomStatus: string | undefined): boolean {
    if (!this.shouldPlayMusic()) return false;
    return roomStatus === 'lobby' || roomStatus === 'waiting' || roomStatus === undefined;
  }

  setUserMuted(muted: boolean): void {
    this.applyUserMuted(muted, true);
    this.notify();
  }

  toggleUserMuted(): void {
    this.setUserMuted(!this.userMuted);
  }

  setBigScreenActive(active: boolean): void {
    this.applyBigScreenActive(active, true);
    this.notify();
  }

  /** Call from admin before opening big screen in a new tab. */
  notifyBigScreenOpening(): void {
    this.setBigScreenActive(true);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const audioSettings = new AudioSettingsManager();

export function openBigScreenRoom(roomId: string): Window | null {
  if (typeof window === 'undefined') return null;
  audioSettings.notifyBigScreenOpening();
  return window.open(resolveBigScreenUrl(roomId), '_blank', 'noopener,noreferrer');
}
