import { Component } from 'react'

// Last line of defence: a render error must not leave a blank screen. Shows a short message (never the stack trace)
// and lets the user drop the cached game data, the usual culprit, and reload.
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }

  reset = () => {
    try { localStorage.removeItem('wr-game'); localStorage.removeItem('wr-ai-cache') } catch { /* storage blocked */ }
    location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-felt px-8 text-center text-chalk">
        <p className="text-xl font-semibold">Algo salió mal / Something went wrong</p>
        <p className="max-w-xs text-chalk-dim">Puedes reiniciar los datos del juego guardados en el teléfono. Tu historial y tus ajustes no se borran.</p>
        <button type="button" onClick={this.reset} className="h-12 rounded-xl bg-marker px-6 font-bold text-marker-ink">Reiniciar datos / Reset data</button>
      </div>
    )
  }
}
