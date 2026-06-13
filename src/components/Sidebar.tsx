import React from "react";
import { Scan, Sliders, Sparkles, Globe, Target, MapPin, Flame, Zap, Activity } from "lucide-react";

interface SidebarProps {
  activeTab: "workspace" | "twin" | "coach" | "network" | "actions";
  setActiveTab: (tab: "workspace" | "twin" | "coach" | "network" | "actions") => void;
  selectedCityNode: string;
  setSelectedCityNode: (city: string) => void;
  streakCount: number;
  userXP: number;
  triggerToast: (msg: string, type?: "success" | "info") => void;
}

export const Sidebar = React.memo(function Sidebar({
  activeTab,
  setActiveTab,
  selectedCityNode,
  setSelectedCityNode,
  streakCount,
  userXP,
  triggerToast,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#0b0c10] border-r border-[#1e2230] text-[#f1f5f9] shrink-0 justify-between select-none p-4" id="carboniq-sidebar">
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-2 py-1 cursor-pointer" onClick={() => setActiveTab("workspace")}>
          <div className="relative flex h-5 w-5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-65"></span>
            <span className="relative inline-flex rounded h-5 w-5 bg-gradient-to-tr from-[#10b981] to-[#3b82f6] shadow shadow-[#10b981]/50"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-sans font-extrabold tracking-tight text-lg text-white">CarbonIQ</span>
              <span className="text-[9px] font-mono font-bold bg-[#1e293b] text-[#3b82f6] border border-[#2e3e56] rounded-sm px-1 py-[1px]">CORE</span>
            </div>
            <span className="text-[9px] text-[#94a3b8] uppercase tracking-widest font-mono font-semibold leading-none mt-1">Lifecycle Matrix Node</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#11131a] border border-[#1e2230] space-y-2">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-zinc-400">Node Grid State</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              IND_MEM_GRID
            </span>
            <span className="text-[10px] font-mono text-zinc-500">v2.0-stable</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block px-2 mb-2 font-bold">Workspaces</span>
          
          <button 
            onClick={() => setActiveTab("workspace")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium tracking-tight transition-all uppercase ${
              activeTab === "workspace" 
                ? "bg-[#181a24] text-emerald-400 font-bold border-l-2 border-emerald-400 shadow shadow-emerald-500/5" 
                : "text-[#94a3b8] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Scan className="h-4 w-4" />
            <span>Workspace Scanner</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab("twin");
              triggerToast("Carbon Twin simulation model connected.", "info");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium tracking-tight transition-all uppercase ${
              activeTab === "twin" 
                ? "bg-[#181a24] text-emerald-400 font-bold border-l-2 border-emerald-400 shadow shadow-emerald-500/5" 
                : "text-[#94a3b8] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Carbon Twin AI</span>
          </button>

          <button 
            onClick={() => setActiveTab("coach")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium tracking-tight transition-all uppercase ${
              activeTab === "coach" 
                ? "bg-[#181a24] text-[#3b82f6] font-bold border-l-2 border-[#3b82f6] shadow shadow-blue-500/5" 
                : "text-[#94a3b8] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Advisor Coach</span>
          </button>

          <button 
            onClick={() => setActiveTab("network")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium tracking-tight transition-all uppercase ${
              activeTab === "network" 
                ? "bg-[#181a24] text-blue-400 font-bold border-l-2 border-blue-400" 
                : "text-[#94a3b8] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Municipal Network</span>
          </button>

          <button 
            onClick={() => setActiveTab("actions")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium tracking-tight transition-all uppercase ${
              activeTab === "actions" 
                ? "bg-[#181a24] text-amber-400 font-bold border-l-2 border-amber-400" 
                : "text-[#94a3b8] hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Action Campaigns</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-[#1e2230]">
        <div className="space-y-2">
          <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block font-bold px-1">Grid parameters</span>
          <div className="flex items-center gap-2 p-2 bg-[#12141c] border border-[#1e2230] rounded-lg text-xs">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="flex-1 flex flex-col min-w-0">
              <label htmlFor="sidebar-city-select" className="text-[8px] text-zinc-500 font-mono uppercase cursor-pointer">Emission Base node</label>
              <select 
                id="sidebar-city-select"
                value={selectedCityNode}
                onChange={(e) => {
                  setSelectedCityNode(e.target.value);
                  triggerToast(`Focused grid telemetry onto ${e.target.value}`, "info");
                }}
                className="bg-transparent text-xs font-mono font-bold text-white border-none outline-none cursor-pointer focus:ring-0 p-0 block leading-tight overflow-hidden text-ellipsis"
                aria-label="Metropolitan Region Selector"
              >
                <option value="Bengaluru" className="bg-[#0b0c10]">Bengaluru</option>
                <option value="Mumbai" className="bg-[#0b0c10]">Mumbai</option>
                <option value="Pune" className="bg-[#0b0c10]">Pune</option>
                <option value="Delhi Node" className="bg-[#0b0c10]">Delhi Node</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
          <div className="bg-amber-950/30 p-2 border border-amber-500/20 rounded-lg flex flex-col justify-center items-center">
            <Flame className="h-4 w-4 text-orange-400 animate-pulse mb-1 fill-orange-400/10" />
            <span className="text-[8px] text-zinc-500 uppercase leading-none block">STREAK</span>
            <span className="font-bold text-orange-400 mt-0.5">{streakCount} Days</span>
          </div>
          <div className="bg-blue-950/30 p-2 border border-[#3b82f6]/20 rounded-lg flex flex-col justify-center items-center">
            <Zap className="h-4 w-4 text-[#3b82f6] mb-1 fill-[#3b82f6]/10" />
            <span className="text-[8px] text-zinc-500 uppercase leading-none block">BAL_XP</span>
            <span className="font-bold text-[#3b82f6] mt-0.5">{userXP} XP</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-[#12141c]/50 border border-zinc-800/40 rounded-lg">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-sky-800 to-indigo-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-extrabold text-white">
            AU
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-bold text-zinc-100 truncate block">Aryan Ubale</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 block truncate">Node Server: Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
});
