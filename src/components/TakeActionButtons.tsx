"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { Mail, Phone, Check, Loader2 } from "lucide-react";

interface TakeActionButtonsProps {
  report: {
    id: string;
    issue_type: string;
    severity: string;
    official_draft?: string;
    twitter_handle?: string;
    lat: number;
    lng: number;
  };
  onActionComplete?: () => void;
}

type ActionType = "tweet" | "email" | "sms" | null;

export default function TakeActionButtons({ report, onActionComplete }: TakeActionButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [completedAction, setCompletedAction] = useState<ActionType>(null);

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>, type: ActionType, href: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeAction || completedAction) return;
    
    setActiveAction(type);
    const buttonElement = e.currentTarget;

    // Simulate "Processing" state for 600ms
    setTimeout(() => {
      setActiveAction(null);
      setCompletedAction(type);

      // Trigger GSAP +50 Civic Points animation floating UP from the button
      const floatingText = document.createElement("div");
      floatingText.innerText = "+50 Civic Points";
      floatingText.className = "absolute font-black text-xs text-[#11d493] pointer-events-none z-50 drop-shadow-md";
      
      // Calculate position relative to the button
      const rect = buttonElement.getBoundingClientRect();
      floatingText.style.left = `${rect.left + rect.width / 2}px`;
      floatingText.style.top = `${rect.top}px`;
      floatingText.style.transform = "translateX(-50%)";
      
      document.body.appendChild(floatingText);

      gsap.to(floatingText, {
        y: -60,
        opacity: 0,
        scale: 1.5,
        duration: 1.2,
        ease: "power2.out",
        onComplete: () => {
          floatingText.remove();
        }
      });

      // Trigger global civic points update
      if (typeof window !== "undefined") {
        const currentPoints = parseInt(localStorage.getItem("civicHeroPoints") || "500", 10);
        localStorage.setItem("civicHeroPoints", (currentPoints + 50).toString());
        window.dispatchEvent(new Event("civicPointsUpdated"));
        
        // Optional Confetti Gamification event
        window.dispatchEvent(new Event("triggerGamification"));
      }

      if (onActionComplete) onActionComplete();

      // Execute actual deep link href action after animation triggers
      setTimeout(() => {
        window.open(href, "_blank", "noopener,noreferrer");
        
        // Reset button state after a short delay
        setTimeout(() => setCompletedAction(null), 2000);
      }, 300);

    }, 600);
  };

  const draft = report.official_draft || "Urgent civic issue reported via SnapFix.";
  const handle = report.twitter_handle || "@MoHUA_India";
  
  // Tag the predicted handle in the tweet
  const tweetBody = `🚨 Urgent Report for ${handle}: ${draft} #SnapFix #CivicAction`;
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetBody)}`;
  
  const emailHref = `mailto:?subject=${encodeURIComponent(`Urgent Civic Issue: ${report.issue_type}`)}&body=${encodeURIComponent(draft)}`;
  
  // Shortened SMS body for fallback protocol
  const smsBody = `URGENT: ${report.severity} issue at ${report.lat.toFixed(4)},${report.lng.toFixed(4)}. Required immediate action. - Reported via SnapFix.`;
  const smsHref = `sms:1905?body=${encodeURIComponent(smsBody)}`;

  return (
    <div ref={containerRef} className="flex flex-col sm:flex-row items-center gap-3 mt-3 w-full">
      
      {/* Auto-Tweet Button (Dark X Tactical Style) */}
      <button
        onClick={(e) => handleActionClick(e, "tweet", tweetHref)}
        className={`relative flex-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm ${
          completedAction === "tweet" 
            ? "bg-[#11d493] border-[#11d493] text-[#0B0F19]" 
            : "bg-[#0B0F19] hover:bg-[#161C2C] border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        }`}
      >
        {activeAction === "tweet" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing</>
        ) : completedAction === "tweet" ? (
          <><Check className="h-4 w-4" /> Sent</>
        ) : (
          <><svg className="h-3 w-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/></svg> Auto-Tweet</>
        )}
      </button>

      {/* Email Dept Button (Sleek Glassmorphism Style) */}
      <button
        onClick={(e) => handleActionClick(e, "email", emailHref)}
        className={`relative flex-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 shadow-sm ${
          completedAction === "email" 
            ? "bg-[#11d493] border border-[#11d493] text-[#0B0F19]" 
            : "bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        }`}
      >
        {activeAction === "email" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing</>
        ) : completedAction === "email" ? (
          <><Check className="h-4 w-4" /> Sent</>
        ) : (
          <><Mail className="h-4 w-4" /> Email Dept</>
        )}
      </button>

      {/* SMS Alert Button (Neon Outline Style) */}
      <button
        onClick={(e) => handleActionClick(e, "sms", smsHref)}
        className={`relative flex-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm ${
          completedAction === "sms" 
            ? "bg-[#11d493] border-[#11d493] text-[#0B0F19]" 
            : "bg-transparent border-[#11d493]/50 text-[#11d493] hover:bg-[#11d493]/10 hover:shadow-[0_0_15px_rgba(17,212,147,0.3)] hover:border-[#11d493]"
        }`}
      >
        {activeAction === "sms" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing</>
        ) : completedAction === "sms" ? (
          <><Check className="h-4 w-4" /> Sent</>
        ) : (
          <><Phone className="h-4 w-4" /> SMS Alert</>
        )}
      </button>

    </div>
  );
}
