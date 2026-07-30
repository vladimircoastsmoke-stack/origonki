import { motion, AnimatePresence } from 'framer-motion';
import { CARS, type Player, type CityOption } from '@decibel-racing/shared';
import { CarSprite } from './CarSprite';
import { Fireworks } from './Fireworks';

interface CountdownProps {
  value: number | undefined;
  city: CityOption;
}

export function Countdown({ value, city }: CountdownProps) {
  const display = value === 0 ? 'СТАРТ!' : value?.toString() ?? '';

  return (
    <div className={`countdown-screen countdown-dendy countdown-${city.scene}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={display}
          className="countdown-number"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {display}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface PodiumProps {
  results: (Player & { place: number })[];
  logoUrl?: string;
  city: CityOption;
}

export function Podium({ results, logoUrl, city }: PodiumProps) {
  const top3 = results.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className={`podium-screen podium-dendy podium-${city.scene}`}>
      <Fireworks />
      {logoUrl && <img src={logoUrl} alt="Event" className="podium-logo" />}
      <h1 className="podium-title">🏆 Финиш!</h1>
      <div className="podium">
        {podiumOrder.map((player, i) => {
          if (!player) return null;
          const heights = ['120px', '160px', '100px'];
          const places = [2, 1, 3];
          return (
            <motion.div
              key={player.id}
              className="podium-place"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              <CarSprite carId={player.carId} scale={2.5} />
              <div className="podium-name">{player.nickname}</div>
              <div className="podium-block" style={{ height: heights[i] }}>
                #{places[i]}
              </div>
            </motion.div>
          );
        })}
      </div>
      {results.length > 3 && (
        <div className="podium-rest">
          {results.slice(3).map((r) => {
            const car = CARS.find((c) => c.id === r.carId);
            return (
              <div key={r.id}>
                #{r.place} {r.nickname} {car ? `· ${car.name}` : ''}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
