/** Пиксельные спрайты машин — вид сбоку, смотрят ВПРАВО (→ финиш) */
export type SpriteRect = [x: number, y: number, w: number, h: number, fill: string];

const B = 'B';
const K = '#0c0c44';
const W = '#5c94fc';
const H = '#fcfcfc';

function car(body: string, rects: Array<[number, number, number, number, string]>): SpriteRect[] {
  return rects.map(([x, y, w, h, fill]) => [
    x,
    y,
    w,
    h,
    fill === B ? body : fill === 'K' ? K : fill === 'W' ? W : fill === 'H' ? H : fill,
  ]);
}

/** Базовые силуэты — переиспользуются с разными цветами */
const SILHOUETTES = {
  sedanCompact: (c: string) =>
    car(c, [
      [4, 11, 5, 4, K], [13, 11, 5, 4, K],
      [3, 7, 18, 4, B], [8, 4, 9, 3, B],
      [10, 5, 5, 2, W], [19, 8, 3, 3, B], [21, 9, 2, 2, H],
    ]),
  sedanClassic: (c: string) =>
    car(c, [
      [4, 11, 5, 4, K], [18, 11, 5, 4, K], [28, 11, 5, 4, K],
      [3, 7, 32, 4, B], [10, 3, 14, 4, B],
      [12, 4, 10, 3, W], [33, 8, 4, 3, B], [35, 9, 2, 2, H], [3, 9, 3, 2, B],
    ]),
  suv: (c: string) =>
    car(c, [
      [4, 12, 6, 4, K], [16, 12, 6, 4, K],
      [3, 4, 20, 8, B], [6, 5, 8, 4, W],
      [2, 6, 3, 5, B], [2, 7, 2, 3, K],
      [21, 6, 3, 6, B], [22, 7, 2, 2, H],
    ]),
  suvLux: (c: string) =>
    car(c, [
      [3, 12, 7, 4, K], [17, 12, 7, 4, K],
      [2, 3, 24, 9, B], [7, 4, 10, 5, W],
      [1, 5, 4, 6, B], [25, 5, 4, 7, B], [26, 6, 2, 2, H],
    ]),
  pickup: (c: string) =>
    car(c, [
      [4, 12, 6, 4, K], [20, 12, 6, 4, K],
      [3, 5, 12, 7, B], [6, 6, 7, 4, W],
      [14, 8, 12, 4, B], [22, 7, 3, 5, B], [23, 8, 2, 2, H],
    ]),
  hatch: (c: string) =>
    car(c, [
      [5, 11, 4, 4, K], [14, 11, 4, 4, K],
      [4, 7, 16, 4, B], [8, 4, 8, 3, B],
      [10, 5, 4, 2, W], [18, 8, 3, 3, B], [20, 9, 2, 2, H], [6, 4, 2, 2, '#fc9838'],
    ]),
  sportLow: (c: string) =>
    car(c, [
      [6, 12, 5, 3, K], [17, 12, 5, 3, K],
      [4, 8, 20, 4, B], [10, 5, 10, 3, B],
      [12, 6, 6, 2, W], [22, 9, 4, 3, B], [24, 10, 2, 2, H], [2, 10, 4, 1, '#fc9838'],
    ]),
  sportWing: (c: string) =>
    car(c, [
      [5, 11, 5, 4, K], [16, 11, 5, 4, K],
      [2, 5, 3, 4, B], [4, 7, 20, 4, B], [10, 3, 10, 4, B],
      [12, 4, 6, 2, W], [22, 8, 4, 3, B], [24, 9, 2, 2, H], [1, 4, 2, 6, B],
    ]),
  micro: (c: string) =>
    car(c, [
      [6, 12, 4, 3, K], [14, 12, 4, 3, K],
      [5, 8, 12, 4, B], [8, 5, 7, 3, B],
      [9, 6, 5, 2, W], [16, 9, 3, 2, B], [17, 10, 2, 1, H],
    ]),
  van: (c: string) =>
    car(c, [
      [4, 12, 5, 4, K], [18, 12, 5, 4, K],
      [3, 5, 22, 7, B], [5, 6, 10, 5, W],
      [23, 6, 3, 6, B], [24, 7, 2, 2, H],
    ]),
  retro: (c: string) =>
    car(c, [
      [4, 11, 5, 4, K], [14, 11, 5, 4, K],
      [3, 7, 18, 4, B], [8, 4, 9, 3, B],
      [10, 5, 5, 2, W], [19, 8, 3, 3, B], [21, 9, 2, 2, H],
      [7, 8, 14, 1, '#fc9838'],
    ]),
  limo: (c: string) =>
    car(c, [
      [4, 11, 5, 4, K], [15, 11, 5, 4, K], [24, 11, 5, 4, K],
      [3, 7, 28, 4, B], [9, 4, 12, 3, B],
      [11, 5, 8, 2, W], [29, 8, 3, 3, B], [31, 9, 2, 2, H],
    ]),
} as const;

