import React from "react";
import { motion } from "motion/react";
import { Upload, RefreshCw, CheckCircle, Leaf, Terminal } from "lucide-react";
import { AnalysisResult } from "../types";
import { ScannerPresets } from "./ScannerPresets";
import { ScannerPipeline } from "./ScannerPipeline";

const getEcoColor = (rating: "A" | "B" | "C" | "D" | "E") => {
  switch (rating) {
    case "A": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
    case "B": return "bg-green-500/10 text-green-400 border border-green-500/30";
    case "C": return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
    case "D": return "bg-orange-500/10 text-orange-400 border border-orange-500/30";
    case "E": return "bg-red-500/10 text-red-400 border border-red-500/40 animate-pulse";
    default: return "bg-zinc-800 text-zinc-300 border border-zinc-750";
  }
};

interface WorkspaceScannerProps {
  uploadProgress: string | null;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  pipelineActive: boolean;
  pipelineStep: number;
  scanResult: AnalysisResult;
  receiptsHistory: AnalysisResult[];
  setScanResult: (res: AnalysisResult) => void;
  handleFileProcessing: (file: File) => void;
  triggerSampleScan: (sampleId: string) => void;
  triggerToast: (msg: string, type?: "success" | "info") => void;
  setActiveTab: (tab: "workspace" | "twin" | "coach" | "network" | "actions") => void;
  selectedCityNode: string;
}

