import { motion } from 'framer-motion';
import { CARS, type Player } from '@decibel-racing/shared';

interface RaceTrackProps {
  players: Player[];
  maxPlayers: 2 | 4;
  cityGradient: [string, string];
  accent: string;
}

export function RaceTrack({ players, maxPlayers, cityGradient, accent }: RaceTrackProps) {
  const lanes = maxPlayers;

  return (
    <div className="race-track" style={{ background: `linear-gradient(180deg, ${cityGradient[0]}, ${cityGradient[1]})` }}>
      <div className="track-finish-line" />
      <div className="track-start-line" />

      {Array.from({ length: lanes }).map((_, laneIndex) => {
        const player = players[laneIndex];
        return (
          <div key={laneIndex} className="track-lane">
            <div className="lane-markers">
              {[25, 50, 75].map((mark) => (
                <div key={mark} className="lane-marker" style={{ left: `${mark}%` }}>
                  {mark}%
                </div>
              ))}
            </div>

            {player && (
              <>
                <motion.div
                  className="car-container"
                  animate={{ left: `${Math.min(player.progress, 100)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <div className="car-name">{player.nickname}</div>
                  <div
                    className="car-sprite"
                    style={{
                      color: CARS.find((c) => c.id === player.carId)?.color || accent,
                    }}
                  >
                    {CARS.find((c) => c.id === player.carId)?.emoji || '🏎️'}
                    {player.currentVolume > 0.1 && (
                      <span className="car-smoke">💨</span>
                    )}
                  </div>
                </motion.div>

                <div className="volume-bar-container">
                  <div
                    className="volume-bar"
                    style={{
                      width: `${player.currentVolume * 100}%`,
                      background: accent,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
