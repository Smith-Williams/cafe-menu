import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private handleReload = () => {
    this.setState({ error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary" role="alert">
          <p className="error-boundary__title">حدث خطأ غير متوقع</p>
          <p className="error-boundary__desc">
            نعتذر عن الإزعاج، حاول تحديث الصفحة أو العودة للقائمة الرئيسية.
          </p>
          <button type="button" className="btn btn-primary" onClick={this.handleReload}>
            العودة للرئيسية
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
