import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { type Player, type CityOption } from '@decibel-racing/shared';
import type { MaxPlayers } from '@decibel-racing/shared';
import { CarSprite } from './CarSprite';

interface RaceTrackProps {
  players: Player[];
  maxPlayers: MaxPlayers;
  city: CityOption;
}

export function RaceTrack({ players, maxPlayers, city }: RaceTrackProps) {
  const lanes = maxPlayers;
  const laneClass = maxPlayers > 6 ? 'track-compact' : maxPlayers > 4 ? 'track-medium' : '';
  const p = city.palette;

  return (
    <div
      className={`race-track race-track-dendy race-track-${city.scene} ${laneClass}`}
      style={
        {
          '--track-accent': p.accent,
          '--track-road': p.road,
        } as CSSProperties
      }
    >
      <div className="track-road-texture" />
      <div className="track-finish-line" />
      <div className="track-start-line" />

      {Array.from({ length: lanes }).map((_, laneIndex) => {
        const lanePlayer = players[laneIndex];

        return (
          <div key={laneIndex} className="track-lane">
            <div className="lane-markers">
              {[25, 50, 75].map((mark) => (
                <div key={mark} className="lane-marker" style={{ left: `${mark}%` }} />
              ))}
            </div>

            {lanePlayer && (
              <>
                <motion.div
                  className="car-container"
                  animate={{ left: `${Math.min(lanePlayer.progress, 100)}%` }}
                  transition={{ type: 'tween', duration: 0.12, ease: 'linear' }}
                >
                  <div className="car-name">{lanePlayer.nickname}</div>
                  <CarSprite
                    carId={lanePlayer.carId}
                    scale={maxPlayers > 6 ? 2.2 : maxPlayers > 4 ? 2.6 : 3}
                    revving={lanePlayer.currentVolume > 0.08}
                  />
                </motion.div>

                <div className="volume-bar-container">
                  <div
                    className="volume-bar"
                    style={{ width: `${lanePlayer.currentVolume * 100}%` }}
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
