import type { CitySceneId } from '../types.js';

/** Одна нота: частота (0 = пауза), длительность в секундах */
export interface MelodyNote {
  f: number;
  d: number;
}

export interface BassNote {
  f: number;
  d: number;
}

export interface TrackDef {
  melody: MelodyNote[];
  bass?: BassNote[];
  bpm: number;
  loop: boolean;
}

export interface CityTracks {
  lobby: TrackDef;
  race: TrackDef;
  victory: TrackDef;
}

const q = (bpm: number, beats = 1) => (60 / bpm) * beats;

const N = {
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G2: 98.0,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  Ab5: 830.61,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
  Gs4: 415.3,
  Gs5: 830.61,
  REST: 0,
} as const;

type NoteSpec = readonly (readonly [number, number])[];

function track(bpm: number, loop: boolean, melody: NoteSpec, bass?: NoteSpec): TrackDef {
  return {
    bpm,
    loop,
    melody: melody.map(([f, beats]) => ({ f, d: q(bpm, beats) })),
    bass: bass?.map(([f, beats]) => ({ f, d: q(bpm, beats) })),
  };
}

/** Главное меню админки — bouncy C-major в духе 8-bit platformer overworld */
export const ADMIN_MENU_TRACK: TrackDef = track(168, true,
  [
    [N.E5, 0.5], [N.REST, 0.5], [N.E5, 0.5], [N.REST, 0.5], [N.E5, 0.5], [N.REST, 0.5], [N.C5, 0.5], [N.E5, 0.5],
    [N.REST, 0.5], [N.G5, 0.5], [N.REST, 0.5], [N.G4, 0.5], [N.REST, 1],
    [N.C5, 0.5], [N.REST, 0.5], [N.G4, 0.5], [N.REST, 1],
    [N.E4, 0.5], [N.REST, 0.5], [N.A4, 0.5], [N.REST, 0.5], [N.B4, 0.5], [N.REST, 0.5], [N.A4, 0.5], [N.REST, 0.5],
    [N.G4, 0.5], [N.E5, 0.5], [N.G5, 0.5], [N.A5, 0.5], [N.F5, 0.5], [N.G5, 0.5], [N.REST, 0.5], [N.E5, 0.5],
    [N.C5, 0.5], [N.REST, 0.5], [N.E5, 0.5], [N.REST, 0.5], [N.G5, 1],
    [N.G4, 0.5], [N.F5, 0.5], [N.E5, 0.5], [N.D5, 0.5], [N.C5, 1],
  ],
  [[N.C4, 1], [N.G3, 1], [N.E3, 1], [N.G3, 1], [N.A3, 1], [N.E3, 1], [N.G3, 1], [N.C4, 1]],
);

/** 🇷🇺 Мурманск */
const MURMANSK: CityTracks = {
  lobby: track(148, true,
    [
      [N.D4, 0.5], [N.F4, 0.5], [N.A4, 0.5], [N.G4, 0.5], [N.F4, 0.5], [N.D4, 0.5], [N.F4, 0.5], [N.A4, 0.5],
      [N.Bb4, 0.5], [N.A4, 0.5], [N.G4, 0.5], [N.F4, 0.5], [N.E4, 0.5], [N.F4, 0.5], [N.G4, 0.5], [N.A4, 0.5],
      [N.D5, 0.5], [N.C5, 0.5], [N.Bb4, 0.5], [N.A4, 0.5], [N.G4, 0.5], [N.F4, 0.5], [N.E4, 0.5], [N.D4, 0.5],
      [N.D4, 0.5], [N.F4, 0.5], [N.A4, 0.5], [N.D5, 1], [N.A4, 0.5], [N.G4, 0.5], [N.F4, 0.5], [N.D4, 1],
    ],
    [[N.D3, 1], [N.A3, 1], [N.Bb3, 1], [N.G3, 1], [N.D3, 1], [N.F3, 1], [N.A3, 1], [N.D3, 1]],
  ),
  race: track(172, true,
    [
      [N.D4, 0.25], [N.D4, 0.25], [N.F4, 0.5], [N.A4, 0.5], [N.D5, 0.5], [N.A4, 0.5], [N.F4, 0.5], [N.D4, 0.5],
      [N.E4, 0.5], [N.G4, 0.5], [N.Bb4, 0.5], [N.A4, 0.5], [N.G4, 0.5], [N.F4, 0.5], [N.E4, 0.5], [N.D4, 0.5],
      [N.F4, 0.5], [N.A4, 0.5], [N.C5, 0.5], [N.Bb4, 0.5], [N.A4, 0.5], [N.G4, 0.5], [N.F4, 0.5], [N.D4, 0.5],
      [N.D5, 0.25], [N.D5, 0.25], [N.C5, 0.5], [N.Bb4, 0.5], [N.A4, 0.5], [N.G4, 0.5], [N.F4, 0.5], [N.D4, 1],
    ],
    [[N.D3, 0.5], [N.D3, 0.5], [N.F3, 0.5], [N.A3, 0.5], [N.D3, 0.5], [N.Bb3, 0.5], [N.G3, 0.5], [N.D3, 1]],
  ),
  victory: track(156, false,
    [
      [N.D4, 0.25], [N.F4, 0.25], [N.A4, 0.25], [N.D5, 0.75],
      [N.C5, 0.25], [N.Bb4, 0.25], [N.A4, 0.25], [N.G4, 0.5], [N.A4, 0.25], [N.Bb4, 0.25], [N.D5, 1.25],
    ],
    [[N.D3, 0.5], [N.F3, 0.5], [N.A3, 0.5], [N.D3, 1.5]],
  ),
};

