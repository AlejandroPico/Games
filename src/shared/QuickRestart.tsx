import { RotateCcw } from "lucide-react";
export default function QuickRestart({
  onRestart,
  disabled = false,
}: {
  onRestart: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="quick-restart"
      aria-label="Nueva partida con los mismos ajustes"
      title="Nueva partida con los mismos ajustes"
      disabled={disabled}
      onClick={onRestart}
    >
      <RotateCcw size={19} />
      <span>Nueva partida</span>
    </button>
  );
}
