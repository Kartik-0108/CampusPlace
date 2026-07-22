import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal } from 'lucide-react';

interface ThemeTransitionProps {
  isLightMode: boolean;
}

export default function ThemeTransition({ isLightMode }: ThemeTransitionProps) {
  const [show, setShow] = useState(false);
  const [transitionTheme, setTransitionTheme] = useState(isLightMode);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip the very first initial page load transition to keep startup instant
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Trigger the high-tech wipe animation on theme change
    setShow(true);
    setTransitionTheme(isLightMode);

    // Keep it fast and sleek (650ms total) so it remains snappy
    const timer = setTimeout(() => {
      setShow(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [isLightMode]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="theme_transition_overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
        >
          {/* Animated scanning laser line sweep */}
          <motion.div
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`absolute left-0 right-0 h-[6px] opacity-90 blur-[1px] shadow-[0_0_20px_rgba(16,185,129,0.8)] z-50 ${
              transitionTheme 
                ? 'bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.8)]' 
                : 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.8)]'
            }`}
          />

          {/* Fullscreen swipe shutter panels */}
          <div className="absolute inset-0 flex flex-col">
            {/* Top Shutter */}
            <motion.div
              initial={{ height: '0%' }}
              animate={{ height: ['0%', '50%', '50%', '0%'] }}
              transition={{ 
                duration: 0.6, 
                times: [0, 0.3, 0.7, 1], 
                ease: "easeInOut" 
              }}
              className={`w-full ${
                transitionTheme 
                  ? 'bg-slate-900 border-b border-indigo-500/30' 
                  : 'bg-slate-950 border-b border-emerald-500/30'
              }`}
            />
            {/* Bottom Shutter */}
            <motion.div
              initial={{ height: '0%' }}
              animate={{ height: ['0%', '50%', '50%', '0%'] }}
              transition={{ 
                duration: 0.6, 
                times: [0, 0.3, 0.7, 1], 
                ease: "easeInOut" 
              }}
              className={`w-full ${
                transitionTheme 
                  ? 'bg-slate-900 border-t border-indigo-500/30' 
                  : 'bg-slate-950 border-t border-emerald-500/30'
              }`}
            />
          </div>

          {/* Centered High Tech Telemetry Badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 1, 0.9], opacity: [0, 1, 1, 0] }}
              transition={{ 
                duration: 0.6, 
                times: [0, 0.2, 0.7, 1], 
                ease: "easeOut" 
              }}
              className={`px-5 py-2.5 rounded-xl border font-mono text-xs flex items-center gap-2.5 shadow-2xl ${
                transitionTheme
                  ? 'bg-slate-950 text-indigo-400 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
                  : 'bg-[#060c08] text-emerald-400 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
              }`}
            >
              <Terminal size={14} className="animate-pulse" />
              <div className="flex flex-col">
                <span className="font-bold tracking-widest uppercase">
                  {transitionTheme ? 'MUTATING_LIGHT_SPECTRUM' : 'RECONFIGURING_DARK_CONTRAST'}
                </span>
                <span className="text-[9px] opacity-60">
                  {transitionTheme ? 'SYS_MODE: LIGHT_THEME_INIT' : 'SYS_MODE: DARK_THEME_INIT'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Matrix noise grid backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.15, 0] }}
            transition={{ duration: 0.6, times: [0, 0.25, 0.75, 1] }}
            className={`absolute inset-0 z-10 ${
              transitionTheme 
                ? 'bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:16px_16px]' 
                : 'bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:16px_16px]'
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