/** 🇦🇪 Дубай */
const DUBAI: CityTracks = {
  lobby: track(132, true,
    [
      [N.E4, 0.5], [N.F4, 0.5], [N.Gs4, 0.75], [N.A4, 0.25], [N.Gs4, 0.5], [N.F4, 0.5], [N.E4, 0.5], [N.D4, 0.5],
      [N.F4, 0.5], [N.Gs4, 0.5], [N.B4, 0.75], [N.A4, 0.25], [N.Gs4, 0.5], [N.F4, 0.5], [N.E4, 0.5], [N.REST, 0.5],
      [N.E4, 0.5], [N.Gs4, 0.5], [N.B4, 0.5], [N.A4, 0.5], [N.Gs4, 0.5], [N.F4, 0.5], [N.E4, 0.5], [N.D4, 0.5],
      [N.E4, 0.5], [N.F4, 0.5], [N.Gs4, 0.5], [N.E5, 1], [N.D5, 0.5], [N.C5, 0.5], [N.B4, 0.5], [N.E4, 1],
    ],
    [[N.E3, 1], [N.B3, 1], [N.E3, 1], [N.A3, 1], [N.E3, 1], [N.G3, 1], [N.B3, 1], [N.E3, 1]],
  ),
  race: track(158, true,
    [
      [N.E4, 0.25], [N.F4, 0.25], [N.Gs4, 0.5], [N.B4, 0.5], [N.A4, 0.5], [N.Gs4, 0.5], [N.F4, 0.5], [N.E4, 0.5],
      [N.F4, 0.5], [N.Gs4, 0.5], [N.B4, 0.5], [N.E5, 0.5], [N.D5, 0.5], [N.C5, 0.5], [N.B4, 0.5], [N.A4, 0.5],
      [N.Gs4, 0.5], [N.F4, 0.5], [N.E4, 0.5], [N.F4, 0.5], [N.Gs4, 0.5], [N.B4, 0.5], [N.E5, 0.5], [N.B4, 0.5],
      [N.A4, 0.25], [N.Gs4, 0.25], [N.F4, 0.5], [N.E4, 0.5], [N.F4, 0.5], [N.Gs4, 0.5], [N.E5, 1],
    ],
    [[N.E3, 0.5], [N.E3, 0.5], [N.B3, 0.5], [N.E3, 0.5], [N.A3, 0.5], [N.E3, 0.5], [N.G3, 0.5], [N.E3, 1]],
  ),
  victory: track(144, false,
    [
      [N.E4, 0.25], [N.Gs4, 0.25], [N.B4, 0.25], [N.E5, 0.75],
      [N.D5, 0.25], [N.C5, 0.25], [N.B4, 0.25], [N.A4, 0.25], [N.Gs4, 0.25], [N.B4, 0.25], [N.E5, 1.25],
    ],
    [[N.E3, 0.5], [N.G3, 0.5], [N.B3, 0.5], [N.E3, 1.5]],
  ),
};

