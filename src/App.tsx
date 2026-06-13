import React, { Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Database, CheckCircle, Loader2, X } from "lucide-react";
import { useCarbonIQ } from "./hooks/useCarbonIQ";
import { TabKey } from "./types";
import { Sidebar } from "./components/Sidebar";
import { WorkspaceScanner } from "./components/WorkspaceScanner";
const CarbonTwin = React.lazy(() => import("./components/CarbonTwin").then(m => ({ default: m.CarbonTwin })));
const AICoach = React.lazy(() => import("./components/AICoach").then(m => ({ default: m.AICoach })));
const MunicipalNetwork = React.lazy(() => import("./components/MunicipalNetwork").then(m => ({ default: m.MunicipalNetwork })));
const ActionCampaigns = React.lazy(() => import("./components/ActionCampaigns").then(m => ({ default: m.ActionCampaigns })));

const TabLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px] w-full text-zinc-500 font-mono text-xs gap-2">
    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
    <span>SYNCHRONIZING TRAY NODE...</span>
  </div>
);

export default function App() {
  const [showWalkthrough, setShowWalkthrough] = React.useState(true);
  const {
    activeTab,
    setActiveTab,
    selectedCityNode,
    setSelectedCityNode,
    streakCount,
    userXP,
    totalCarbonSaved,
    activeToast,
    receiptsHistory,
    uploadProgress,
    dragActive,
    setDragActive,
    scanResult,
    setScanResult,
    pipelineStep,
    pipelineActive,
    dairyReductionPercent,
    setDairyReductionPercent,
    altAdoptionPercent,
    setAltAdoptionPercent,
    energyTransitionActive,
    setEnergyTransitionActive,
    messages,
    chatInput,
    setChatInput,
    isChatTyping,
    citiesData,
    weeklyMissions,
    triggerToast,
    handleFileProcessing,
    triggerSampleScan,
    sendChatMessage,
    handleToggleMissionCommit,
  } = useCarbonIQ();

  return (
    <div className="w-full min-h-screen bg-[#07080b] text-[#f1f5f9] font-sans flex flex-col justify-between overflow-x-hidden antialiased select-none selection:bg-[#22C55E]/30" id="carboniq-app-root">
      {/* Dynamic Toast Message */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[100] px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md ${
              activeToast.type === "success" 
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30" 
                : "bg-blue-950/90 text-blue-300 border-blue-500/30"
            }`}
          >
            <div className={`p-1 rounded-full ${activeToast.type === "success" ? "bg-emerald-500/20" : "bg-blue-500/20"}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-tight">{activeToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Structural Frame */}
      <div className="flex-1 flex overflow-hidden h-screen" id="carboniq-main-frame">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCityNode={selectedCityNode}
          setSelectedCityNode={setSelectedCityNode}
          streakCount={streakCount}
          userXP={userXP}
          triggerToast={triggerToast}
        />

        {/* Console Content Frame & Playground Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0e12]" id="carboniq-console-container">
          <nav className="h-14 border-b border-[#1e2230] px-4 md:px-6 flex items-center justify-between bg-[#0b0c10] shrink-0 sticky top-0 z-50 shadow-md" id="carboniq-top-statusbar">
            <div className="flex items-center gap-4">
              <div className="lg:hidden flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
                </span>
                <span className="font-sans font-black tracking-tight text-sm text-[#FAFAFA]">CarbonIQ Node</span>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span>Console</span>
                <ChevronRight className="h-3 w-3 text-zinc-600" />
                <span className="text-zinc-400 font-bold">IND_MEM_CORE</span>
                <ChevronRight className="h-3 w-3 text-zinc-600" />
                <span className="text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded font-black uppercase">
                  {activeTab === "workspace" ? "playground_entry" : activeTab === "twin" ? "trajectory_simulation" : activeTab === "coach" ? "advisor_stream" : activeTab === "network" ? "community_benchmarks" : "campaign_checklist"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-[#12141c] border border-zinc-850 rounded text-xs">
                <span className="text-[9px] font-mono text-zinc-500 uppercase">MODEL_ENGINE:</span>
                <span className="text-[10px] font-mono text-[#3b82f6] font-extrabold">gemini-3.5-flash</span>
              </div>

              <div className="lg:hidden flex items-center gap-1 bg-[#12141c] border border-[#1e2230] px-2 py-1 rounded text-xs select-none">
                <select 
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as TabKey)}
                  className="bg-transparent text-xs font-mono font-bold text-emerald-400 border-none outline-none cursor-pointer focus:ring-0 p-0 block leading-tight"
                  aria-label="Mobile Navigation Selector"
                >
                  <option value="workspace" className="bg-[#0b0c10]">Playground</option>
                  <option value="twin" className="bg-[#0b0c10]">Digital Twin</option>
                  <option value="coach" className="bg-[#0b0c10]">AI Coach Advisor</option>
                  <option value="network" className="bg-[#0b0c10]">Grid Network</option>
                  <option value="actions" className="bg-[#0b0c10]">Campaigns</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-[10px] text-zinc-500 font-mono">PORT: 3000</span>
                <span className="h-5 w-px bg-zinc-800 hidden md:block" />
                <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-950/30 text-emerald-400 border border-emerald-500/25 rounded text-[10px] font-mono uppercase font-black tracking-wider">
                  <Database className="h-3 w-3 shrink-0 text-emerald-400" />
                  Grid synced
                </span>
              </div>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" id="carboniq-viewport-scroll" style={{ scrollbarWidth: "thin" }}>
            <AnimatePresence>
              {showWalkthrough && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative p-4 md:p-5 rounded-xl bg-[#0c0d12]/90 backdrop-blur-lg border border-[#10b981]/30 shadow-[0_0_30px_rgba(16,185,129,0.07)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none"
                  id="judge-walkthrough-banner"
                >
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest leading-none">
                        ⚡ Judge Demo Path
                      </span>
                    </div>
                    <ol className="grid grid-cols-1 sm:grid-cols-5 gap-2 md:gap-3 text-[11px] font-mono text-zinc-300">
                      <li className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/40 hover:border-emerald-500/20 transition-colors">
                        <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                        <span>Scan a receipt</span>
                      </li>
                      <li className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/40 hover:border-emerald-500/20 transition-colors">
                        <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                        <span>View AI carbon analysis</span>
                      </li>
                      <li className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/40 hover:border-emerald-500/20 transition-colors">
                        <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                        <span>Open Carbon Twin</span>
                      </li>
                      <li className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/40 hover:border-emerald-500/20 transition-colors">
                        <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                        <span>Ask AI Coach</span>
                      </li>
                      <li className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/40 hover:border-emerald-500/20 transition-colors">
                        <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-[10px] shrink-0">5</span>
                        <span>Explore Municipal Network</span>
                      </li>
                    </ol>
                  </div>
                  <button
                    onClick={() => setShowWalkthrough(false)}
                    className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all shrink-0 self-start md:self-center"
                    aria-label="Dismiss banner"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <Suspense fallback={<TabLoadingFallback />}>
              <AnimatePresence mode="wait">
                {activeTab === "workspace" && (
                  <WorkspaceScanner
                    key="workspace-scanner"
                    uploadProgress={uploadProgress}
                    dragActive={dragActive}
                    setDragActive={setDragActive}
                    pipelineActive={pipelineActive}
                    pipelineStep={pipelineStep}
                    scanResult={scanResult}
                    receiptsHistory={receiptsHistory}
                    setScanResult={setScanResult}
                    handleFileProcessing={handleFileProcessing}
                    triggerSampleScan={triggerSampleScan}
                    triggerToast={triggerToast}
                    setActiveTab={setActiveTab}
                    selectedCityNode={selectedCityNode}
                  />
                )}
                {activeTab === "twin" && (
                  <CarbonTwin
                    key="carbon-twin"
                    dairyReductionPercent={dairyReductionPercent}
                    setDairyReductionPercent={setDairyReductionPercent}
                    altAdoptionPercent={altAdoptionPercent}
                    setAltAdoptionPercent={setAltAdoptionPercent}
                    energyTransitionActive={energyTransitionActive}
                    setEnergyTransitionActive={setEnergyTransitionActive}
                    triggerToast={triggerToast}
                  />
                )}
                {activeTab === "coach" && (
                  <AICoach
                    key="ai-coach"
                    messages={messages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    isChatTyping={isChatTyping}
                    sendChatMessage={sendChatMessage}
                  />
                )}
                {activeTab === "network" && (
                  <MunicipalNetwork
                    key="municipal-network"
                    citiesData={citiesData}
                    selectedCityNode={selectedCityNode}
                    setSelectedCityNode={setSelectedCityNode}
                    triggerToast={triggerToast}
                  />
                )}
                {activeTab === "actions" && (
                  <ActionCampaigns
                    key="action-campaigns"
                    weeklyMissions={weeklyMissions}
                    handleToggleMissionCommit={handleToggleMissionCommit}
                    totalCarbonSaved={totalCarbonSaved}
                    streakCount={streakCount}
                    userXP={userXP}
                    setDairyReductionPercent={setDairyReductionPercent}
                    triggerToast={triggerToast}
                    setActiveTab={setActiveTab}
                  />
                )}
              </AnimatePresence>
            </Suspense>
          </div>

          <footer className="h-10 border-t border-[#1e2230] bg-[#0b0c10] px-4 md:px-6 flex items-center justify-between text-[9px] text-[#94a3b8]/80 font-mono select-none uppercase tracking-wider shrink-0" id="carboniq-footer">
            <div className="flex gap-4">
              <span className="hidden md:inline">BASELINE_MULTIPLIER: 4.8</span>
              <span>GRID_NODE: IND_MEM_GRID_CORE_4F</span>
              <span className="hidden sm:inline">CYCLE_LATENCY: 12ms</span>
            </div>
            
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-sans font-black tracking-normal leading-none uppercase">
              <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse shrink-0"></span>
              CarbonIQ Platform v2.0-stable
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
