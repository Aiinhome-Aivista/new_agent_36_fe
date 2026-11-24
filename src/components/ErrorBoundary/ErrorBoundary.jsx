import React from 'react';
import { ShieldAlert, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Unhandled React Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-bg-base text-text-primary">
          <div className="max-w-lg w-full bg-bg-card border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold font-display tracking-tight mb-2">
              Workspace Encountered an Error
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
              An unexpected client-side error occurred in this view. You can reload the workspace or return to the main dashboard.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-4">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-md transition-colors duration-150"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Workspace
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-panel hover:bg-bg-hover text-text-primary text-xs font-semibold transition-colors duration-150"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </button>
            </div>

            {this.state.error && (
              <div className="w-full text-left mt-2">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors py-1"
                >
                  {this.state.showDetails ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> Hide technical details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" /> Show technical details
                    </>
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 rounded-lg bg-bg-input border border-border-subtle font-mono text-[11px] text-red-400 overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                    <p className="font-semibold mb-1 text-red-500">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