export const WorkspaceScanner = React.memo(function WorkspaceScanner({
  uploadProgress,
  dragActive,
  setDragActive,
  pipelineActive,
  pipelineStep,
  scanResult,
  receiptsHistory,
  setScanResult,
  handleFileProcessing,
  triggerSampleScan,
  triggerToast,
  setActiveTab,
  selectedCityNode,
}: WorkspaceScannerProps) {
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcessing(e.target.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch"
    >
      <div className="xl:col-span-5 flex flex-col justify-between gap-6">
        <div className="bg-[#11131a] p-5 rounded-xl border border-[#1e2230] space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="space-y-0.5">
              <span className="text-[#10b981] text-[9px] font-mono tracking-widest uppercase font-black block">Playground Engine</span>
              <h1 className="text-xl font-sans font-black tracking-tight text-white leading-none">Invoice Capture Frame</h1>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 font-bold bg-[#1d1f27] px-2 py-[2px] rounded border border-zinc-850">INPUT_TRAY</span>
          </div>

          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Drag and drop screenshots, PDFs, or photos of food labels and grocery bills directly into our sub-continental Carbon Index engine.
          </p>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative p-6 rounded-lg border border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] bg-[#0c0d12] ${
              dragActive ? "border-emerald-400 bg-emerald-500/5 scale-95" : "border-zinc-800 hover:border-zinc-700"
            }`}
            id="drag-and-drop-zone"
            aria-label="Upload capture receipt file frame"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("receipt-file")?.click(); }}
          >
            <input 
              type="file" 
              id="receipt-file" 
              className="hidden" 
              accept="image/*,.pdf" 
              onChange={handleFileChange}
            />

            {uploadProgress ? (
              <div className="flex flex-col items-center py-2">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
                <p className="text-xs font-bold font-mono text-zinc-200 tracking-wide mb-1">{uploadProgress}</p>
                <div className="w-40 h-1 bg-zinc-800 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${pipelineStep * 20}%` }} />
                </div>
              </div>
            ) : (
              <label htmlFor="receipt-file" className="cursor-pointer flex flex-col items-center py-2 w-full">
                <div className="h-10 w-10 rounded bg-[#13151f] border border-zinc-800 flex items-center justify-center text-[#10b981] mb-3">
                  <Upload className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-zinc-200 mb-1">Simulate screenshot file upload</span>
                <span className="text-[10px] text-zinc-500">PNG, JPEG, or PDF. Drop file directly here.</span>
              </label>
            )}
          </div>
        </div>

        <div className="bg-[#11131a] p-5 rounded-xl border border-[#1e2230] space-y-4">
          <div>
            <span className="text-[9px] text-[#3b82f6] font-mono uppercase tracking-widest font-bold block mb-1">Pre-configured prompts</span>
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider block">Ingest preset datasets</h3>
          </div>

          <ScannerPresets triggerSampleScan={triggerSampleScan} />

          {receiptsHistory.length > 1 && (
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block font-bold">Saved prompt runs ({receiptsHistory.length - 1})</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: "thin" }}>
                {receiptsHistory.slice(1).map((hist, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      setScanResult(hist);
                      triggerToast(`Loaded cached ledger run worth ${hist.totalCo2}kg CO₂e`, "info");
                    }}
                    className="flex items-center justify-between text-[11px] p-2 bg-[#0c0d12] border border-zinc-855 hover:border-zinc-700 rounded cursor-pointer font-mono"
                  >
                    <span className="text-zinc-400 truncate max-w-[150px]">Run #{receiptsHistory.length - index - 1}: {hist.items[0]?.name || "Parsed Goods"}</span>
                    <span className="font-bold text-emerald-400 text-[10px]">-{hist.totalCo2}kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-7 flex flex-col gap-6" id="playground-results-stage">
        <ScannerPipeline pipelineActive={pipelineActive} pipelineStep={pipelineStep} />

        <div className="bg-[#11131a] rounded-xl border border-[#1e2230] overflow-hidden flex-1 flex flex-col justify-between" id="carbon-audit-ledger-frame">
          <div className="px-5 py-3 border-b border-[#1e2230] flex items-center justify-between bg-[#131620]">
            <div className="flex items-center gap-2.5">
              <div className="w-2 rounded-full h-2 bg-[#10b981]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Carbon Allocation Audit Output</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#10b981] bg-[#10b981]/5 px-2 py-[2px] rounded border border-[#10b981]/15 leading-none">
              Current Node: {selectedCityNode} Grid
            </span>
          </div>

          <div className="p-5 flex-grow space-y-6 flex flex-col justify-between">
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="workspace-emissions-table">
                  <thead>
                    <tr className="border-b border-[#1e2230] pb-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      <th className="py-2.5 font-bold">Ingredient Element</th>
                      <th className="py-2.5 font-bold text-center">Batch Weight</th>
                      <th className="py-2.5 font-bold text-center">Category Node</th>
                      <th className="py-2.5 font-bold text-center">Eco Multiplier</th>
                      <th className="py-2.5 font-bold text-right">Methane Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2230]/40 text-xs">
                    {scanResult.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.008] transition-colors">
                        <td className="py-3 font-semibold text-zinc-100 font-sans text-sm">{item.name}</td>
                        <td className="py-3 text-center text-zinc-400 font-mono text-xs">{item.quantity}</td>
                        <td className="py-3 text-center">
                          <span className="text-[9px] font-mono font-bold bg-[#1e2230] text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded uppercase">{item.category}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${getEcoColor(item.ecoRating)}`}>{item.ecoRating}</span>
                        </td>
                        <td className="py-3 text-right font-mono font-black text-emerald-400 text-sm">{item.co2.toFixed(1)}kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Leaf className="h-4.5 w-4.5 text-emerald-400" />
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-extrabold">Recommended Carbon Swapping Parameters</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="swap-recommendations-row">
                  {scanResult.items.filter(it => it.co2 >= 1.0).map((it) => (
                    <div 
                      key={`swap-${it.id}`} 
                      className="bg-[#0b0c10] p-3 rounded-lg border border-zinc-800 flex flex-col justify-between hover:border-emerald-500/30 transition-all cursor-pointer group"
                      onClick={() => {
                        triggerToast(`Modeling optimized trace for alternative: '${it.alternative}'`, "info");
                        setActiveTab("twin");
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-[#94a3b8] uppercase font-mono block">Replace: {it.name}</span>
                        <span className="text-[10px] font-mono font-bold text-red-400">({it.co2}kg)</span>
                      </div>
                      <div className="text-xs text-emerald-400 mt-2 font-mono flex items-center gap-1.5 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                        <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>Swap: {it.alternative}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#1e2230] pt-5 flex flex-col md:flex-row items-stretch justify-between gap-5">
              <div className="bg-[#0c0d12] p-3.5 rounded-lg border border-zinc-855 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Terminal className="h-4 w-4 text-[#3b82f6]" />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Lifecycle Analyzer Output</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed italic font-sans">&ldquo;{scanResult.explanation}&rdquo;</p>
              </div>

              <div className="flex flex-col justify-center items-center md:items-end px-5 py-3 bg-[#131620] rounded-lg border border-[#1e2230] text-center md:text-right min-w-[150px] shrink-0">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">TOTAL CO₂ WEIGHT</span>
                <span className="text-4xl font-mono font-black text-white tracking-tighter">{scanResult.totalCo2.toFixed(1)}</span>
                <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono font-bold mt-1">KILOGRAM EQUIVALENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
