import React from "react";
import { motion } from "motion/react";
import { Target, Flame, Award, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  co2Saving: number;
  monetarySaving: number;
  status: string;
  isCommit: boolean;
}

interface ActionCampaignsProps {
  weeklyMissions: Mission[];
  handleToggleMissionCommit: (id: string) => void;
  totalCarbonSaved: number;
  streakCount: number;
  userXP: number;
  setDairyReductionPercent: (val: number) => void;
  triggerToast: (msg: string, type?: "success" | "info") => void;
  setActiveTab: (tab: "workspace" | "twin" | "coach" | "network" | "actions") => void;
}

export const ActionCampaigns = React.memo(function ActionCampaigns({
  weeklyMissions,
  handleToggleMissionCommit,
  totalCarbonSaved,
  streakCount,
  userXP,
  setDairyReductionPercent,
  triggerToast,
  setActiveTab,
}: ActionCampaignsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
      id="ai-action-engine-panel"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans flex items-center gap-2">
            AI Campaign Action Engine
            <span className="px-2 py-0.5 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono font-bold select-none">
              {userXP} XP
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Translate lifestyle carbon calculations into actual committed micro-activities. Securing campaigns immediately updates your Twin forecasts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#11131a] p-4 rounded-xl border border-[#1e2230] flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-emerald-500/10 text-[#10b981] rounded-lg border border-emerald-500/20 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-zinc-500 font-mono uppercase block">Total carbon saved to date</span>
            <strong className="text-base font-mono text-zinc-100 block truncate">{totalCarbonSaved.toFixed(1)} kg CO₂e</strong>
            <span className="text-[8px] text-zinc-400 font-mono block mt-0.5 truncate">
              ≈ {Math.round(totalCarbonSaved * 25)} scooter-km | {parseFloat((totalCarbonSaved / 42.5).toFixed(1))} LPG cyl
            </span>
          </div>
        </div>

        <div className="bg-[#11131a] p-4 rounded-xl border border-[#1e2230] flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 shrink-0">
            <Flame className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-zinc-500 font-mono uppercase block">Active streak benchmark</span>
            <strong className="text-base font-mono text-zinc-100 block truncate">{streakCount} Consecutive Days</strong>
          </div>
        </div>

        <div className="bg-[#11131a] p-4 rounded-xl border border-[#1e2230] flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 bg-blue-500/10 text-[#3b82f6] rounded-lg border border-blue-500/20 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-zinc-500 font-mono uppercase block">Sync tier rating level</span>
            <strong className="text-base font-mono text-zinc-100 block truncate">Node Silver (Tier-2)</strong>
          </div>
        </div>
      </div>

      <div className="bg-[#11131a] rounded-xl border border-[#1e2230] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e2230] bg-[#131620] flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">Active Weekly Micro-Campaigns</span>
          <span className="text-[9px] text-zinc-500 font-mono uppercase">NODE_ROLLOVER: 4 Days</span>
        </div>

        <div className="divide-y divide-zinc-805 px-5">
          {weeklyMissions.map((mission) => (
            <div 
              key={mission.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.005] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    mission.status === "completed" ? "bg-emerald-400" : mission.status === "active" ? "bg-blue-400 animate-pulse" : "bg-zinc-600"
                  }`} />
                  <h4 className="text-xs font-bold text-zinc-100 font-sans leading-tight">{mission.title}</h4>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-zinc-500 pl-4 leading-none">
                  <span>CO₂ Impact: <strong className="text-emerald-400">-{mission.co2Saving}kg</strong> <span className="text-zinc-600">({Math.round(mission.co2Saving * 25)} scooter-km)</span></span>
                  <span>Economic Delta: <strong className="text-zinc-300">₹{mission.monetarySaving} Saved</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-4 sm:pl-0 shrink-0">
                {mission.status === "completed" ? (
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded leading-none uppercase">✓ RECONCILED</span>
                ) : (
                  <button
                    onClick={() => handleToggleMissionCommit(mission.id)}
                    className={`text-[10px] px-3 py-1 rounded font-mono font-bold border transition-all ${
                      mission.isCommit 
                        ? "bg-blue-500/10 text-[#3b82f6] border-[#3b82f6]/35 hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/25" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-450 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    {mission.isCommit ? "ABORT" : "LOCK"}
                  </button>
                )}
                <ChevronRight className="h-3.5 w-3.5 text-zinc-650 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-950/20 to-[#131620]/30 border border-[#1e2230] p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>CARBONIQ RE-MODELING RECOMMENDATION OF THE WEEK</span>
          </div>
          <h3 className="text-sm font-bold text-zinc-100 font-sans uppercase">Transition Dairy Fats to Cold-Pressed Mustard or Sesame Spread</h3>
          <p className="text-[11px] text-[#94a3b8] leading-relaxed max-w-xl">
            Atmospheric modeling signals dairy butter and cow ghee continue to drives over 85% of receipt methane weights. Swapping to cold-pressed seed oils slashes household fat emissions by 81%.
          </p>
        </div>
        <button 
          onClick={() => {
            setDairyReductionPercent(80);
            triggerToast("Twin dairy levers models simulated worth 80% reduction!", "success");
            setActiveTab("twin");
          }}
          className="bg-emerald-500 text-black font-extrabold px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center gap-1.5 shrink-0 self-start md:self-center"
        >
          <span>Simulate in twin</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
});
