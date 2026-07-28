import { describe, it, expect } from 'vitest';
import {
  smoothVolume,
  effectiveSpeed,
  calculateProgressTick,
  getRaceResults,
} from './game.js';
import { GAME_CONFIG } from './constants.js';

describe('smoothVolume', () => {
  it('returns new volume on first sample', () => {
    const result = smoothVolume(0, 0.8);
    expect(result).toBeCloseTo(0.8 * GAME_CONFIG.SMOOTHING_ALPHA);
  });

  it('smooths sudden spikes', () => {
    let smoothed = 0;
    for (let i = 0; i < 10; i++) {
      smoothed = smoothVolume(smoothed, 1);
    }
    expect(smoothed).toBeLessThan(1);
    expect(smoothed).toBeGreaterThan(0.5);
  });

  it('gradually decays when volume drops', () => {
    let smoothed = 0.8;
    for (let i = 0; i < 5; i++) {
      smoothed = smoothVolume(smoothed, 0);
    }
    expect(smoothed).toBeLessThan(0.8);
    expect(smoothed).toBeGreaterThan(0);
  });
});

describe('effectiveSpeed', () => {
  it('returns zero below threshold', () => {
    expect(effectiveSpeed(0)).toBe(0);
    expect(effectiveSpeed(GAME_CONFIG.VOLUME_THRESHOLD - 0.01)).toBe(0);
  });

  it('returns zero at threshold boundary', () => {
    expect(effectiveSpeed(GAME_CONFIG.VOLUME_THRESHOLD)).toBe(0);
  });

  it('returns positive speed above threshold', () => {
    const speed = effectiveSpeed(0.5);
    expect(speed).toBeGreaterThan(0);
    expect(speed).toBeLessThan(GAME_CONFIG.BASE_SPEED);
  });

  it('returns max speed at volume 1', () => {
    expect(effectiveSpeed(1)).toBeCloseTo(GAME_CONFIG.BASE_SPEED);
  });
});

describe('calculateProgressTick', () => {
  it('does not increase progress when silent', () => {
    const state = { progress: 10, smoothedVolume: 0 };
    const result = calculateProgressTick(state, 0);
    expect(result.progress).toBe(10);
  });

  it('increases progress when loud enough', () => {
    const state = { progress: 0, smoothedVolume: 0 };
    let current = state;
    for (let i = 0; i < 100; i++) {
      current = calculateProgressTick(current, 0.8);
    }
    expect(current.progress).toBeGreaterThan(0);
  });

  it('caps progress at 100', () => {
    let state = { progress: 99, smoothedVolume: 0.9 };
    for (let i = 0; i < 200; i++) {
      state = calculateProgressTick(state, 1);
    }
    expect(state.progress).toBe(GAME_CONFIG.MAX_PROGRESS);
  });

  it('slows down when volume drops below threshold', () => {
    let state = { progress: 0, smoothedVolume: 0.8 };
    for (let i = 0; i < 50; i++) {
      state = calculateProgressTick(state, 0.8);
    }
    const progressAtPeak = state.progress;
    expect(progressAtPeak).toBeGreaterThan(0);

    for (let i = 0; i < 100; i++) {
      state = calculateProgressTick(state, 0);
    }
    const progressAfterSilence = state.progress;
    const additionalGain = progressAfterSilence - progressAtPeak;
    expect(additionalGain).toBeLessThan(0.5);
  });
});

describe('getRaceResults', () => {
  it('sorts by progress descending', () => {
    const players = [
      { id: '1', progress: 50, nickname: 'A' },
      { id: '2', progress: 80, nickname: 'B' },
      { id: '3', progress: 30, nickname: 'C' },
    ];
    const results = getRaceResults(players);
    expect(results[0].place).toBe(1);
    expect(results[0].id).toBe('2');
    expect(results[1].place).toBe(2);
    expect(results[2].place).toBe(3);
  });

  it('uses finishedAt as tiebreaker', () => {
    const players = [
      { id: '1', progress: 100, finishedAt: 2000 },
      { id: '2', progress: 100, finishedAt: 1000 },
    ];
    const results = getRaceResults(players);
    expect(results[0].id).toBe('2');
  });
});
