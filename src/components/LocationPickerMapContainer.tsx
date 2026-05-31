"use client";

import dynamic from "next/dynamic";
import React, { Component, ErrorInfo, ReactNode } from "react";

const DynamicPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[180px] rounded-xl bg-[#161C2C] border border-white/5 flex flex-col items-center justify-center text-slate-400 font-sans gap-2">
      <div className="h-6 w-6 rounded-full border-3 border-[#11d493]/20 border-t-[#11d493] animate-spin"></div>
      <p className="text-[10px] tracking-wider font-semibold">Configuring localizer...</p>
    </div>
  ),
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MapErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[180px] rounded-xl bg-[#161C2C] border border-red-500/20 flex flex-col items-center justify-center text-slate-400 font-sans gap-2 p-4 text-center">
          <div className="text-red-500 text-lg font-bold">⚠️</div>
          <p className="text-[10px] text-slate-400">Map loading failed. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

interface LocationPickerMapContainerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMapContainer(props: LocationPickerMapContainerProps) {
  return (
    <MapErrorBoundary>
      <DynamicPickerMap {...props} />
    </MapErrorBoundary>
  );
}
