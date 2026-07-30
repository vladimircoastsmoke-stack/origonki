import { useAudioMute } from '../hooks/useAudioMute';

export function AudioMuteButton() {
  const { muted, toggle } = useAudioMute();

  return (
    <button
      type="button"
      className="audio-mute-btn"
      onClick={toggle}
      aria-pressed={muted}
      title={muted ? 'Включить звук' : 'Выключить звук'}
    >
      {muted ? '🔇 Звук выкл' : '🔊 Звук вкл'}
    </button>
  );
}
