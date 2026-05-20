"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  {this.state.error?.message ||
                    "An unexpected error occurred. Please try again."}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.reload();
                  }}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
