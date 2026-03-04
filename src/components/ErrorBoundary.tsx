'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#000', color: '#fff', padding: '2rem', fontFamily: 'monospace' }}>
          <h2>Scene failed to load</h2>
          <pre style={{ color: '#f87171', fontSize: '12px' }}>{this.state.error?.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