type SilhouetteKey = keyof typeof SILHOUETTES;

/** id машины → силуэт + цвет кузова */
const CAR_SPRITE_DEFS: Record<string, { silhouette: SilhouetteKey; color: string }> = {
  // Мурманск — русские
  mur_zhiguli: { silhouette: 'sedanCompact', color: '#d82800' },
  mur_volga: { silhouette: 'sedanClassic', color: '#007800' },
  mur_uaz: { silhouette: 'suv', color: '#fc9838' },
  mur_lada: { silhouette: 'sedanCompact', color: '#0058f8' },
  mur_niva: { silhouette: 'suv', color: '#787878' },
  mur_gazel: { silhouette: 'van', color: '#fcfcfc' },
  mur_moskvich: { silhouette: 'hatch', color: '#00a800' },
  mur_pobeda: { silhouette: 'retro', color: '#585858' },
  mur_oka: { silhouette: 'micro', color: '#fc9838' },
  mur_kalina: { silhouette: 'hatch', color: '#d82800' },

  // Дубай — внедорожники
  dub_cruiser: { silhouette: 'suvLux', color: '#fcfcfc' },
  dub_gwagon: { silhouette: 'suv', color: '#585858' },
  dub_dune: { silhouette: 'suvLux', color: '#fc9838' },
  dub_pearl: { silhouette: 'suv', color: '#e8eef2' },
  dub_golden: { silhouette: 'suvLux', color: '#ffd700' },
  dub_oasis: { silhouette: 'pickup', color: '#d82800' },
  dub_mirage: { silhouette: 'limo', color: '#0058a8' },
  dub_falcon: { silhouette: 'suv', color: '#007800' },
  dub_sunset: { silhouette: 'suvLux', color: '#ff4400' },
  dub_royal: { silhouette: 'limo', color: '#0c0c44' },

  // Токио — японские
  tok_kei: { silhouette: 'micro', color: '#ff006e' },
  tok_drift: { silhouette: 'sportLow', color: '#fcfcfc' },
  tok_civic: { silhouette: 'hatch', color: '#0058f8' },
  tok_samurai: { silhouette: 'sportWing', color: '#d82800' },
  tok_cherry: { silhouette: 'micro', color: '#ff006e' },
  tok_midnight: { silhouette: 'sportLow', color: '#585858' },
  tok_sakura: { silhouette: 'hatch', color: '#ff69b4' },
  tok_ae86: { silhouette: 'sportLow', color: '#fcfcfc' },
  tok_supra: { silhouette: 'sportWing', color: '#ffd700' },
  tok_neon: { silhouette: 'sportLow', color: '#00d4ff' },

  // Монако — европейские
  mon_azure: { silhouette: 'sportLow', color: '#0058a8' },
  mon_riviera: { silhouette: 'sportWing', color: '#ffd700' },
  mon_monte: { silhouette: 'sportLow', color: '#d82800' },
  mon_citro: { silhouette: 'hatch', color: '#0058f8' },
  mon_peugeot: { silhouette: 'sedanCompact', color: '#ffd700' },
  mon_formula: { silhouette: 'sportWing', color: '#d82800' },
  mon_convert: { silhouette: 'sportLow', color: '#fc9838' },
  mon_rally: { silhouette: 'hatch', color: '#007800' },
  mon_gold: { silhouette: 'sportWing', color: '#ffd700' },
  mon_palace: { silhouette: 'limo', color: '#585858' },
};

export const CAR_SPRITE_RECTS: Record<string, SpriteRect[]> = Object.fromEntries(
  Object.entries(CAR_SPRITE_DEFS).map(([id, { silhouette, color }]) => [
    id,
    SILHOUETTES[silhouette](color),
  ]),
);

export const SPRITE_WIDTH = 40;
export const SPRITE_HEIGHT = 16;

export function getSpriteRects(carId: string): SpriteRect[] {
  return CAR_SPRITE_RECTS[carId] ?? CAR_SPRITE_RECTS.mur_zhiguli;
}

export function getCarRearX(carId: string): number {
  const rects = getSpriteRects(carId);
  return Math.min(...rects.map(([x]) => x));
}
