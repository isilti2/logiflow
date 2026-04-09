'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="w-full flex items-center justify-center rounded-2xl bg-gray-900" style={{ minHeight: '400px' }}>
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <span className="text-2xl">⚠️</span>
            <p className="text-gray-300 text-sm font-semibold">3D görünüm yüklenemedi</p>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs max-w-xs">
              WebGL desteği gereklidir. Tarayıcınızın grafik hızlandırmasını etkinleştirin veya farklı bir tarayıcı deneyin.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
