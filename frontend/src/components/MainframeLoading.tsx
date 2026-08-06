import React, { useState, useEffect } from 'react';
import { GraduationCap, Building, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MainframeLoadingProps {
  onComplete?: () => void;
  statusText?: string;
}

export default function MainframeLoading({ onComplete }: MainframeLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Preparing your workspace...",
    "Syncing placement data...",
    "Connecting students...",
    "Connecting recruiters...",
    "Loading opportunities...",
    "Preparing dashboard...",
    "Almost ready...",
    "Welcome to CampusPlace"
  ];

  // Rotate status messages every 1.4 seconds
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1400);
    return () => clearInterval(msgInterval);
  }, []);

  // Smooth progress increment from 0 to 100
  useEffect(() => {
    const duration = 2800; // Total loading duration in ms
    const intervalTime = 30; // 33 frames per second
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) {
            // Slight delay at 100% for premium transition feel
            setTimeout(onComplete, 400);
          }
          return 100;
        }
        // Organic organic pacing with subtle random variance
        const next = prev + step + (Math.random() - 0.45) * 1.5;
        return Math.min(next, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Create subtle floating particles
  const particles = [
    { id: 1, size: 2, top: '15%', left: '10%', duration: 18, delay: -2 },
    { id: 2, size: 3, top: '25%', left: '85%', duration: 24, delay: -5 },
    { id: 3, size: 2, top: '75%', left: '12%', duration: 20, delay: -12 },
    { id: 4, size: 4, top: '80%', left: '78%', duration: 28, delay: -8 },
    { id: 5, size: 2, top: '40%', left: '92%', duration: 16, delay: -1 },
    { id: 6, size: 3, top: '65%', left: '5%', duration: 22, delay: -15 },
    { id: 7, size: 2, top: '10%', left: '50%', duration: 19, delay: -4 },
    { id: 8, size: 3, top: '85%', left: '40%', duration: 26, delay: -7 },
  ];

  const displayPercent = Math.floor(progress);

  return (
    <div 
      id="campusplace_loader"
      className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center font-sans relative overflow-hidden select-none p-6"
    >
      {/* Premium Background Gradients and Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Micro Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-400/20"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, 12, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main card panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.02, y: -15 }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        className="w-full max-w-[480px] bg-[#1E293B]/40 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 md:p-10 space-y-8 relative z-10"
      >
        {/* Subtle decorative gold-blue top ambient accent bar */}
        <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />

        {/* 1. Elegant Logo Block */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="relative flex items-center justify-center mb-5"
          >
            {/* Pulsing Outer Glow */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl animate-pulse" />
            
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(37,99,235,0.15)",
                  "0 0 40px rgba(37,99,235,0.35)",
                  "0 0 20px rgba(37,99,235,0.15)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-16 h-16 bg-[#0F172A] border border-slate-700/50 rounded-2xl flex items-center justify-center z-10"
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Clean geometric interlocking Cap + Opportunity emblem */}
                <path 
                  d="M12 2L2 7L12 12L22 7L12 2Z" 
                  stroke="#2563EB" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="rgba(37,99,235,0.06)"
                />
                <path 
                  d="M5 12V17C5 18.1 8.1 19 12 19C15.9 19 19 18.1 19 17V12" 
                  stroke="#FBBF24" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none"
                />
                <path 
                  d="M12 12V22" 
                  stroke="#2563EB" 
                  strokeWidth="1.5" 
                  strokeDasharray="2 2"
                />
                <circle cx="12" cy="12" r="2" fill="#FBBF24" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Core App branding titles */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center space-y-1.5"
          >
            <h1 className="text-3xl font-bold text-white tracking-wider font-sans">
              Campus<span className="text-blue-500">Place</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium tracking-widest uppercase">
              Connecting Talent with Opportunity
            </p>
          </motion.div>
        </div>

        {/* 2. Interactive Network Map */}
        <div className="relative w-full h-[220px] mx-auto select-none bg-[#0F172A]/50 rounded-xl border border-slate-800/50 p-4 overflow-hidden">
          {/* Subtle grid mesh in background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

          {/* SVG for network links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 220">
            <defs>
              <linearGradient id="line-pulse-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="1" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="line-pulse-gold" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="1" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Static understated connection lines */}
            <line x1="160" y1="35" x2="60" y2="120" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="160" y1="35" x2="260" y2="120" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="60" y1="120" x2="260" y2="120" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="60" y1="120" x2="160" y2="185" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="260" y1="120" x2="160" y2="185" stroke="#1E293B" strokeWidth="1.5" />

            {/* High-speed glowing line pulses */}
            {/* Student -> Portal */}
            <motion.line
              x1="160" y1="35" x2="60" y2="120"
              stroke="url(#line-pulse-blue)" strokeWidth="2" strokeDasharray="25 100"
              animate={{ strokeDashoffset: [0, -125] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            />
            {/* Student -> Company */}
            <motion.line
              x1="160" y1="35" x2="260" y2="120"
              stroke="url(#line-pulse-gold)" strokeWidth="2" strokeDasharray="30 110"
              animate={{ strokeDashoffset: [0, -140] }}
              transition={{ repeat: Infinity, duration: 2.1, ease: "linear" }}
            />
            {/* Portal -> Company */}
            <motion.line
              x1="60" y1="120" x2="260" y2="120"
              stroke="url(#line-pulse-blue)" strokeWidth="2" strokeDasharray="40 160"
              animate={{ strokeDashoffset: [0, -200] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
            {/* Portal -> Admin */}
            <motion.line
              x1="60" y1="120" x2="160" y2="185"
              stroke="url(#line-pulse-blue)" strokeWidth="2" strokeDasharray="20 90"
              animate={{ strokeDashoffset: [0, -110] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
            {/* Company -> Admin */}
            <motion.line
              x1="260" y1="120" x2="160" y2="185"
              stroke="url(#line-pulse-gold)" strokeWidth="2" strokeDasharray="20 90"
              animate={{ strokeDashoffset: [0, -110] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            />
          </svg>

          {/* Student Node */}
          <div className="absolute left-[160px] top-[35px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-sm animate-ping" style={{ animationDuration: '3s' }} />
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-blue-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.3)]">
                <GraduationCap className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <span className="mt-1 text-[8px] font-mono text-slate-400 font-bold bg-[#0F172A] px-1 py-0.5 rounded border border-slate-800">
              STUDENT
            </span>
          </div>

          {/* CampusPlace central node (representing connection hub) */}
          <div className="absolute left-[60px] top-[120px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-sm animate-ping" style={{ animationDuration: '2.5s' }} />
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <span className="mt-1 text-[8px] font-mono text-slate-400 font-bold bg-[#0F172A] px-1 py-0.5 rounded border border-slate-800">
              PORTAL
            </span>
          </div>

          {/* Company Node */}
          <div className="absolute left-[260px] top-[120px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-sm animate-ping" style={{ animationDuration: '3.2s' }} />
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-blue-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.3)]">
                <Building className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <span className="mt-1 text-[8px] font-mono text-slate-400 font-bold bg-[#0F172A] px-1 py-0.5 rounded border border-slate-800">
              RECRUITER
            </span>
          </div>

          {/* Admin Node */}
          <div className="absolute left-[160px] top-[185px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-sm animate-ping" style={{ animationDuration: '2.8s' }} />
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-blue-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.3)]">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <span className="mt-1 text-[8px] font-mono text-slate-400 font-bold bg-[#0F172A] px-1 py-0.5 rounded border border-slate-800">
              ADMIN / TPO
            </span>
          </div>
        </div>

        {/* 3. Horizontal Progress & Percentage Display */}
        <div className="space-y-4">
          <div className="relative">
            {/* Modern horizontal loading bar */}
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-[1px] border border-slate-700/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <motion.div 
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-amber-400 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Bottom telemetry with dynamic message & percentage */}
          <div className="flex items-center justify-between font-mono">
            <div className="h-5 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="text-slate-400 text-xs tracking-wide"
                >
                  {messages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <span className="text-sm font-bold text-blue-400 tracking-wider">
              {displayPercent}%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
