import React from "react";
import { motion } from "motion/react";
import { Sliders, Award } from "lucide-react";
import { calculateOptimizedTwin as calcTwin } from "../utils/carbonCalculations";

interface CarbonTwinProps {
  dairyReductionPercent: number;
  setDairyReductionPercent: (val: number) => void;
  altAdoptionPercent: number;
  setAltAdoptionPercent: (val: number) => void;
  energyTransitionActive: boolean;
  setEnergyTransitionActive: (val: boolean) => void;
  triggerToast: (msg: string, type?: "success" | "info") => void;
}
const currentTwinProjections: Record<number, number> = {
  2026: 420,
  2027: 510,
  2028: 590
};

export const CarbonTwin = React.memo(function CarbonTwin({
  dairyReductionPercent,
  setDairyReductionPercent,
  altAdoptionPercent,
  setAltAdoptionPercent,
  energyTransitionActive,
  setEnergyTransitionActive,
  triggerToast,
}: CarbonTwinProps) {
  const optimizedTwinProjections = React.useMemo(() => {
    return {
      2026: calcTwin(2026, currentTwinProjections, dairyReductionPercent, altAdoptionPercent, energyTransitionActive),
      2027: calcTwin(2027, currentTwinProjections, dairyReductionPercent, altAdoptionPercent, energyTransitionActive),
      2028: calcTwin(2028, currentTwinProjections, dairyReductionPercent, altAdoptionPercent, energyTransitionActive)
    };
  }, [dairyReductionPercent, altAdoptionPercent, energyTransitionActive]);

  const twinDifference2028 = currentTwinProjections[2028] - optimizedTwinProjections[2028];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
      id="carbon-twin-ai-panel"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#131620] border border-zinc-800 mb-2">
            <span className="text-[#10b981] text-[9px] font-mono tracking-widest uppercase font-black animate-pulse">Dynamic Avatar Simulation</span>
          </div>
          <h2 className="text-2xl font-sans font-black tracking-tight text-white uppercase">Digital Carbon Twin AI</h2>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans leading-relaxed">
            Your digital twin models future micro-regional emission coefficients. Adjust dietary and energy weight triggers below to simulate real-time contraction paths.
          </p>
        </div>
        
        <div className="bg-[#11131a] px-4 py-2 border border-[#1e2230] rounded-lg flex items-center gap-4 text-center shrink-0">
          <div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase block">2028 Avoided Trajectory</span>
            <span className="text-lg font-mono font-black text-emerald-400">-{twinDifference2028}kg CO₂e</span>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div>
            <span className="text-[8px] font-mono text-zinc-500 uppercase block">Optimization Level</span>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-[2px] rounded font-bold block mt-0.5 uppercase leading-none">LEADER_NODE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-[#11131a] p-5 rounded-xl border border-[#1e2230] flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[#3b82f6] mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Model Levers & Weights
            </h3>
            
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="dairy-slider" className="font-semibold text-zinc-300">Dairy Contraction Constant</label>
                <span className="font-mono font-bold text-emerald-400">{dairyReductionPercent}%</span>
              </div>
              <input 
                id="dairy-slider"
                aria-label="Dairy Contraction Constant"
                type="range" 
                min="0" 
                max="100" 
                value={dairyReductionPercent}
                onChange={(e) => setDairyReductionPercent(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-zinc-800 h-1 rounded cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 leading-normal block">
                Migrates dairy-fat indices (ghee, butter) to regional wooden-pressed plant fats.
              </span>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="alt-slider" className="font-semibold text-zinc-300">Sourced Grain Substitutions</label>
                <span className="font-mono font-bold text-emerald-400">{altAdoptionPercent}%</span>
              </div>
              <input 
                id="alt-slider"
                aria-label="Sourced Grain Substitutions"
                type="range" 
                min="0" 
                max="100" 
                value={altAdoptionPercent}
                onChange={(e) => setAltAdoptionPercent(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-zinc-800 h-1 rounded cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 leading-normal block">
                Replaces water-intensive aged grain weights (basmati) with regional dryland millets.
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0c0d12] border border-zinc-800 rounded-lg">
              <div className="min-w-0 pr-2">
                <span className="text-xs font-semibold text-zinc-100 block">Cooperative Solar Fuel Link</span>
                <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">Offset household electricity variables with local green cooperative power</span>
              </div>
              <button
                onClick={() => {
                  setEnergyTransitionActive(!energyTransitionActive);
                  triggerToast(energyTransitionActive ? "Solar offsets disengaged." : "Co-op Solar inputs engaged.", "info");
                }}
                className={`text-[10px] px-2.5 py-1.5 rounded font-mono font-black border transition-all shrink-0 ${
                  energyTransitionActive 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/35" 
                    : "bg-black text-zinc-500 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {energyTransitionActive ? "ENGAGED" : "OFFSETS"}
              </button>
            </div>
          </div>

          <div className="bg-[#0c0d12] border border-zinc-800 p-4 rounded-lg space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-400" />
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-emerald-400">Simulation Impact Equation</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your optimizations forecast a 2028 trajectory worth <strong className="text-white font-mono">{optimizedTwinProjections[2028]}kg CO₂e/year</strong>. This removes the equivalent of planting <strong className="text-emerald-400 font-mono">{Math.round(twinDifference2028 / 21)} cedar saplings</strong>.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed pt-1.5 border-t border-zinc-900">
              Additionally triggers an estimated <strong className="text-white font-mono">₹{Math.round(twinDifference2028 * 14)} in annual savings</strong> via seasonal, zero-mile supply-chains.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#11131a] p-5 rounded-xl border border-[#1e2230] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase text-zinc-400">TRAJECTORY CURVES TELEMETRY</h3>
              <span className="text-[10px] text-zinc-500 block">Modeled 2026-2028 baseline futures against user triggers</span>
            </div>
            
            <div className="flex gap-3 text-[9px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-400 rounded-sm" />
                <span className="text-zinc-500">Unmitigated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-sm animate-pulse" />
                <span className="text-white font-bold">Optimized Future</span>
              </div>
            </div>
          </div>

          <div className="w-full h-72 relative flex items-end pt-4">
            <svg className="w-full h-full text-zinc-800" viewBox="0 0 600 300" preserveAspectRatio="none">
              <line x1="50" y1="50" x2="550" y2="50" stroke="#1c1f2b" strokeWidth="1" strokeDasharray="4" />
              <line x1="50" y1="150" x2="550" y2="150" stroke="#1c1f2b" strokeWidth="1" strokeDasharray="4" />
              <line x1="50" y1="240" x2="550" y2="240" stroke="#1c1f2b" strokeWidth="1" />

              <text x="18" y="54" fill="#64748b" fontSize="10" fontFamily="monospace">600kg</text>
              <text x="18" y="154" fill="#64748b" fontSize="10" fontFamily="monospace">300kg</text>
              <text x="18" y="244" fill="#64748b" fontSize="10" fontFamily="monospace">100kg</text>

              <path 
                d="M 120 140 L 300 95 L 480 50" 
                fill="none" 
                stroke="#f87171" 
                strokeWidth="1.5" 
                strokeOpacity="0.6"
                strokeDasharray="4"
              />
              <circle cx="120" cy="140" r="3.5" fill="#f87171" />
              <circle cx="300" cy="95" r="3.5" fill="#f87171" />
              <circle cx="480" cy="50" r="3.5" fill="#f87171" />

              <path 
                d={`M 120 ${240 - (optimizedTwinProjections[2026] - 100) * 0.38} 
                    L 300 ${240 - (optimizedTwinProjections[2027] - 100) * 0.38} 
                    L 480 ${240 - (optimizedTwinProjections[2028] - 100) * 0.38}`} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3.5" 
                className="transition-all duration-300"
              />
              <circle cx="120" cy={240 - (optimizedTwinProjections[2026] - 100) * 0.38} r="5.5" fill="#10b981" />
              <circle cx="300" cy={240 - (optimizedTwinProjections[2027] - 100) * 0.38} r="5.5" fill="#10b981" />
              <circle cx="480" cy={240 - (optimizedTwinProjections[2028] - 100) * 0.38} r="5.5" fill="#10b981" />

              <text x="120" y={210 - (optimizedTwinProjections[2026] - 100) * 0.38} fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{optimizedTwinProjections[2026]}kg</text>
              <text x="300" y={210 - (optimizedTwinProjections[2027] - 100) * 0.38} fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{optimizedTwinProjections[2027]}kg</text>
              <text x="480" y={210 - (optimizedTwinProjections[2028] - 100) * 0.38} fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{optimizedTwinProjections[2028]}kg</text>

              <text x="120" y="158" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">420kg</text>
              <text x="300" y="113" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">510kg</text>
              <text x="480" y="68" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">590kg</text>

              <text x="120" y="265" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">YEAR 2026</text>
              <text x="300" y="265" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">YEAR 2027</text>
              <text x="480" y="265" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">YEAR 2028 (PROJ)</text>
            </svg>
          </div>

          <div className="border-t border-zinc-800/80 pt-4 mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#0b0c10] p-3 rounded-lg border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block mb-1">UNMITIGATED 2028 FORECAST</span>
              <strong className="text-zinc-200 text-sm">590 kg CO₂e</strong>
            </div>
            <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/25">
              <span className="text-[9px] text-emerald-400 block mb-1">OPTIMIZED 2028 FORECAST</span>
              <strong className="text-emerald-400 text-sm">{optimizedTwinProjections[2028]} kg CO₂e</strong>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
