import { useState, type ReactNode } from "react";
/** A handover curtain on one screen; online visibility is enforced by GameLayout's actor. */
export default function PrivateHand({
  token,
  conceal,
  children,
}: {
  token: string;
  conceal: boolean;
  children: ReactNode;
}) {
  const [seen, setSeen] = useState("");
  return conceal && seen !== token ? (
    <button className="handover" onClick={() => setSeen(token)}>
      Pasa la pantalla al jugador del turno · Mostrar mano
    </button>
  ) : (
    <>{children}</>
  );
}
