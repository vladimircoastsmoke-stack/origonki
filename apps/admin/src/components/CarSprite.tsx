import { getSpriteRects, SPRITE_WIDTH, SPRITE_HEIGHT, getCarRearX } from '@decibel-racing/shared';

interface CarSpriteProps {
  carId: string;
  scale?: number;
  revving?: boolean;
  className?: string;
}

export function CarSprite({ carId, scale = 3, revving = false, className = '' }: CarSpriteProps) {
  const rects = getSpriteRects(carId);
  const rearX = getCarRearX(carId);

  return (
    <div className={`car-sprite-wrap ${className} ${revving ? 'car-revving' : ''}`}>
      {revving && (
        <div className="car-exhaust" style={{ left: `${(rearX / SPRITE_WIDTH) * 100}%` }}>
          <span className="exhaust-puff puff-1" />
          <span className="exhaust-puff puff-2" />
          <span className="exhaust-puff puff-3" />
        </div>
      )}
      <svg
        className="car-sprite-svg"
        viewBox={`0 0 ${SPRITE_WIDTH} ${SPRITE_HEIGHT}`}
        width={SPRITE_WIDTH * scale}
        height={SPRITE_HEIGHT * scale}
        aria-hidden
      >
        {rects.map(([x, y, w, h, fill], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
        ))}
      </svg>
    </div>
  );
}

export function CarSpriteMini({ carId }: { carId: string }) {
  return <CarSprite carId={carId} scale={1.5} className="car-sprite-mini" />;
}
