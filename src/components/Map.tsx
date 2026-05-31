"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Search, Loader2, MapPin } from "lucide-react";

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

interface MapProps {
  reports: Report[];
  selectedReportId?: string | null;
  onSelectReport?: (id: string) => void;
}

export default function Map({ reports, selectedReportId, onSelectReport }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const hasFitBoundsRef = useRef(false);
  const reportsRef = useRef(reports);
  const lastSelectedReportIdRef = useRef<string | null>(null);

  // Sync reports ref so effects can access latest data without triggering re-render cycles
  useEffect(() => {
    reportsRef.current = reports;
  }, [reports]);

  // Helper to create custom SVG color-coded marker icons with a pulse animation
  const createCustomIcon = (severity: "Critical" | "Medium" | "Low", isSelected: boolean) => {
    const color = severity === "Critical" ? "#ef4444" : severity === "Medium" ? "#eab308" : "#11d493";
    const size = isSelected ? 34 : 26;
    const innerSize = isSelected ? 16 : 12;
    const border = isSelected ? "3px solid #ffffff" : "2px solid #ffffff";

    return L.divIcon({
      html: `
        <div style="display: flex; justify-content: center; align-items: center; width: ${size}px; height: ${size}px; position: relative;">
          <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: ${color}; opacity: 0.4; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="position: relative; width: ${innerSize}px; height: ${innerSize}px; border-radius: 9999px; background-color: ${color}; border: ${border}; box-shadow: 0 4px 6px rgba(0,0,0,0.4); transition: all 0.2s ease;"></div>
        </div>
      `,
      className: "custom-leaflet-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Initialize the Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on New Delhi as default view
    const map = L.map(mapContainerRef.current, {
      attributionControl: false, // Remove Map Attributions (Watermarks)
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true, // Explicitly enable dragging (Fix A)
      touchZoom: true, // Explicitly enable touch zoom (Fix A)
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      maxZoom: 19,
      bounceAtZoomLimits: false,
    }).setView([28.6139, 77.2090], 5);

    // Premium CartoDB Dark Matter tiles (Default)
    const darkMatter = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19, // Match map container max zoom
    });

    // High-resolution Satellite Imagery
    const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19, // Allow map to zoom to level 19
      maxNativeZoom: 18, // Stop requesting tiles at level 18 and visually stretch them for level 19 zoom
    });

    // Add default layer
    darkMatter.addTo(map);

    // Add Layer Control switcher
    const baseMaps = {
      "Dark Mode": darkMatter,
      "Satellite View": satellite,
    };
    L.control.layers(baseMaps, undefined, { position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    // Small delay to ensure container dimensions are loaded properly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when reports list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    if (reports.length === 0) return;

    // Add new markers
    reports.forEach((report) => {
      if (typeof report.lat !== "number" || typeof report.lng !== "number") return;

      const isSelected = report.id === selectedReportId;
      const markerIcon = createCustomIcon(report.severity, isSelected);

      const marker = L.marker([report.lat, report.lng], { icon: markerIcon })
        .addTo(map)
        .on("click", () => {
          if (onSelectReport) {
            onSelectReport(report.id);
          }
        });

      // Bind dynamic HTML popup content
      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; max-width: 220px; color: #f8fafc; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
            <span style="font-weight: 700; color: #11d493; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">
              ${report.issue_type}
            </span>
            <span style="font-size: 10px; font-weight: bold; border-radius: 4px; padding: 2px 6px; background-color: ${
              report.severity === "Critical" ? "rgba(239, 68, 68, 0.2)" : report.severity === "Medium" ? "rgba(234, 179, 8, 0.2)" : "rgba(17, 212, 147, 0.2)"
            }; color: ${
              report.severity === "Critical" ? "#ef4444" : report.severity === "Medium" ? "#eab308" : "#11d493"
            }; border: 1px solid ${
              report.severity === "Critical" ? "rgba(239, 68, 68, 0.4)" : report.severity === "Medium" ? "rgba(234, 179, 8, 0.4)" : "rgba(17, 212, 147, 0.4)"
            };">
              ${report.severity}
            </span>
          </div>
          <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px; color: #cbd5e1;">Dept: ${report.department}</div>
          <div style="font-size: 12px; margin-bottom: 6px; color: #94a3b8; font-style: italic;">"${report.description}"</div>
          ${report.estimated_resolution_time ? `
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; margin-bottom: 6px; color: #11d493; font-weight: bold;">
            ⏱️ ETA: ${report.estimated_resolution_time}
          </div>
          ` : ''}
          ${(report as any).official_draft ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="font-weight: bold; font-size: 10px; color: #11d493; margin-bottom: 4px; text-transform: uppercase;">AI-Drafted Grievance</div>
            <p style="font-style: italic; font-size: 10px; color: #cbd5e1; margin-bottom: 6px; line-height: 1.3;">"${(report as any).official_draft}"</p>
            <div style="display: flex; gap: 4px;">
              <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚨 Urgent Report for ${(report as any).twitter_handle || '@MoHUA_India'}: ${(report as any).official_draft} #SnapFix #CivicAction`)}" target="_blank" rel="noopener noreferrer" class="take-action-btn" style="flex: 1; text-align: center; background: rgba(11, 15, 25, 1); border: 1px solid rgba(30, 41, 59, 1); color: #94a3b8; font-size: 8px; font-weight: bold; padding: 4px; border-radius: 4px; text-decoration: none; text-transform: uppercase;">Tweet</a>
              <a href="mailto:?subject=Urgent Civic Issue: ${encodeURIComponent(report.issue_type)}&body=${encodeURIComponent((report as any).official_draft)}" class="take-action-btn" style="flex: 1; text-align: center; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 8px; font-weight: bold; padding: 4px; border-radius: 4px; text-decoration: none; text-transform: uppercase; backdrop-filter: blur(4px);">Email</a>
              <a href="sms:1905?body=${encodeURIComponent(`URGENT: ${report.severity} issue at ${report.lat.toFixed(4)},${report.lng.toFixed(4)}. Required immediate action. - Reported via SnapFix.`)}" class="take-action-btn" style="flex: 1; text-align: center; background: transparent; border: 1px solid rgba(17, 212, 147, 0.5); color: #11d493; font-size: 8px; font-weight: bold; padding: 4px; border-radius: 4px; text-decoration: none; text-transform: uppercase;">SMS</a>
            </div>
          </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("popupopen", (e) => {
        const popupNode = e.popup.getElement();
        if (popupNode) {
          const btns = popupNode.querySelectorAll(".take-action-btn");
          btns.forEach(btn => {
            btn.addEventListener("click", () => {
              window.dispatchEvent(new Event("triggerGamification"));
            });
          });
        }
      });
      markersRef.current[report.id] = marker;
    });

    // Auto fit bounds only once on initial load to prevent resetting user zoom/pan state during background updates
    if (reports.length > 0 && !hasFitBoundsRef.current) {
      const validPoints = reports
        .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
        .map((r) => L.latLng(r.lat, r.lng));

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
        hasFitBoundsRef.current = true;
      }
    }
  }, [reports]);

  // Center Map ONLY when selectedReportId changes explicitly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedReportId) return;
    if (lastSelectedReportIdRef.current === selectedReportId) return;

    const selectedReport = reportsRef.current.find((r) => r.id === selectedReportId);
    if (!selectedReport || typeof selectedReport.lat !== "number" || typeof selectedReport.lng !== "number") return;

    // Pan map to marker and open popup
    map.setView([selectedReport.lat, selectedReport.lng], 13, {
      animate: true,
      duration: 0.8,
    });

    const marker = markersRef.current[selectedReportId];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    }

    lastSelectedReportIdRef.current = selectedReportId;
  }, [selectedReportId]);

  // Render Global Crisis Hotspots
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const GLOBAL_CRISIS_HOTSPOTS = [
      { name: "Delhi, India", issue: "Garbage & Air", lat: 28.6139, lng: 77.2090 },
      { name: "Mumbai, India", issue: "Waterlogging & Slums", lat: 19.0760, lng: 72.8777 },
      { name: "Dhaka, Bangladesh", issue: "Sewage", lat: 23.8103, lng: 90.4125 },
      { name: "Karachi, Pakistan", issue: "Power Outages", lat: 24.8607, lng: 67.0011 },
      { name: "Lagos, Nigeria", issue: "Infrastructural Deficit", lat: 6.5244, lng: 3.3792 },
      { name: "Addis Ababa, Ethiopia", issue: "Water Distribution", lat: 9.0320, lng: 38.7480 },
      { name: "Port-au-Prince, Haiti", issue: "Sanitation", lat: 18.5392, lng: -72.3364 },
      { name: "Baghdad, Iraq", issue: "Broken Pipes", lat: 33.3152, lng: 44.3661 }
    ];

    GLOBAL_CRISIS_HOTSPOTS.forEach((hotspot) => {
      const glowingIcon = L.divIcon({
        html: `
          <div style="display: flex; justify-content: center; align-items: center; width: 40px; height: 40px; position: relative;">
            <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #ef4444; opacity: 0.5; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 10px 2px rgba(239, 68, 68, 0.8);"></div>
          </div>
        `,
        className: "custom-glowing-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([hotspot.lat, hotspot.lng], { icon: glowingIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; max-width: 200px; color: #f8fafc; line-height: 1.4;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
            <span style="font-size: 14px;">⚠️</span>
            <span style="font-weight: 800; color: #ef4444; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">High Vulnerability Zone</span>
          </div>
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #ffffff;">${hotspot.name}</div>
          <div style="font-size: 12px; color: #cbd5e1; font-style: italic;">Crisis: <span style="color: #fb923c; font-weight: 600;">${hotspot.issue}</span></div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, []);

  return (
    <div className="relative w-full h-[320px] md:h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#0B0F19] z-10 pointer-events-auto">
      {/* Floating Premium Location Search Bar */}
      <div className="pointer-events-auto z-20">
        <SmartSearch mapInstanceRef={mapInstanceRef} />
      </div>
      
      <div ref={mapContainerRef} className="w-full h-full pointer-events-auto" />
    </div>
  );
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

function SmartSearch({ mapInstanceRef }: { mapInstanceRef: React.RefObject<L.Map | null> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search trigger
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Nominatim search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (latStr: string, lonStr: string, displayName: string) => {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([lat, lon], 14, {
        animate: true,
        duration: 1.5,
      });
    }
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="absolute top-4 left-4 z-[1000] w-80 font-sans">
      <div className="relative flex items-center bg-[#161C2C]/90 backdrop-blur-md text-white rounded-xl border border-white/10 shadow-2xl transition-all duration-300 focus-within:border-[#11d493]/50 focus-within:shadow-[#11d493]/5">
        <div className="absolute left-3.5 text-slate-400">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#11d493]" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location (e.g. New Delhi)..."
          className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none rounded-xl"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3.5 text-slate-400 hover:text-white text-xs font-bold transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-[#161C2C]/95 backdrop-blur-md border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-[1001] custom-scrollbar">
          {results.map((res) => (
            <div
              key={res.place_id}
              onClick={() => handleSelectLocation(res.lat, res.lon, res.display_name)}
              className="px-4 py-2.5 hover:bg-[#1f293d]/50 cursor-pointer transition-colors border-b border-white/5 last:border-0 flex gap-2.5 items-start"
            >
              <MapPin className="h-3.5 w-3.5 text-[#11d493] flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-300 leading-relaxed truncate font-medium">
                {res.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
