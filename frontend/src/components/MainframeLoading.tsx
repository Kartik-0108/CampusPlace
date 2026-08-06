import React, { useState, useEffect, useRef } from 'react';
import { Shield, Cpu, Terminal, Sparkles, Database, Lock, Activity, Fingerprint, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MainframeLoadingProps {
  onComplete?: () => void;
  statusText?: string;
}

export default function MainframeLoading({ onComplete, statusText = "SECURE PORTAL INITIALIZATION..." }: MainframeLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { label: "Securing gateway connection", id: "SYS_HS", details: "TLS 1.3 handshake established." },
    { label: "Verifying credentials & claims", id: "AUTH_DEC", details: "Cryptographic payload validated." },
    { label: "Synchronizing student rosters", id: "DATA_VR", details: "Fetched 1,240 records successfully." },
    { label: "Verifying recruiter credentials", id: "NET_SYNC", details: "Checked accreditation status." },
    { label: "Structuring dynamic views", id: "INT_RDY", details: "Readying analytics modules." }
  ];

  const logPool = [
    "INIT // Establishing crypt-handshake to secure college gateway...",
    "SEC_KEY // Initializing 256-bit AES encryption session keys...",
    "DB_CONN // Connecting to Firestore Cluster instance 'prod-asia-east'...",
    "DB_OK // Real-time document stream successfully listening to modifications.",
    "SYNC // Fetching latest placement drives: Google, Tesla, Infosys...",
    "AUTH_CLAIM // Parsing JWT token payloads and validating user authorization scope...",
    "ROLE_DEC // Resolving user clearance group and populating dynamic dashboard state...",
    "UI_LOAD // Loading workspace components: Kanban, Calendar, Analytics...",
    "READY // Security environment validated. Redirecting to workspace..."
  ];

  // Progressive timer
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) {
            setTimeout(onComplete, 400); // Tiny pause for premium satisfaction
          }
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  // Determine active step based on progress
  useEffect(() => {
    const stepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
    setActiveStep(stepIndex);
  }, [progress]);

  // Generate dynamic system logs
  useEffect(() => {
    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logPool.length) {
        setTerminalLogs((prev) => [...prev, logPool[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Autoscroll terminal
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div 
      id="mainframe_loader"
      className="min-h-screen bg-[#020503] flex items-center justify-center font-sans relative overflow-hidden text-emerald-400 p-4 select-none theme-light:bg-slate-50 theme-light:text-slate-800"
    >
      {/* Background Decorative Tech Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] theme-light:bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.04)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.01)_1px,transparent_1px)] bg-[size:32px_32px] theme-light:bg-[linear-gradient(rgba(79,70,229,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.015)_1px,transparent_1px)]" />

      {/* Futuristic scanning laser line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-[scan_3s_infinite_linear] theme-light:via-indigo-500/25 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-[540px] bg-[#050a06]/90 backdrop-blur-xl rounded-2xl border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.06)] p-6 md:p-8 space-y-6 relative overflow-hidden theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-2xl"
      >
        {/* Glow corner accents */}
        <div className="absolute top-0 left-0 w-6 h-[2px] bg-emerald-500/60 theme-light:bg-indigo-500/50" />
        <div className="absolute top-0 left-0 w-[2px] h-6 bg-emerald-500/60 theme-light:bg-indigo-500/50" />
        <div className="absolute bottom-0 right-0 w-6 h-[2px] bg-emerald-500/60 theme-light:bg-indigo-500/50" />
        <div className="absolute bottom-0 right-0 w-[2px] h-6 bg-emerald-500/60 theme-light:bg-indigo-500/50" />

        {/* Top telemetry panel bar */}
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4 theme-light:border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 theme-light:bg-indigo-400"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 theme-light:bg-indigo-600"></span>
            </span>
            <span className="text-[11px] font-mono tracking-widest text-emerald-500/70 font-bold uppercase theme-light:text-slate-500">
              SYS_LINK // {progress < 100 ? "INITIALIZING" : "SECURED"}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-500/50 theme-light:text-slate-400">
            <Lock size={12} className="text-emerald-500/70 theme-light:text-indigo-500" />
            <span>AES_GCM_256</span>
          </div>
        </div>

        {/* Holographic Arc / Spinner Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-2">
          {/* Circular Holographic SVG Meter */}
          <div className="col-span-1 flex flex-col items-center justify-center relative">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Spinning outer rings */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle 
                  cx="56" cy="56" r="48" 
                  className="stroke-emerald-500/10 theme-light:stroke-slate-100" 
                  strokeWidth="3" 
                  fill="none" 
                />
                <motion.circle 
                  cx="56" cy="56" r="48" 
                  className="stroke-emerald-400 theme-light:stroke-indigo-600" 
                  strokeWidth="4" 
                  strokeDasharray="301.6"
                  strokeDashoffset={301.6 - (301.6 * progress) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Decorative inner dotted orbit */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute w-20 h-20 rounded-full border border-dashed border-emerald-500/20 theme-light:border-indigo-200"
              />

              {/* Glowing core icon */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="z-10 bg-[#09120a] theme-light:bg-indigo-50 p-4 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] theme-light:border-indigo-100 theme-light:shadow-none"
              >
                <Fingerprint className="text-emerald-400 theme-light:text-indigo-600 w-8 h-8" />
              </motion.div>
            </div>
            <span className="mt-3 text-[10px] font-mono font-bold tracking-widest text-emerald-500/50 theme-light:text-slate-500 uppercase">
              CREDENTIALS OK
            </span>
          </div>

          {/* Interactive Live Network Status */}
          <div className="col-span-2 space-y-3 bg-[#030604]/80 theme-light:bg-slate-50 p-4 rounded-xl border border-emerald-500/15 theme-light:border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-500/60 theme-light:text-slate-500">
              <span className="flex items-center gap-1.5"><Activity size={12} className="animate-pulse" /> CLOUD DEPLOYMENT</span>
              <span className="font-semibold text-emerald-400 theme-light:text-indigo-600">ONLINE</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-emerald-500/40 theme-light:text-slate-400">
                <span>GATEWAY RESPONDING</span>
                <span className="text-emerald-400 theme-light:text-indigo-600">8 ms latency</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-emerald-500/40 theme-light:text-slate-400">
                <span>SEEDED REGISTRIES</span>
                <span className="text-emerald-400 theme-light:text-indigo-600">LOADED</span>
              </div>
            </div>

            <div className="border-t border-emerald-500/10 pt-2 flex items-center gap-2 font-mono text-[10px]">
              <Cpu size={12} className="text-emerald-500/50 theme-light:text-slate-400" />
              <span className="truncate text-emerald-500/70 theme-light:text-slate-600">
                AUTH_CONTEXT: {progress < 50 ? "Verifying Token..." : progress < 90 ? "Injecting Security Policies..." : "Workspace Loaded"}
              </span>
            </div>
          </div>
        </div>

        {/* Improved Autoscrolling Console / Terminal Logger */}
        <div className="bg-[#030604] theme-light:bg-slate-900 border border-emerald-500/20 rounded-xl p-4 space-y-3 h-32 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-500/50 border-b border-emerald-500/10 pb-1.5 theme-light:text-slate-400 theme-light:border-slate-800">
            <span className="flex items-center gap-1.5 font-bold"><Terminal size={12} /> SECURE SHELL MONITOR</span>
            <span className="animate-pulse text-[9px]">LIVE STACK</span>
          </div>

          <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar font-mono text-[11px] text-emerald-300 space-y-1 scroll-smooth theme-light:text-emerald-400"
          >
            {terminalLogs.map((log, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="leading-relaxed whitespace-pre-wrap break-all border-l border-emerald-500/20 pl-2 ml-1"
              >
                {log}
              </motion.div>
            ))}
            {progress < 100 && (
              <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-1.5 animate-pulse" />
            )}
          </div>
        </div>

        {/* Authentication Steps Map */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest theme-light:text-slate-400 font-bold">
            <span>SEQUENCE STAGES</span>
            <span>{activeStep + 1} / {steps.length}</span>
          </div>
          
          <div className="grid grid-cols-5 gap-1.5">
            {steps.map((step, idx) => {
              const isDone = idx < activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div key={step.id} className="space-y-1">
                  <div 
                    className={`h-1.5 rounded transition-all duration-300 ${
                      isDone 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] theme-light:bg-indigo-600 theme-light:shadow-none' 
                        : isCurrent 
                        ? 'bg-emerald-400 animate-pulse theme-light:bg-indigo-400' 
                        : 'bg-emerald-950/40 theme-light:bg-slate-200'
                    }`} 
                  />
                  <div className={`text-[8px] font-mono text-center truncate ${isCurrent ? 'text-emerald-300 font-bold theme-light:text-indigo-600' : 'text-emerald-500/30 theme-light:text-slate-400'}`}>
                    {step.id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modern Styled Progress Section */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-end font-mono">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-500/50 uppercase tracking-wider theme-light:text-slate-400 font-bold">
                SYSTEM ENVIRONMENT
              </span>
              <div className="text-xs font-semibold text-emerald-300 uppercase tracking-widest theme-light:text-slate-800 flex items-center gap-1.5">
                <Sparkles size={12} className="text-emerald-400 theme-light:text-indigo-600" />
                {progress < 40 
                  ? "Authenticating gateway..." 
                  : progress < 85 
                  ? "Seeding dashboard metrics..." 
                  : "Finalizing clearance level..."}
              </div>
            </div>
            <span className="text-2xl font-bold text-emerald-400 theme-light:text-indigo-600">
              {progress}%
            </span>
          </div>

          <div className="h-2.5 bg-[#030604] border border-emerald-500/20 rounded-full p-[1px] overflow-hidden relative theme-light:bg-slate-100 theme-light:border-slate-200">
            <motion.div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] theme-light:from-indigo-600 theme-light:to-indigo-400 theme-light:shadow-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
