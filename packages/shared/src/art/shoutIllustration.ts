/** 8-bit иллюстрация: два человека кричат друг на друга + детали сцены */
export type ArtRect = [x: number, y: number, w: number, h: number, fill: string];

const r = (x: number, y: number, w: number, h: number, fill: string): ArtRect =>
  [x, y, w, h, fill];

const SKY = '#5c94fc';
const SKY_DARK = '#0c0c44';
const GROUND = '#fc9838';
const GRASS = '#00a800';
const WHITE = '#fcfcfc';
const SKIN = '#fc9838';
const SHIRT_L = '#0058f8';
const SHIRT_R = '#d82800';
const PANTS = '#585858';
const GOLD = '#ffd700';
const PHONE = '#282828';
const MIC = '#ff006e';

function personLeft(baseX: number, baseY: number, shirt: string): ArtRect[] {
  return [
    r(baseX + 4, baseY, 12, 12, SKIN),
    r(baseX + 6, baseY + 2, 3, 3, SKY_DARK),
    r(baseX + 11, baseY + 2, 3, 3, SKY_DARK),
    r(baseX + 8, baseY + 8, 6, 4, '#d82800'),
    r(baseX + 2, baseY + 12, 16, 14, shirt),
    r(baseX + 4, baseY + 26, 6, 10, PANTS),
    r(baseX + 12, baseY + 26, 6, 10, PANTS),
    r(baseX + 18, baseY + 4, 4, 12, SKIN),
    r(baseX + 20, baseY, 4, 6, SKIN),
  ];
}

function personRight(baseX: number, baseY: number, shirt: string): ArtRect[] {
  return [
    r(baseX + 4, baseY, 12, 12, SKIN),
    r(baseX + 6, baseY + 2, 3, 3, SKY_DARK),
    r(baseX + 11, baseY + 2, 3, 3, SKY_DARK),
    r(baseX + 6, baseY + 8, 6, 4, '#d82800'),
    r(baseX + 2, baseY + 12, 16, 14, shirt),
    r(baseX + 4, baseY + 26, 6, 10, PANTS),
    r(baseX + 12, baseY + 26, 6, 10, PANTS),
    r(baseX - 2, baseY + 4, 4, 12, SKIN),
    r(baseX - 4, baseY, 4, 6, SKIN),
  ];
}

export const SHOUT_SCENE_WIDTH = 200;
export const SHOUT_SCENE_HEIGHT = 112;

export const SHOUT_SCENE_RECTS: ArtRect[] = [
  r(0, 0, SHOUT_SCENE_WIDTH, 70, SKY),
  r(0, 68, SHOUT_SCENE_WIDTH, 4, GRASS),
  r(0, 72, SHOUT_SCENE_WIDTH, 40, GROUND),

  r(8, 8, 4, 4, WHITE),
  r(24, 16, 3, 3, WHITE),
  r(168, 10, 4, 4, WHITE),
  r(184, 22, 3, 3, WHITE),
  r(148, 14, 2, 2, GOLD),

  r(40, 6, 120, 14, SKY_DARK),
  r(44, 10, 112, 6, '#d82800'),
  r(72, 11, 56, 4, WHITE),

  ...personLeft(18, 38, SHIRT_L),
  r(52, 46, 4, 2, GOLD),
  r(58, 44, 4, 2, WHITE),
  r(64, 42, 4, 2, GOLD),
  r(70, 44, 3, 2, WHITE),

  ...personRight(138, 38, SHIRT_R),
  r(134, 46, 4, 2, GOLD),
  r(128, 44, 4, 2, WHITE),
  r(122, 42, 4, 2, GOLD),
  r(116, 44, 3, 2, WHITE),

  r(88, 48, 24, 32, PHONE),
  r(90, 50, 20, 24, '#0058f8'),
  r(94, 78, 12, 3, PHONE),
  r(96, 44, 8, 6, MIC),
  r(98, 40, 4, 4, WHITE),

  r(114, 52, 22, 28, PHONE),
  r(116, 54, 18, 22, '#007800'),
  r(120, 78, 10, 3, PHONE),
  r(122, 48, 8, 6, MIC),

  r(78, 56, 16, 20, GOLD),
  r(80, 52, 12, 6, GOLD),
  r(82, 48, 8, 4, GOLD),

  r(68, 78, 8, 16, WHITE),
  r(66, 76, 12, 4, SKY_DARK),
  r(64, 80, 4, 4, '#d82800'),
  r(72, 80, 4, 4, WHITE),
  r(64, 88, 4, 4, WHITE),
  r(72, 88, 4, 4, '#d82800'),

  r(16, 88, 6, 6, SHIRT_L),
  r(14, 94, 4, 4, SKIN),
  r(32, 90, 6, 6, '#007800'),
  r(30, 96, 4, 4, SKIN),
  r(48, 88, 6, 6, SHIRT_R),
  r(46, 94, 4, 4, SKIN),
  r(148, 88, 6, 6, SHIRT_R),
  r(146, 94, 4, 4, SKIN),
  r(164, 90, 6, 6, SHIRT_L),
  r(162, 96, 4, 4, SKIN),
  r(180, 88, 6, 6, '#ffd700'),
  r(178, 94, 4, 4, SKIN),

  r(52, 82, 20, 8, '#787878'),
  r(54, 80, 6, 4, '#d82800'),
  r(62, 80, 6, 4, WHITE),
  r(70, 80, 6, 4, '#d82800'),
  r(78, 80, 6, 4, WHITE),
  r(86, 80, 6, 4, '#d82800'),
  r(94, 80, 6, 4, WHITE),
  r(102, 80, 6, 4, '#d82800'),
  r(110, 80, 6, 4, WHITE),
  r(118, 80, 6, 4, '#d82800'),
  r(126, 80, 6, 4, WHITE),
];
