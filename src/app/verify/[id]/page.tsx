import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, MapPin, ShieldAlert, Award } from "lucide-react";

// In a real app, you would fetch the product data based on `params.id`
export default function VerifyPage() {
  const product = {
    id: "PASH-789-QZ",
    name: "Pure Pashmina Sozni Shawl",
    type: "Pashmina",
    authenticity: "Verified Authentic",
    dateVerified: "October 12, 2026",
    artisan: {
      name: "Tariq Ahmad",
      experience: "25 Years",
      location: "Srinagar, Kashmir",
      govtId: "Govt. Reg #KA-4592"
    },
    process: {
      timeInvested: "120 Hours",
      technique: "Handwoven, Sozni Embroidery",
      material: "100% Changthangi Pashmina"
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 md:py-12 px-0 md:px-6">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-0 md:rounded-[2.5rem] md:shadow-xl md:border md:border-black/5 overflow-hidden">
        
        {/* Header / Status Banner */}
        <div className="bg-[#2563EB] px-6 py-10 text-white text-center rounded-b-3xl md:rounded-t-[2.5rem] md:rounded-b-none relative">
          <div className="absolute top-4 left-4">
            <span className="text-lg font-black tracking-tighter text-white uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
              SnapFix
            </span>
          </div>
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{product.authenticity}</h1>
          <p className="text-white/80 text-sm">Scan ID: {product.id}</p>
        </div>

        <div className="p-6">
          {/* Product Info */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold tracking-tight text-black">{product.name}</h2>
            </div>
            <Badge className="bg-black/5 text-black hover:bg-black/10 border-none font-medium mb-4">{product.type}</Badge>
            <p className="text-sm text-black/50">Verified on {product.dateVerified}</p>
          </div>

          <Separator className="my-6 bg-black/5" />

          {/* Artisan Profile */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-4">Artisan Identity</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-[#2563EB]/20 overflow-hidden shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="Artisan" 
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold flex items-center gap-2">
                  {product.artisan.name}
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                </h4>
                <div className="flex items-center text-sm text-black/60 mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {product.artisan.location}
                </div>
                <div className="flex items-center text-xs font-medium text-[#2563EB] mt-2 bg-[#2563EB]/10 inline-flex px-2 py-0.5 rounded">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  {product.artisan.govtId}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-black/5" />

          {/* Process & Heritage */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-4">Handmade Process</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Time Invested</p>
                  <p className="text-sm text-black/60">{product.process.timeInvested}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Technique & Material</p>
                  <p className="text-sm text-black/60">{product.process.technique}</p>
                  <p className="text-sm text-black/60">{product.process.material}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer actions inside the card for mobile */}
        <div className="p-6 bg-gray-50 border-t border-black/5 md:rounded-b-[2.5rem]">
          <p className="text-xs text-center text-black/40 mb-4">
            Secured by SnapFix Blockchain
          </p>
          <button className="w-full py-3 rounded-full border border-black/10 text-sm font-medium hover:bg-black/5 transition-colors">
            Share Certificate
          </button>
        </div>

      </div>
    </div>
  );
}
