import { GAME_INTRO } from '@decibel-racing/shared';
import { ShoutHero } from './ShoutHero';

type GameIntroVariant = 'full' | 'compact' | 'player';

export function GameIntroBox({
  variant = 'full',
  showIllustration = true,
}: {
  variant?: GameIntroVariant;
  showIllustration?: boolean;
}) {
  return (
    <aside className={`game-intro game-intro-${variant}`}>
      {showIllustration && <ShoutHero className="game-intro-art" />}
      <p className="game-intro-badge">{GAME_INTRO.title}</p>
      <p className="game-intro-headline">{GAME_INTRO.headline}</p>
      <p className="game-intro-essence">{GAME_INTRO.essence}</p>
      {variant === 'full' && (
        <ol className="game-intro-steps">
          {GAME_INTRO.steps.map((step, i) => (
            <li key={step}>
              <span className="game-intro-step-num">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
      {variant === 'player' && <p className="game-intro-player">{GAME_INTRO.playerLine}</p>}
    </aside>
  );
}
