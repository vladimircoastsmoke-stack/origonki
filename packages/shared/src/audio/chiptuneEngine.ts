import type { CitySceneId } from '../types.js';
import { getCityTrack, type TrackDef, type TrackPhase } from './tracks.js';

export type { TrackPhase };

interface ScheduleOpts {
  cityId?: CitySceneId;
}

class ChiptuneEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private session: GainNode | null = null;
  private activeKey: string | null = null;
  private scheduleTimer: ReturnType<typeof setTimeout> | null = null;
  private generation = 0;
  private unlocked = false;

  get isUnlocked() {
    return this.unlocked;
  }

  async unlock(): Promise<boolean> {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.38;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.unlocked = this.ctx.state === 'running';
      return this.unlocked;
    } catch {
      return false;
    }
  }

  stop() {
    this.generation += 1;
    if (this.scheduleTimer) {
      clearTimeout(this.scheduleTimer);
      this.scheduleTimer = null;
    }
    this.activeKey = null;
    if (this.session) {
      try {
        this.session.disconnect();
      } catch {
        /* already disconnected */
      }
      this.session = null;
    }
  }

  private beginSession() {
    if (!this.ctx || !this.master) return;
    if (this.session) {
      try {
        this.session.disconnect();
      } catch {
        /* already disconnected */
      }
    }
    this.session = this.ctx.createGain();
    this.session.gain.value = 1;
    this.session.connect(this.master);
  }

  play(cityId: CitySceneId, phase: TrackPhase) {
    const def = getCityTrack(cityId, phase);
    this.playDef(`${cityId}:${phase}`, def, { cityId });
  }

  playCustom(key: string, def: TrackDef, opts?: ScheduleOpts) {
    this.playDef(key, def, opts);
  }

  private playDef(key: string, def: TrackDef, opts?: ScheduleOpts) {
    if (!this.ctx || !this.master || !this.unlocked) return;
    if (this.activeKey === key) return;

    this.stop();
    this.activeKey = key;
    this.beginSession();
    const gen = this.generation;
    this.scheduleDef(key, def, this.ctx.currentTime + 0.05, opts, gen);
  }

  playBeep(high = false, cityId?: CitySceneId) {
    if (!this.ctx || !this.master || !this.unlocked) return;
    if (!this.session) this.beginSession();
    const t = this.ctx.currentTime;

    if (cityId === 'dubai') {
      this.playTone(high ? 830.61 : 659.25, t, high ? 0.35 : 0.12, 'square', high ? 0.26 : 0.16);
      if (high) this.playTone(987.77, t + 0.1, 0.45, 'triangle', 0.18);
      return;
    }
    if (cityId === 'murmansk') {
      this.playTone(high ? 880 : 587.33, t, high ? 0.35 : 0.12, 'square', high ? 0.26 : 0.16);
      if (high) this.playTone(1174.66, t + 0.08, 0.4, 'square', 0.2);
      return;
    }
    if (cityId === 'monaco') {
      this.playTone(high ? 1046.5 : 523.25, t, high ? 0.32 : 0.1, 'square', high ? 0.24 : 0.15);
      if (high) this.playTone(1318.5, t + 0.12, 0.5, 'triangle', 0.2);
      return;
    }
    if (cityId === 'tokyo') {
      this.playTone(high ? 880 : 523.25, t, high ? 0.3 : 0.1, 'square', high ? 0.22 : 0.14);
      if (high) this.playTone(1046.5, t + 0.1, 0.45, 'triangle', 0.18);
      return;
    }

    this.playTone(high ? 988 : 660, t, high ? 0.35 : 0.12, 'square', high ? 0.28 : 0.18);
    if (high) {
      this.playTone(1318.5, t + 0.08, 0.4, 'square', 0.22);
      this.playTone(1568, t + 0.2, 0.5, 'triangle', 0.2);
    }
  }

  private scheduleDef(
    key: string,
    def: TrackDef,
    startAt: number,
    opts: ScheduleOpts | undefined,
    gen: number,
  ) {
    let cursor = startAt;

    for (const note of def.melody) {
      if (note.f > 0) {
        this.playTone(note.f, cursor, note.d * 0.92, 'square', 0.16);
        if (opts?.cityId === 'monaco') {
          this.playTone(note.f * 0.5, cursor, note.d * 0.9, 'triangle', 0.05);
        }
      }
      cursor += note.d;
    }

    const trackDuration = cursor - startAt;

    if (def.bass) {
      let bassCursor = startAt;
      let bassIdx = 0;
      while (bassCursor < cursor - 0.01) {
        const bass = def.bass[bassIdx % def.bass.length];
        if (bass.f > 0) {
          this.playTone(bass.f, bassCursor, bass.d * 0.95, 'triangle', 0.12);
        }
        bassCursor += bass.d;
        bassIdx += 1;
      }
    }

    if (def.loop && this.activeKey === key && this.generation === gen) {
      this.scheduleTimer = setTimeout(() => {
        if (this.activeKey === key && this.generation === gen && this.ctx) {
          this.scheduleDef(key, def, this.ctx.currentTime + 0.02, opts, gen);
        }
      }, Math.max(0, (trackDuration - 0.08) * 1000));
    } else {
      this.scheduleTimer = setTimeout(() => {
        if (this.activeKey === key) {
          this.activeKey = null;
        }
      }, trackDuration * 1000);
    }
  }

  private playTone(
    freq: number,
    start: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ) {
    if (!this.ctx || !this.session) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), start + 0.008);
    gain.gain.setValueAtTime(volume * 0.85, start + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(this.session);

    osc.start(start);
    osc.stop(start + duration + 0.04);
  }
}

export const chiptune = new ChiptuneEngine();
