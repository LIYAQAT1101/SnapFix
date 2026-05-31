import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0B0F19] py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#11d493]" />
            <span className="text-lg font-black tracking-wider text-white uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
              SNAP<span className="text-[#11d493]">FIX</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            Powered by Gemini 1.5 Flash Vision API.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="text-[#11d493] font-semibold">Status: Online</span>
            <span>|</span>
            <p>© {new Date().getFullYear()} SnapFix. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
