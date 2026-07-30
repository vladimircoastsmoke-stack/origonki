import {
  SHOUT_SCENE_RECTS,
  SHOUT_SCENE_WIDTH,
  SHOUT_SCENE_HEIGHT,
} from '@decibel-racing/shared';

export function ShoutHero({ className = '' }: { className?: string }) {
  return (
    <figure className={`shout-hero ${className}`.trim()} aria-hidden>
      <svg
        className="shout-hero-svg"
        viewBox={`0 0 ${SHOUT_SCENE_WIDTH} ${SHOUT_SCENE_HEIGHT}`}
        width={SHOUT_SCENE_WIDTH}
        height={SHOUT_SCENE_HEIGHT}
      >
        {SHOUT_SCENE_RECTS.map(([x, y, w, h, fill], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
        ))}
      </svg>
    </figure>
  );
}
