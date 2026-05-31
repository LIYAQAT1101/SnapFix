import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo representation for SnapFix */}
          <AlertCircle className="h-6 w-6 text-[#11d493]" />
          <span className="text-xl font-black tracking-wider text-white uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
            SNAP<span className="text-[#11d493]">FIX</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="/" className="text-white hover:text-[#11d493] transition-colors">Live Dashboard</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center rounded-full bg-[#11d493]/10 border border-[#11d493]/20 px-3 py-1 text-xs font-bold text-[#11d493]">
            <span className="flex h-2 w-2 rounded-full bg-[#11d493] mr-2 animate-pulse"></span>
            ACTIVE NETWORK
          </div>
        </div>
      </div>
    </nav>
  );
}
