'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        )
      }

      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-red-600">Oops! Etwas ist schiefgelaufen</CardTitle>
            <CardDescription>
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {this.state.error && (
              <pre className="text-xs bg-gray-100 p-2 rounded mb-4 overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="w-full"
            >
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}