"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ lat, lng, onLocationChange }: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Helper to create a custom draggable marker icon
  const createPickerIcon = () => {
    const color = "#11d493";
    const size = 30;
    const innerSize = 14;

    return L.divIcon({
      html: `
        <div style="display: flex; justify-content: center; align-items: center; width: ${size}px; height: ${size}px; position: relative;">
          <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: ${color}; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="position: relative; width: ${innerSize}px; height: ${innerSize}px; border-radius: 9999px; background-color: ${color}; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      className: "custom-leaflet-picker-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      attributionControl: false,
      maxZoom: 19, // Limit maximum zoom
      bounceAtZoomLimits: false, // Prevent map rubber-banding on limit drag/pan
    }).setView([lat, lng], 13);

    // CartoDB Dark Matter tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Create and add draggable marker
    const marker = L.marker([lat, lng], {
      icon: createPickerIcon(),
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    // Drag end listener
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onLocationChange(position.lat, position.lng);
    });

    // Map click listener
    map.on("click", (e) => {
      const position = e.latlng;
      marker.setLatLng(position);
      onLocationChange(position.lat, position.lng);
      map.panTo(position);
    });

    // Handle container resize
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker and map view if lat/lng changes from parent (e.g. via Auto-GPS)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const currentPos = marker.getLatLng();
    // Only update if difference is noticeable to prevent jumpiness on fine drag
    if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
      const newPos = L.latLng(lat, lng);
      marker.setLatLng(newPos);
      map.setView(newPos, map.getZoom());
    }
  }, [lat, lng]);

  return (
    <div className="relative w-full h-[180px] rounded-xl overflow-hidden border border-white/10 bg-[#0B0F19] z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 z-[1000] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-slate-400 pointer-events-none">
        Click map or drag pin to adjust location
      </div>
    </div>
  );
}
