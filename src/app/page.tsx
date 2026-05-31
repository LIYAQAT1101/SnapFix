"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import DOMPurify from "dompurify";
import { 
  Camera, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ShieldAlert, 
  Clock, 
  Building,
  Image as ImageIcon,
  Compass,
  RefreshCw,
  Send,
  Mic,
  MicOff,
  Globe
} from "lucide-react";
import MapContainer from "@/components/MapContainer";
import LocationPickerMapContainer from "@/components/LocationPickerMapContainer";
import TakeActionButtons from "@/components/TakeActionButtons";

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
  imageBase64?: string;
  estimated_resolution_time?: string;
  official_draft?: string;
  twitter_handle?: string;
}

const LANGUAGES = [
  { code: "en-IN", name: "English (India)" },
  { code: "hi-IN", name: "Hindi (हिंदी)" },
  { code: "ur-IN", name: "Urdu / Hinglish (اردو)" }
];

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  // Gamification & Success Sharing states
  const [civicPoints, setCivicPoints] = useState<number>(500);
  const [lastReport, setLastReport] = useState<Report | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPoints = localStorage.getItem("civicHeroPoints");
      if (savedPoints) {
        setCivicPoints(parseInt(savedPoints, 10));
      } else {
        localStorage.setItem("civicHeroPoints", "500");
      }
      
      const handlePointsUpdate = () => {
        const p = localStorage.getItem("civicHeroPoints");
        if (p) setCivicPoints(parseInt(p, 10));
      };
      
      const handleGamification = () => {
        handleTakeAction({ stopPropagation: () => {} } as any);
      };

      window.addEventListener("civicPointsUpdated", handlePointsUpdate);
      window.addEventListener("triggerGamification", handleGamification);
      
      return () => {
        window.removeEventListener("civicPointsUpdated", handlePointsUpdate);
        window.removeEventListener("triggerGamification", handleGamification);
      };
    }
  }, []);

  const handleTakeAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Reward points
    setCivicPoints(prev => {
      const newPoints = prev + 50;
      if (typeof window !== "undefined") {
        localStorage.setItem("civicHeroPoints", newPoints.toString());
        window.dispatchEvent(new Event("civicPointsUpdated"));
      }
      return newPoints;
    });

    // Trigger Confetti using GSAP
    const numConfetti = 40;
    const colors = ["#11d493", "#3b82f6", "#a855f7", "#ec4899", "#facc15"];
    
    for (let i = 0; i < numConfetti; i++) {
      const confetti = document.createElement("div");
      confetti.className = "fixed w-2 h-2 rounded-sm z-[10000] pointer-events-none";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.max(10, Math.random() * 90)}vw`;
      confetti.style.top = `-20px`;
      document.body.appendChild(confetti);

      gsap.to(confetti, {
        y: window.innerHeight + 50,
        x: `+=${Math.random() * 400 - 200}`,
        rotation: Math.random() * 720 - 360,
        duration: Math.random() * 2 + 1.5,
        ease: "power1.out",
        onComplete: () => confetti.remove()
      });
    }
  };
  
  // Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressedBase64, setCompressedBase64] = useState<string | null>(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [lat, setLat] = useState<number>(28.6139); // Default: New Delhi Lat
  const [lng, setLng] = useState<number>(77.2090); // Default: New Delhi Lng
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");

  // UI Loading/Status States
  const [gpsStatus, setGpsStatus] = useState<"idle" | "capturing" | "success" | "denied">("idle");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Refs for animations
  const formRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const rejectionRef = useRef<HTMLDivElement>(null);

  // Speech Recognition API Handler
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Append transcription to existing description text
      setDescriptionText((prev) => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.start();
  };

  // Client-Side Image Compression using HTML5 Canvas
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Set immediate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-trigger GPS request when image is selected so coordinates are ready
    captureGpsCoordinates();

    // Compress the image
    setAnalysisStep("Compressing image...");
    try {
      const compressed = await compressImageFile(file);
      setCompressedBase64(compressed);
    } catch (err) {
      console.error("Compression failed, using fallback:", err);
      // Fallback: use raw reader result as base64
      const fallbackReader = new FileReader();
      fallbackReader.onloadend = () => {
        setCompressedBase64(fallbackReader.result as string);
      };
      fallbackReader.readAsDataURL(file);
    }
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Target maximum dimensions for fast transmission (max 5MB budget)
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Output JPEG at 0.7 quality (very lightweight)
          const compressedData = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedData);
        };
        img.onerror = () => resolve(e.target?.result as string);
      };
      reader.onerror = () => resolve("");
    });
  };

  // Capture device coordinates using HTML5 Geolocation API
  const captureGpsCoordinates = () => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }

    setGpsStatus("capturing");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGpsStatus("success");
      },
      (error) => {
        console.warn("GPS Permission denied or unavailable:", error);
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  // Fetch all reports from Express backend
  const fetchReports = async () => {
    setIsPolling(true);
    try {
      const res = await fetch("http://localhost:3001/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to connect to backend api:", err);
    } finally {
      setIsPolling(false);
    }
  };

  // Form Submit Handler
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressedBase64) return;

    setSubmitError(null);
    setIsAnalyzing(true);
    setAnalysisStep("Transmitting report package...");

    // GSAP Loader transition
    gsap.fromTo(
      loaderRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );

    // AI routing steps visual feedback
    setTimeout(() => setAnalysisStep("Gemini AI analyzing image and description..."), 1200);
    setTimeout(() => setAnalysisStep("Translating multilingual inputs..."), 2400);
    setTimeout(() => setAnalysisStep("Routing report to municipal authorities..."), 3600);

    try {
      // Secure Input Sanitization on Frontend
      const sanitizedLocation = DOMPurify.sanitize(locationText);
      const sanitizedDescription = DOMPurify.sanitize(descriptionText);

      const payload = {
        imageBase64: compressedBase64,
        locationText: sanitizedLocation,
        descriptionText: sanitizedDescription,
        lat: lat,
        lng: lng
      };

      const res = await fetch("http://localhost:3001/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newReport = await res.json();
        setLastReport(newReport); // Save last report details
        
        // Immediate sync of data
        setReports(prev => [newReport, ...prev]);
        setSelectedReportId(newReport.id);
        
        // Reset form
        setImageFile(null);
        setImagePreview(null);
        setCompressedBase64(null);
        setDescriptionText("");
        setLocationText("");
        
        // Trigger GSAP success transition
        setIsAnalyzing(false);
        setSubmitSuccess(true);
        
        // Increment Civic Karma Points
        setCivicPoints((prev) => {
          const nextPoints = prev + 100;
          if (typeof window !== "undefined") {
            localStorage.setItem("civicHeroPoints", nextPoints.toString());
          }
          return nextPoints;
        });

        // Trigger GSAP Celebratory Badge Animation
        gsap.fromTo(
          "#civic-points-badge",
          { scale: 1, rotation: 0, backgroundColor: "#161C2C" },
          {
            scale: 1.25,
            rotation: 8,
            backgroundColor: "#11d493",
            color: "#0B0F19",
            duration: 0.35,
            yoyo: true,
            repeat: 1,
            ease: "back.out(2)"
          }
        );

        setTimeout(() => {
          gsap.fromTo(
            successRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
          );
        }, 50);
      } else {
        const errorData = await res.json();
        if (errorData && errorData.is_valid_civic_issue === false) {
          setRejectionReason(errorData.rejection_reason);
          setShowRejectionModal(true);
          setIsAnalyzing(false);
          gsap.to(loaderRef.current, { opacity: 0, scale: 0.9, duration: 0.2 });
          
          setTimeout(() => {
            gsap.fromTo(
              rejectionRef.current,
              { scale: 0.8, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
          }, 50);
          return;
        }
        throw new Error(errorData.error || "API responded with an error");
      }
    } catch (err: any) {
      console.error("Failed to upload report:", err);
      setIsAnalyzing(false);
      gsap.to(loaderRef.current, { opacity: 0, scale: 0.9, duration: 0.2 });
      
      if (err.message && (err.message.includes("selfie") || err.message.includes("computer graphic") || err.message.includes("non-civic"))) {
        setRejectionReason(err.message);
        setShowRejectionModal(true);
        setTimeout(() => {
          gsap.fromTo(
            rejectionRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
          );
        }, 50);
      } else {
        setSubmitError(`Network Error: ${err.message || "Cannot connect to server. Ensure backend is running."}`);
      }
    }
  };

  // Setup live polling loop (refetches every 6 seconds)
  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 6000);
    return () => clearInterval(interval);
  }, []);

  // Reset validation error state when input changes
  useEffect(() => {
    setSubmitError(null);
  }, [imageFile, descriptionText, locationText]);

  // Entrance animations using GSAP on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-header", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.15
      });
      gsap.from(formRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out"
      });
      gsap.from(dashboardRef.current, {
        x: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out"
      });
    });

    return () => ctx.revert();
  }, []);

  // Calculate statistics
  const totalReports = reports.length;
  const criticalCount = reports.filter(r => r.severity === "Critical").length;
  const mediumCount = reports.filter(r => r.severity === "Medium").length;
  const lowCount = reports.filter(r => r.severity === "Low").length;

  return (
    <div className="flex-1 flex flex-col justify-start relative select-none">
      
      {/* Dynamic Background Mesh Effect */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#11d493]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Hero Header Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11d493]/10 border border-[#11d493]/20 text-[#11d493] text-xs font-semibold mb-3 animate-header">
            <Activity className="h-3 w-3 animate-pulse" />
            Citizen Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none animate-header">
            SnapFix: <span className="text-[#11d493]">Citizen Reporting Hub</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl animate-header">
            Report local civic issues instantly. Take a photo, describe it in your preferred language (English, Hindi, or Urdu), and our AI will route it directly to the appropriate department.
          </p>
        </div>

        {/* Real-time stats pills */}
        <div className="flex items-center gap-3 self-start md:self-center animate-header">
          {/* Civic Karma Points Badge */}
          <div 
            id="civic-points-badge"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161C2C] border border-white/5 text-[#11d493] font-bold text-sm shadow-md transition-colors"
          >
            <span role="img" aria-label="trophy" className="text-base">🏆</span>
            <span className="text-white font-black">{civicPoints}</span>
            <span className="text-slate-400 text-xs font-semibold">Hero Points</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161C2C] border border-white/5">
            <Clock className="h-4 w-4 text-[#11d493]" />
            <span className="text-xs text-slate-400 font-medium">Syncing: {isPolling ? "fetching" : "active"}</span>
          </div>
          <button 
            onClick={fetchReports}
            className="p-2 rounded-xl bg-[#161C2C] hover:bg-[#1f293d] border border-white/5 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Layout (Mobile-first stacked, Desktop Split) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
        
        {/* Left Side: Upload Form (Full Screen on Mobile, Side Panel on Desktop) */}
        <div 
          ref={formRef} 
          className="col-span-12 md:col-span-5 lg:col-span-4 flex flex-col min-h-[85vh] md:min-h-0 bg-[#161C2C]/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm"
        >
          
          {/* AI Analyzing Modal Overlay */}
          {isAnalyzing && (
            <div 
              ref={loaderRef}
              className="absolute inset-0 bg-[#0B0F19]/95 z-30 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="dot-loader mb-6">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analyzing Issue...</h3>
              <p className="text-xs text-[#11d493] font-mono tracking-wider bg-[#11d493]/10 px-3 py-1.5 rounded-lg border border-[#11d493]/20 max-w-[280px]">
                {analysisStep}
              </p>
              <div className="mt-8 text-[10px] text-slate-500 max-w-xs">
                Analyzing photo and description to determine category and severity, then routing to the correct department.
              </div>
            </div>
          )}

          {/* Submission Success Modal Overlay */}
          {submitSuccess && (
            <div 
              ref={successRef}
              className="absolute inset-0 bg-[#0B0F19]/95 z-30 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
            >
              <div className="w-12 h-12 rounded-full bg-[#11d493]/20 border border-[#11d493] flex items-center justify-center text-[#11d493] mb-4 flex-shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">Report Submitted!</h3>
              <p className="text-xs text-slate-400 max-w-[260px] mb-3">
                Your report has been processed and routed to local authorities.
              </p>

              {/* AI-generated Summary Card */}
              {lastReport && (
                <div className="bg-[#161C2C]/80 border border-white/5 rounded-2xl p-4 mb-4 w-full max-w-[300px] text-left">
                  <div className="text-[9px] text-[#11d493] uppercase font-black tracking-wider mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse" />
                    AI Assessment Summary
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{lastReport.issue_type}</div>
                  <p className="text-[10px] text-slate-400 italic line-clamp-3 leading-relaxed mb-2">
                    "{lastReport.description}"
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Clock className="h-3 w-3 text-[#11d493]" />
                    <span className="font-semibold text-white">Estimated Resolution:</span>
                    <span className="text-[#11d493] font-bold">{lastReport.estimated_resolution_time || "Pending"}</span>
                  </div>
                </div>
              )}

              {/* Social Amplification Sharing CTAs */}
              <div className="flex flex-col gap-2 w-full max-w-[260px] mb-4">
                <a 
                  href={lastReport ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `I just reported a civic issue (${lastReport.issue_type}) at "${lastReport.locationText || 'our neighborhood'}" using SnapFix. Let's keep our city clean! 🚀`
                  )}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-[11px] bg-[#25D366] text-[#0B0F19] hover:bg-[#25D366]/90 flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
                >
                  Alert Community on WhatsApp
                </a>
                <a 
                  href={lastReport ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `I just reported a civic issue (${lastReport.issue_type}) at "${lastReport.locationText || 'our neighborhood'}" using SnapFix. Let's keep our city clean! 🚀`
                  )}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-[11px] bg-black text-white border border-white/10 hover:bg-zinc-900 flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
                >
                  Share on X (Twitter)
                </a>
              </div>

              {/* Manual Close Button */}
              <button 
                onClick={() => {
                  setSubmitSuccess(false);
                  setLastReport(null);
                }}
                className="px-6 py-2 rounded-xl bg-[#161C2C] hover:bg-[#1f293d] border border-white/5 text-[11px] text-white font-bold transition-all uppercase tracking-wider"
              >
                Done / Close
              </button>
            </div>
          )}

          {/* Rejection Modal Overlay */}
          {showRejectionModal && (
            <div 
              ref={rejectionRef}
              className="absolute inset-0 bg-[#0B0F19]/95 z-30 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-500 mb-4 flex-shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">⚠️ Invalid Image Detected</h3>
              <p className="text-xs text-slate-400 max-w-[260px] mb-4">
                Our vision engine performs strict checks on uploaded content.
              </p>

              {/* Rejection Details Box */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-5 w-full max-w-[300px] text-left">
                <div className="text-[9px] text-red-400 uppercase font-black tracking-wider mb-1 flex items-center gap-1">
                  <Activity className="h-3 w-3 animate-pulse" />
                  AI Rejection Analysis
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed mb-1">
                  {rejectionReason || "No detailed reason was returned by the inspector."}
                </p>
                <p className="text-[9px] text-slate-500 font-semibold mt-2">
                  Please take a clear, real-world photo of the issue to proceed.
                </p>
              </div>

              {/* Try Another Image CTA */}
              <button 
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
                className="w-full max-w-[260px] py-2.5 px-4 rounded-xl font-bold text-[11px] bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 transition-colors uppercase tracking-wider shadow-lg animate-pulse"
              >
                Try Another Image
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col h-full">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#11d493]" />
                Report an Issue
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload a photo of the problem and describe it using voice or text.
              </p>
            </div>

            <form onSubmit={handleSubmitReport} className="flex-1 flex flex-col gap-4 justify-between">
              
              {/* Image Upload Area */}
              <div className="relative group min-h-[160px] border-2 border-dashed border-white/10 hover:border-[#11d493]/50 rounded-2xl bg-[#0B0F19]/60 flex flex-col items-center justify-center p-3 transition-all duration-300">
                {imagePreview ? (
                  <div className="absolute inset-2 rounded-xl overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imagePreview} 
                      alt="Civic Issue Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0b0f19]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <label className="cursor-pointer bg-[#11d493] hover:bg-[#11d493]/90 text-[#0B0F19] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                        <Upload className="h-4 w-4" /> Replace Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center text-center gap-2.5 p-3 w-full h-full justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#161C2C] flex items-center justify-center border border-white/5 text-[#11d493] group-hover:scale-110 transition-transform">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Tap to Snap or Upload Photo</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Supports direct camera capture</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      required
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Hybrid Voice & Text Description Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="descriptionText" className="text-xs font-semibold text-slate-400">
                    Describe the Issue
                  </label>
                  
                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-[#161C2C] border border-white/5 rounded-lg px-2 py-1 text-[10px]">
                    <Globe className="h-3 w-3 text-slate-400" />
                    <select 
                      value={selectedLanguage} 
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-transparent text-slate-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-[#161C2C] text-white">
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <textarea 
                    id="descriptionText"
                    rows={3}
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Describe what's wrong (e.g. 'foul smell from leak' or tap the mic to speak in Hindi/Urdu)..." 
                    className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#11d493] transition-colors resize-none pr-12"
                  />
                  
                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={startSpeechRecognition}
                    className={`absolute right-3 top-3 p-2 rounded-lg border transition-all duration-300 ${
                      isListening 
                        ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                        : "bg-[#161C2C] border-white/5 text-[#11d493] hover:bg-[#1f293d]"
                    }`}
                    title="Tap to speak"
                  >
                    {isListening ? <Mic className="h-4 w-4 animate-bounce" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>
                {isListening && (
                  <p className="text-[9px] text-red-400 font-semibold animate-pulse">Listening... Speak now.</p>
                )}
              </div>

              {/* Location Tagging Section */}
              <div className="space-y-3">
                
                {/* GPS Status Indicator */}
                <div className="bg-[#0B0F19]/60 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className={`h-4 w-4 ${
                      gpsStatus === "success" 
                        ? "text-[#11d493]" 
                        : gpsStatus === "capturing" 
                        ? "text-yellow-400 animate-pulse" 
                        : gpsStatus === "denied" 
                        ? "text-red-400" 
                        : "text-slate-500"
                    }`} />
                    <div>
                      <p className="font-bold text-slate-300">
                        {gpsStatus === "success" 
                          ? "GPS Coordinates Locked" 
                          : gpsStatus === "capturing" 
                          ? "Locking Location..." 
                          : gpsStatus === "denied" 
                          ? "GPS Denied" 
                          : "Location Tag"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {lat.toFixed(4)}°, {lng.toFixed(4)}°
                      </p>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={captureGpsCoordinates}
                    className="px-2.5 py-1.5 rounded-lg bg-[#161C2C] hover:bg-[#1f293d] border border-white/5 text-[10px] text-[#11d493] font-semibold transition-colors"
                  >
                    Locate Me
                  </button>
                </div>

                {/* Drop a Pin Interactive Picker Map */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">Fine-tune Pin Location</span>
                  <LocationPickerMapContainer 
                    lat={lat} 
                    lng={lng} 
                    onLocationChange={(newLat, newLng) => {
                      setLat(newLat);
                      setLng(newLng);
                    }}
                  />
                </div>

                {/* Location Note Text Input */}
                <div className="space-y-1">
                  <label htmlFor="locationText" className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span>Street Address / Landmark</span>
                    <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                  </label>
                  <input 
                    id="locationText"
                    type="text" 
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="e.g. Behind Sector 4 Market, near water tank" 
                    className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#11d493] transition-colors"
                  />
                </div>
              </div>

              {/* Error Toast */}
              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex flex-col gap-1 transition-all duration-300">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                    <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                    Error
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px] mt-1">
                    {submitError}
                  </p>
                </div>
              )}

              {/* Submit Action */}
              <button 
                type="submit" 
                disabled={!compressedBase64}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 tracking-wider uppercase transition-all duration-300 shadow-lg ${
                  compressedBase64 
                    ? "bg-[#11d493] text-[#0B0F19] hover:bg-[#11d493]/90 active:scale-[0.98]" 
                    : "bg-[#161C2C] text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                <Send className="h-4 w-4" />
                Submit Report
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Map & Dashboard Analytics (Stacked Below Form on Mobile, Main Screen Desktop) */}
        <div ref={dashboardRef} className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col gap-6">
          
          {/* Key Stats Counter Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#161C2C]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Reports</span>
              <span className="text-2xl md:text-3xl font-black text-white mt-2">{totalReports}</span>
              <span className="text-[9px] text-[#11d493] font-medium mt-1">📍 Active Issues</span>
            </div>
            
            <div className="bg-[#161C2C]/30 border border-[#ef4444]/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-red-500/10 rounded-full blur-lg"></div>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Critical
              </span>
              <span className="text-2xl md:text-3xl font-black text-red-500 mt-2">{criticalCount}</span>
              <span className="text-[9px] text-red-400/80 font-medium mt-1">🚨 Immediate Dispatch</span>
            </div>

            <div className="bg-[#161C2C]/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Normal</span>
              <span className="text-2xl md:text-3xl font-black text-slate-300 mt-2">{mediumCount + lowCount}</span>
              <span className="text-[9px] text-[#eab308] font-medium mt-1">🔧 Queued Reports</span>
            </div>
          </div>

          {/* Interactive Leaflet Map Grid */}
          <div className="bg-[#161C2C]/30 border border-white/5 rounded-3xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#11d493]" />
                Geospatial Reporting Grid
              </h3>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Critical</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#11d493]"></span> Low</span>
              </div>
            </div>
            
            {/* Dynamic Map Loader */}
            <MapContainer 
              reports={reports} 
              selectedReportId={selectedReportId}
              onSelectReport={(id) => setSelectedReportId(id)}
            />
          </div>

          {/* Recent Incident Feed */}
          <div className="bg-[#161C2C]/30 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#11d493]" />
              Recent Reports
            </h3>
            
            <div className="max-h-[360px] overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No issues reported yet. Submit a report to populate the grid.
                </div>
              ) : (
                reports.map((report) => {
                  const isSelected = report.id === selectedReportId;
                  const date = new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col ${
                        isSelected 
                          ? "bg-[#161C2C] border-[#11d493]/60 shadow-lg shadow-[#11d493]/5" 
                          : "bg-[#0b0f19]/40 border-white/5 hover:border-white/10 hover:bg-[#161C2C]/20"
                      }`}
                    >
                      <div className="flex gap-4 items-start w-full">
                        {/* Left: Mini Preview or Icon */}
                        <div className="w-14 h-14 rounded-xl bg-[#161C2C] border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-500 relative">
                          {report.imageBase64 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={report.imageBase64} 
                              alt={report.issue_type} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-slate-600" />
                          )}
                        </div>

                        {/* Right: Text Information */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                              {report.issue_type}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                report.severity === "Critical" 
                                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                  : report.severity === "Medium" 
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
                                  : "bg-[#11d493]/10 text-[#11d493] border-[#11d493]/20"
                              }`}>
                                {report.severity}
                              </span>
                              {report.estimated_resolution_time && (
                                <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1 text-slate-300">
                                  <Clock className="h-2.5 w-2.5 text-[#11d493]" />
                                  {report.estimated_resolution_time}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic mb-2">
                            "{report.description}"
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 text-slate-400 font-semibold">
                              <Building className="h-3 w-3 text-slate-500" />
                              {report.department}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="truncate max-w-[150px] sm:max-w-xs">
                              📍 {report.locationText}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[#11d493] font-mono">
                              {date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Take Action Gamification Expansion */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-white/5 w-full">
                          {report.official_draft ? (
                            <>
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#11d493] mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3" />
                                AI-Drafted Official Grievance
                              </h5>
                              <div className="bg-[#0B0F19] border border-white/5 p-3 rounded-xl relative group">
                                <p className="text-[11px] text-slate-300 font-serif leading-relaxed italic pr-6">
                                  "{report.official_draft}"
                                </p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(report.official_draft || "");
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-md bg-[#161C2C] hover:bg-[#1f293d] border border-white/5 text-slate-400 hover:text-[#11d493] transition-colors" 
                                  title="Copy to Clipboard"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="text-[10px] text-slate-500 italic mb-2">No official AI draft available. Default template will be used for actions.</p>
                          )}
                          
                          <TakeActionButtons report={report as any} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
