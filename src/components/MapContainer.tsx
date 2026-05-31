"use client";

import dynamic from "next/dynamic";
import React, { Component, ErrorInfo, ReactNode } from "react";

// Dynamic import of our Leaflet Map component, disabling Server-Side Rendering
const DynamicMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] md:h-[480px] rounded-2xl bg-[#161C2C] border border-white/5 flex flex-col items-center justify-center text-slate-400 font-sans gap-3">
      {/* Premium loader spinner */}
      <div className="h-8 w-8 rounded-full border-4 border-[#11d493]/20 border-t-[#11d493] animate-spin"></div>
      <p className="text-sm tracking-wider font-semibold">Configuring tracking system...</p>
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
        <div className="w-full h-[320px] md:h-[480px] rounded-2xl bg-[#161C2C] border border-red-500/20 flex flex-col items-center justify-center text-slate-400 font-sans gap-4 p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-xl font-bold">
            ⚠️
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-1">Geospatial Grid Offline</h4>
            <p className="text-xs text-slate-400 max-w-xs">The mapping service encountered an error loading tiles. This might be due to temporary network issues.</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-[#11d493] text-[#0B0F19] font-bold text-xs rounded-lg shadow-lg hover:shadow-[#11d493]/20 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Re-Initialize Map
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface Report {
  id: string;
  issue_type: string;
  severity: "Critical" | "Medium" | "Low";
  description: string;
  department: string;
  locationText: string;
  lat: number;
  lng: number;
  timestamp: string;
  estimated_resolution_time?: string;
}

interface MapContainerProps {
  reports: Report[];
  selectedReportId?: string | null;
  onSelectReport?: (id: string) => void;
}

export default function MapContainer(props: MapContainerProps) {
  return (
    <MapErrorBoundary>
      <DynamicMap {...props} />
    </MapErrorBoundary>
  );
}
