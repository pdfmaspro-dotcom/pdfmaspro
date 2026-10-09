import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // Production mein Sentry ya LogRocket se connect kar sakte ho
    console.error('Tool Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-2">
            {this.props.toolName
              ? `The "${this.props.toolName}" tool encountered an error.`
              : 'This tool encountered an error.'}
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Your files are safe — they never leave your browser.
          </p>
          {this.state.error && (
            <details className="text-left bg-gray-900 rounded-xl p-4 mb-6 text-xs text-gray-500 max-w-lg mx-auto">
              <summary className="cursor-pointer text-gray-400 mb-2">Error details (for reporting)</summary>
              <pre className="overflow-auto whitespace-pre-wrap">{this.state.error.toString()}</pre>
            </details>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="btn-primary">
              🔄 Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-secondary">
              🏠 Back to Home
            </button>
            <a
              href="/contact"
              className="btn-secondary text-sm">
              🐛 Report Bug
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Tool-specific wrapper — har tool ke aas paas lagao
export function ToolErrorBoundary({ toolName, children }) {
  return (
    <ErrorBoundary toolName={toolName}>
      {children}
    </ErrorBoundary>
  )
}

// App-level wrapper — poori app ke liye
export function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
