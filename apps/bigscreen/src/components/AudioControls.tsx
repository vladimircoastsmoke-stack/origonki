export function AudioControls({
  needsUnlock,
  onUnlock,
}: {
  needsUnlock: boolean;
  onUnlock: () => void;
}) {
  if (!needsUnlock) return null;

  return (
    <button type="button" className="audio-unlock-hint" onClick={() => void onUnlock()}>
      🔊 Нажмите для музыки
    </button>
  );
}