/** 🇫🇷 Монако */
const MONACO: CityTracks = {
  lobby: track(162, true,
    [
      [N.C5, 0.33], [N.E5, 0.33], [N.G5, 0.34], [N.E5, 0.33], [N.C5, 0.33], [N.G4, 0.34],
      [N.A4, 0.33], [N.C5, 0.33], [N.E5, 0.34], [N.C5, 0.33], [N.A4, 0.33], [N.F4, 0.34],
      [N.G4, 0.33], [N.B4, 0.33], [N.D5, 0.34], [N.B4, 0.33], [N.G4, 0.33], [N.E4, 0.34],
      [N.F4, 0.33], [N.A4, 0.33], [N.C5, 0.34], [N.E5, 0.33], [N.G5, 0.33], [N.C6, 0.34],
      [N.G5, 0.5], [N.E5, 0.5], [N.C5, 0.5], [N.G4, 1],
    ],
    [[N.C4, 1], [N.G3, 1], [N.F3, 1], [N.C4, 1], [N.G3, 1], [N.E3, 1], [N.C4, 1], [N.G3, 1]],
  ),
  race: track(176, true,
    [
      [N.C5, 0.25], [N.E5, 0.25], [N.G5, 0.5], [N.C6, 0.5], [N.G5, 0.5], [N.E5, 0.5], [N.C5, 0.5], [N.G4, 0.5],
      [N.A4, 0.5], [N.C5, 0.5], [N.E5, 0.5], [N.A5, 0.5], [N.E5, 0.5], [N.C5, 0.5], [N.A4, 0.5], [N.F4, 0.5],
      [N.G4, 0.5], [N.B4, 0.5], [N.D5, 0.5], [N.G5, 0.5], [N.D5, 0.5], [N.B4, 0.5], [N.G4, 0.5], [N.E4, 0.5],
      [N.C5, 0.25], [N.E5, 0.25], [N.G5, 0.5], [N.C6, 0.5], [N.B5, 0.5], [N.A5, 0.5], [N.G5, 1],
    ],
    [[N.C4, 0.5], [N.G3, 0.5], [N.E3, 0.5], [N.C4, 0.5], [N.F3, 0.5], [N.C4, 0.5], [N.G3, 0.5], [N.C4, 1]],
  ),
  victory: track(168, false,
    [
      [N.C5, 0.25], [N.E5, 0.25], [N.G5, 0.25], [N.C6, 0.75],
      [N.B5, 0.25], [N.G5, 0.25], [N.E5, 0.25], [N.C5, 0.5], [N.E5, 0.25], [N.G5, 0.25], [N.C6, 1.25],
    ],
    [[N.C4, 0.5], [N.E3, 0.5], [N.G3, 0.5], [N.C4, 1.5]],
  ),
};

/** 🇯🇵 Токио */
const TOKYO: CityTracks = {
  lobby: track(154, true,
    [
      [N.C5, 0.5], [N.D5, 0.5], [N.F5, 0.5], [N.G5, 0.5], [N.F5, 0.5], [N.D5, 0.5], [N.C5, 0.5], [N.REST, 0.5],
      [N.A4, 0.5], [N.C5, 0.5], [N.D5, 0.5], [N.F5, 0.5], [N.D5, 0.5], [N.C5, 0.5], [N.A4, 0.5], [N.REST, 0.5],
      [N.G4, 0.5], [N.A4, 0.5], [N.C5, 0.5], [N.D5, 0.5], [N.F5, 0.5], [N.D5, 0.5], [N.C5, 0.5], [N.A4, 0.5],
      [N.C5, 0.5], [N.D5, 0.5], [N.F5, 0.5], [N.C5, 1], [N.A4, 0.5], [N.G4, 0.5], [N.F5, 0.5], [N.C5, 1],
    ],
    [[N.C4, 1], [N.G3, 1], [N.A3, 1], [N.F3, 1], [N.C4, 1], [N.G3, 1], [N.A3, 1], [N.C4, 1]],
  ),
  race: track(178, true,
    [
      [N.C5, 0.25], [N.D5, 0.25], [N.F5, 0.5], [N.G5, 0.5], [N.F5, 0.5], [N.D5, 0.5], [N.C5, 0.5], [N.A4, 0.5],
      [N.C5, 0.5], [N.D5, 0.5], [N.F5, 0.5], [N.A5, 0.5], [N.G5, 0.5], [N.F5, 0.5], [N.D5, 0.5], [N.C5, 0.5],
      [N.A4, 0.5], [N.C5, 0.5], [N.D5, 0.5], [N.F5, 0.5], [N.G5, 0.5], [N.F5, 0.5], [N.D5, 0.5], [N.A4, 0.5],
      [N.C5, 0.25], [N.D5, 0.25], [N.F5, 0.5], [N.G5, 0.5], [N.F5, 0.5], [N.D5, 0.5], [N.C5, 1],
    ],
    [[N.C4, 0.5], [N.A3, 0.5], [N.F3, 0.5], [N.C4, 0.5], [N.G3, 0.5], [N.C4, 0.5], [N.A3, 0.5], [N.C4, 1]],
  ),
  victory: track(160, false,
    [
      [N.C5, 0.25], [N.D5, 0.25], [N.F5, 0.25], [N.A5, 0.75],
      [N.G5, 0.25], [N.F5, 0.25], [N.D5, 0.25], [N.C5, 0.5], [N.D5, 0.25], [N.F5, 0.25], [N.C6, 1.25],
    ],
    [[N.C4, 0.5], [N.G3, 0.5], [N.C4, 0.5], [N.C4, 1.5]],
  ),
};

export const CITY_TRACKS: Record<CitySceneId, CityTracks> = {
  murmansk: MURMANSK,
  dubai: DUBAI,
  monaco: MONACO,
  tokyo: TOKYO,
};

export type TrackPhase = keyof CityTracks;

export function getCityTrack(cityId: CitySceneId, phase: TrackPhase): TrackDef {
  return CITY_TRACKS[cityId][phase];
}

export function asCitySceneId(cityId: string): CitySceneId {
  if (cityId in CITY_TRACKS) return cityId as CitySceneId;
  return 'dubai';
}
