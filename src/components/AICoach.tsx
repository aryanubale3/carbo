import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Message } from "../types";

interface AICoachProps {
  messages: Message[];
  chatInput: string;
  setChatInput: (val: string) => void;
  isChatTyping: boolean;
  sendChatMessage: (text: string) => void;
}

const presetQueries = [
  "Why is my footprint increasing?",
  "What should I replace first?",
  "How can I reduce emissions without spending more money?",
  "Compare me with users in my city."
];

export const AICoach = React.memo(function AICoach({
  messages,
  chatInput,
  setChatInput,
  isChatTyping,
  sendChatMessage,
}: AICoachProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatTyping]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto w-full flex flex-col bg-[#11131a] rounded-xl border border-[#1e2230] overflow-hidden min-h-[500px] shadow-2xl"
      id="ai-carbon-coach-panel"
    >
      <div className="px-5 py-4 border-b border-[#1e2230] bg-[#131620] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-500/10 text-[#3b82f6] border border-[#3b82f6]/20">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-sans text-white">Gemini Carbon Advisor</h2>
            <p className="text-[8px] text-zinc-550 font-mono uppercase tracking-widest font-black leading-none mt-1">Continuous Adaptive Context Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] px-2 py-0.5 bg-[#0c0d12] rounded border border-zinc-800 text-zinc-400 font-mono">ADVISOR_ONLINE</span>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[340px] min-h-[280px]" style={{ scrollbarWidth: "thin" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role !== "user" && (
              <div className="w-7.5 h-7.5 rounded bg-gradient-to-tr from-[#3b82f6] to-[#10b981] text-white flex items-center justify-center text-[10px] shrink-0 font-bold font-mono shadow-md shadow-emerald-500/5">IQ</div>
            )}
            <div className={`p-3.5 rounded-xl max-w-xl text-xs leading-relaxed border ${msg.role === "user" ? "bg-zinc-800 text-zinc-105 border-zinc-700 font-sans shadow-sm" : "bg-[#131621] text-zinc-100 border-[#1e2230] font-sans"}`}>
              <div className="space-y-2 whitespace-pre-wrap">{msg.content}</div>
              <span className="block mt-2 text-[8px] text-zinc-550 font-mono text-right">{msg.timestamp}</span>
            </div>
            {msg.role === "user" && (
              <div className="w-7.5 h-7.5 rounded bg-zinc-700 border border-zinc-650 text-white flex items-center justify-center text-[10px] shrink-0 font-bold font-mono">AU</div>
            )}
          </div>
        ))}

        {isChatTyping && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-7.5 h-7.5 rounded bg-gradient-to-tr from-[#3b82f6] to-[#10b981] text-white flex items-center justify-center text-[10px] shrink-0 font-bold font-mono">IQ</div>
            <div className="p-3.5 rounded-xl bg-[#131621] border border-[#1e2230] flex items-center gap-1.5 shadow-inner">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 py-2.5 border-t border-[#1e2230] bg-[#12141c]/50 overflow-x-auto flex gap-2" style={{ scrollbarWidth: "none" }}>
        {presetQueries.map((query, i) => (
          <button 
            key={i}
            onClick={() => sendChatMessage(query)}
            className="whitespace-nowrap px-3 py-1 bg-[#181a24] hover:bg-[#1e2230] text-[10px] font-bold text-zinc-400 rounded-md border border-zinc-800 hover:text-[#3b82f6] hover:border-[#3b82f6]/40 transition-all font-mono uppercase shrink-0"
          >
            {query}
          </button>
        ))}
      </div>

      <div className="p-4 bg-[#131620] border-t border-[#1e2230]">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendChatMessage(chatInput);
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="coach-chat-input" className="sr-only">Ask CarbonIQ Advisor Coach</label>
          <input 
            id="coach-chat-input"
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Inquire about regional millets, dairy emission locks, or carbon twin contractions..."
            className="flex-1 bg-[#0c0d12] border border-[#1e2230] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#3b82f6] transition-all font-sans"
          />
          <button 
            type="submit" 
            disabled={isChatTyping}
            className="bg-[#3b82f6] hover:bg-[#1d63d8] text-white font-extrabold h-9 px-4 rounded-lg transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider shrink-0"
          >
            <span>Send</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
});
