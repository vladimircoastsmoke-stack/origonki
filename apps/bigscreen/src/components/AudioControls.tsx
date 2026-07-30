import { AudioMuteButton } from './AudioMuteButton';

export function AudioControls({
  needsUnlock,
  onUnlock,
}: {
  needsUnlock: boolean;
  onUnlock: () => void;
}) {
  return (
    <>
      <AudioMuteButton />
      {needsUnlock && (
        <button type="button" className="audio-unlock-hint" onClick={() => void onUnlock()}>
          🔊 Нажмите для музыки
        </button>
      )}
    </>
  );
}
