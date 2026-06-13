import React from "react";

interface Preset {
  id: string;
  name: string;
  label: string;
  color: string;
  desc: string;
}

interface ScannerPresetsProps {
  triggerSampleScan: (sampleId: string) => void;
}

const PRESETS: Preset[] = [
  { id: "bengaluru-cafe", name: "Bengaluru Café Receipt", label: "LATTE_STK", color: "bg-sky-950/40 text-[#3b82f6] border border-[#3b82f6]/20", desc: "500ml Milk curd, Paneer fat segments..." },
  { id: "mumbai-mart", name: "Mumbai Grocery Mart", label: "GHEE_LOAD", color: "bg-amber-950/40 text-amber-500 border border-amber-500/20", desc: "Aged Basmati, Cow ghee portions, Honey..." },
  { id: "pune-dairy", name: "Pune Household Dairy", label: "LACT_AVD", color: "bg-emerald-950/40 text-[#10b981] border border-emerald-500/20", desc: "Packet butter, Fermented yogurt..." }
];

export const ScannerPresets: React.FC<ScannerPresetsProps> = React.memo(({ triggerSampleScan }) => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-2.5">
      {PRESETS.map((p) => (
        <button 
          key={p.id}
          onClick={() => triggerSampleScan(p.id)}
          className="p-2.5 bg-[#0c0d12] border border-zinc-800 hover:border-emerald-500/40 rounded text-left flex flex-col hover:text-emerald-400 transition-all group font-mono"
          id={`demo-btn-${p.id.split('-')[0]}`}
        >
          <div className="flex justify-between items-center w-full mb-1">
            <span className="font-bold text-zinc-200 text-xs font-sans group-hover:text-emerald-400 transition-colors">{p.name}</span>
            <span className={`text-[8px] rounded px-1.5 py-[1px] ${p.color}`}>{p.label}</span>
          </div>
          <span className="text-[10px] text-zinc-500 truncate">{p.desc}</span>
        </button>
      ))}
    </div>
  );
});

ScannerPresets.displayName = "ScannerPresets";
