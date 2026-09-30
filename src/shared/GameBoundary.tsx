import { Component, type ReactNode } from "react";
export default class GameBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h2>No se ha podido abrir este juego.</h2>
        <p>
          Actualiza la página para cargar la última versión de la colección.
        </p>
        <button className="primary" onClick={() => location.reload()}>
          Actualizar Games
        </button>
        <a href="#">Volver a la colección</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
