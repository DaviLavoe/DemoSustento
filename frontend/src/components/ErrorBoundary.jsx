import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 text-neutral-900 font-sans">
          <div className="max-w-xl w-full p-8 bg-white rounded-3xl border border-neutral-200 shadow-xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 text-xl font-bold">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-bold">Algo salió mal</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                La aplicación experimentó un error inesperado al renderizar esta sección. A continuación se muestran los detalles técnicos:
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl overflow-auto text-[11px] font-mono text-red-600 max-h-60 leading-normal">
                <span className="font-bold">{this.state.error.toString()}</span>
                {this.state.error.stack && (
                  <pre className="mt-2 text-neutral-500 whitespace-pre-wrap text-[10px]">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={() => {
                localStorage.clear(); // Limpiar localStorage en caso de datos corruptos
                window.location.reload();
              }}
              className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              Limpiar Sesión y Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
