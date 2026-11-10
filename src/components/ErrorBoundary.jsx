import { Component } from "react"
import { Link } from "react-router-dom"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production, send to error tracking service here
    console.error("[ErrorBoundary] Uncaught error:", error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            حدث خطأ غير متوقع
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            Une erreur inattendue s&apos;est produite.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            إذا استمرت المشكلة، يرجى التواصل معنا.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              إعادة المحاولة / Réessayer
            </button>
            <Link to="/" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              الرئيسية / Accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
