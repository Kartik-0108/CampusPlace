import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Cpu, Radio, Network, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MainframeLoadingProps {
  onComplete?: () => void;
  statusText?: string;
}

export default function MainframeLoading({ onComplete, statusText = "SECURE PORTAL INITIALIZATION..." }: MainframeLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [randomBits, setRandomBits] = useState('');

  const steps = [
    { label: "Establishing secure gateway session", id: "SYS_HS" },
    { label: "Verifying user credentials & authorization roles", id: "AUTH_DEC" },
    { label: "Fetching latest college placement registries", id: "DATA_VR" },
    { label: "Synchronizing data stream with Cloud Firestore", id: "NET_SYNC" },
    { label: "Preparing dashboard analytics environment", id: "INT_RDY" }
  ];

  // Simulating the decoding sequence and updating stats
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) {
            // Add a tiny delay for high-tech transition feel
            setTimeout(onComplete, 300);
          }
          return 100;
        }
        // Organic pseudo-random high tech progress jumps
        const increment = Math.floor(Math.random() * 12) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  // Determine active step based on progress percentage
  useEffect(() => {
    const stepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
    setActiveStep(stepIndex);
  }, [progress]);

  // Generate random digital bits to look like background decrypting memory stream
  useEffect(() => {
    const bitInterval = setInterval(() => {
      let text = '';
      const chars = '01ABCDEFUXØ101';
      for (let i = 0; i < 28; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setRandomBits(text);
    }, 80);
    return () => clearInterval(bitInterval);
  }, []);

  return (
    <div 
      id="mainframe_loader"
      className="min-h-screen bg-[#030704] flex items-center justify-center font-sans crt-container pixel-grid text-emerald-400 p-4 select-none theme-light:bg-slate-50 theme-light:text-slate-800"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[500px] bg-[#060c08] rounded-2xl border-2 border-emerald-500/25 shadow-[0_0_35px_rgba(16,185,129,0.08)] p-6 md:p-8 space-y-6 relative overflow-hidden theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-xl"
      >
        {/* Decorative corner highlights */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-500/40 theme-light:border-indigo-500/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-500/40 theme-light:border-indigo-500/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-500/40 theme-light:border-indigo-500/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-500/40 theme-light:border-indigo-500/40" />

        {/* Top telemetry bar */}
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4 theme-light:border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 theme-light:bg-indigo-500"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 theme-light:bg-indigo-600"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-500/60 uppercase theme-light:text-slate-500 font-bold">
              PORTAL_STATUS: {progress < 100 ? 'CONNECTING' : 'AUTHORIZED'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-500/40 theme-light:text-slate-400">
            SESSION_ID // {randomBits.substring(0, 6) || '4F8A'}
          </span>
        </div>

        {/* Core Loading Graphic with live matrix decrypt streams */}
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="col-span-1 bg-[#040805] rounded border border-emerald-500/20 flex flex-col items-center justify-center p-4 relative overflow-hidden h-28 theme-light:bg-slate-50 theme-light:border-slate-200">
            {/* Spinning holographic icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="text-emerald-400 theme-light:text-indigo-600 relative z-10"
            >
              <Cpu size={32} className="opacity-90" />
            </motion.div>
            
            <div className="absolute inset-0 opacity-[0.04] font-mono text-[7px] text-center break-all select-none overflow-hidden py-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>{randomBits}</div>
              ))}
            </div>

            <div className="mt-2 text-[10px] font-mono text-emerald-500/50 theme-light:text-slate-500 text-center uppercase tracking-wider relative z-10 font-bold">
              PROCESSOR
            </div>
          </div>

          <div className="col-span-2 bg-[#040805] rounded border border-emerald-500/20 p-4 flex flex-col justify-between h-28 theme-light:bg-slate-50 theme-light:border-slate-200">
            <div className="text-[10px] font-mono text-emerald-500/40 theme-light:text-slate-500 flex items-center justify-between">
              <span>ACTIVE SECURE SESSION</span>
              <Terminal size={10} className="animate-pulse" />
            </div>
            
            {/* Live digital register values scrolling */}
            <div className="font-mono text-xs text-emerald-300 font-medium tracking-widest break-all line-clamp-2 h-10 select-none theme-light:text-indigo-600">
              {randomBits || "010010101001110010101"}
              <span className="animate-pulse">_</span>
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-emerald-500/60 theme-light:text-slate-500 border-t border-emerald-500/10 pt-1 theme-light:border-slate-200">
              <span>TRANSFER RATE: <span className="text-emerald-400 theme-light:text-indigo-600 font-semibold">14.8 MB/s</span></span>
              <span>HTTP STATUS: <span className="text-emerald-400 theme-light:text-indigo-600 font-semibold">200 OK</span></span>
            </div>
          </div>
        </div>

        {/* Dynamic status list logs */}
        <div className="bg-[#040805] rounded border border-emerald-500/20 p-4 space-y-2 h-36 overflow-hidden theme-light:bg-slate-50 theme-light:border-slate-200">
          <div className="text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest border-b border-emerald-500/10 pb-1.5 mb-2 theme-light:border-slate-200 theme-light:text-slate-500 font-bold">
            Portal Loading Log
          </div>
          
          <div className="space-y-1.5 font-mono text-[11px] h-24 overflow-y-auto">
            {steps.map((step, idx) => {
              const isDone = idx < activeStep;
              const isCurrent = idx === activeStep;
              
              return (
                <div 
                  key={step.id} 
                  className={`flex items-center justify-between transition-opacity duration-200 ${isDone ? 'text-emerald-500/80 theme-light:text-indigo-700' : isCurrent ? 'text-emerald-300 theme-light:text-slate-900 font-bold' : 'text-emerald-950/40 theme-light:text-slate-300'}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">{isDone ? '✓' : isCurrent ? '▶' : '•'}</span>
                    <span className="truncate uppercase tracking-wide">{step.label}</span>
                  </div>
                  <span className={`text-[10px] shrink-0 font-bold ml-2 ${isDone ? 'text-emerald-500 theme-light:text-indigo-600' : isCurrent ? 'text-emerald-400 animate-pulse theme-light:text-indigo-500' : 'text-transparent'}`}>
                    {isDone ? '[COMPLETED]' : '[PENDING]'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Animated Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between items-end font-mono">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest theme-light:text-slate-700">
              {progress < 100 ? 'Authenticating account' : 'Access granted'}
            </span>
            <span className="text-xl font-bold text-emerald-400 theme-light:text-indigo-600">
              {progress}%
            </span>
          </div>

          <div className="h-4 bg-[#040805] border-2 border-emerald-500/30 rounded p-[2px] overflow-hidden relative theme-light:bg-slate-100 theme-light:border-slate-300">
            <motion.div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.5)] theme-light:from-indigo-600 theme-light:to-indigo-400 theme-light:shadow-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
