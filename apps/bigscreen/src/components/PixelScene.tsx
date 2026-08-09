import type { CSSProperties } from 'react';
import type { CityOption } from '@decibel-racing/shared';

interface PixelSceneProps {
  city: CityOption;
}

/** Фоновая 8-bit сцена по выбранной трассе */
export function PixelScene({ city }: PixelSceneProps) {
  const p = city.palette;
  const style = {
    '--scene-sky-top': p.skyTop,
    '--scene-sky-bottom': p.skyBottom,
    '--scene-ground': p.ground,
    '--scene-building': p.building,
    '--scene-building-alt': p.buildingAlt,
    '--scene-window': p.window,
    '--scene-window-lit': p.windowLit,
    '--scene-accent': p.accent,
    '--scene-snow': p.snow ?? '#fcfcfc',
    '--scene-water': p.water ?? '#0088d8',
  } as CSSProperties;

  return (
    <div className={`pixel-scene pixel-scene-${city.scene}`} style={style} aria-hidden>
      {city.scene === 'dubai' && <DubaiScene />}
      {city.scene === 'murmansk' && <MurmanskScene />}
      {city.scene === 'monaco' && <MonacoScene />}
      {city.scene === 'tokyo' && <TokyoScene />}
    </div>
  );
}

function DubaiScene() {
  return (
    <>
      <div className="scene-sky" />
      <div className="scene-stars">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="scene-star" style={{ left: `${(i * 19 + 5) % 98}%`, top: `${(i * 11 + 3) % 28}%` }} />
        ))}
      </div>
      <div className="scene-dubai-buildings">
        <div className="dubai-tower dubai-t1" />
        <div className="dubai-tower dubai-burj" />
        <div className="dubai-tower dubai-t2" />
        <div className="dubai-tower dubai-t3" />
        <div className="dubai-tower dubai-t4" />
      </div>
      <div className="scene-palm scene-palm-l" />
      <div className="scene-palm scene-palm-r" />
      <div className="scene-desert" />
    </>
  );
}

/** Хрущёвка — 5 этажей, типовая панелька */
function Khrushchyovka({ lit }: { lit: boolean }) {
  return (
    <div className="khrushchyovka">
      <div className="khr-roof" />
      <div className="khr-floors">
        {Array.from({ length: 5 }).map((_, floor) => (
          <div key={floor} className="khr-floor">
            <span className={`khr-window ${lit && floor % 2 === 0 ? 'lit' : ''}`} style={{ animationDelay: `${floor * 0.4}s` }} />
            <span className={`khr-window ${lit && floor % 2 === 1 ? 'lit' : ''}`} style={{ animationDelay: `${floor * 0.4 + 0.2}s` }} />
            <span className={`khr-window ${!lit && floor === 2 ? 'lit' : ''}`} style={{ animationDelay: '1s' }} />
            <span className="khr-window" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MurmanskScene() {
  return (
    <>
      <div className="scene-sky scene-sky-murmansk" />
      <div className="scene-aurora" />
      <div className="scene-snowfall">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="snowflake"
            style={{
              left: `${(i * 7 + 2) % 100}%`,
              animationDuration: `${2 + (i % 5) * 0.5}s`,
              animationDelay: `${(i % 10) * 0.3}s`,
            }}
          />
        ))}
      </div>
      <div className="scene-murmansk-row">
        <Khrushchyovka lit={false} />
        <Khrushchyovka lit={true} />
        <Khrushchyovka lit={false} />
        <Khrushchyovka lit={true} />
        <Khrushchyovka lit={false} />
        <Khrushchyovka lit={true} />
      </div>
      <div className="scene-snow-ground" />
    </>
  );
}

function MonacoScene() {
  return (
    <>
      <div className="scene-sky scene-sky-monaco" />
      <div className="scene-sun" />
      <div className="scene-monaco-cliff" />
      <div className="scene-monaco-buildings">
        <div className="monaco-house mh1" />
        <div className="monaco-house mh2" />
        <div className="monaco-house mh3" />
      </div>
      <div className="scene-sea">
        <div className="sea-wave wave-1" />
        <div className="sea-wave wave-2" />
      </div>
      <div className="scene-yachts">
        <div className="yacht y1" />
        <div className="yacht y2" />
      </div>
      <div className="scene-promenade" />
    </>
  );
}

function TokyoScene() {
  return (
    <>
      <div className="scene-sky scene-sky-tokyo" />
      <div className="scene-rain">
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className="rain-drop"
            style={{
              left: `${(i * 5) % 100}%`,
              animationDuration: `${0.4 + (i % 3) * 0.15}s`,
              animationDelay: `${(i % 20) * 0.05}s`,
            }}
          />
        ))}
      </div>
      <div className="scene-tokyo-buildings">
        <div className="tokyo-bld tb1"><span className="neon-sign neon-pink">ドリフト</span></div>
        <div className="tokyo-bld tb2"><span className="neon-sign neon-cyan">ORIGONKI</span></div>
        <div className="tokyo-bld tb3"><span className="neon-sign neon-yellow">レース</span></div>
        <div className="tokyo-bld tb4" />
      </div>
      <div className="scene-tokyo-ground" />
    </>
  );
}
