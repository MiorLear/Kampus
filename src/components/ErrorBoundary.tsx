import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert className="mt-4 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <details>
                    <summary className="cursor-pointer font-medium">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
