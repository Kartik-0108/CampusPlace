import React from 'react';
import { Briefcase, Calendar, Award, Sparkles, Target, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { GlowCard } from './ui/spotlight-card.tsx';

interface WidgetsProps {
  loading: boolean;
  appliedCount: number;
  interviewsCount: number;
  offersCount: number;
}

export default function DashboardWidgets({ loading, appliedCount, interviewsCount, offersCount }: WidgetsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#050a06] border border-emerald-500/10 p-6 rounded-xl md:col-span-2 row-span-2 h-48 animate-pulse"></div>
        <div className="bg-[#050a06] border border-emerald-500/10 p-6 rounded-xl md:col-span-2 animate-pulse h-24"></div>
        <div className="bg-[#050a06] border border-emerald-500/10 p-6 rounded-xl md:col-span-1 animate-pulse h-24"></div>
        <div className="bg-[#050a06] border border-emerald-500/10 p-6 rounded-xl md:col-span-1 animate-pulse h-24"></div>
      </div>
    );
  }

  const successRate = appliedCount > 0 ? Math.round((offersCount / appliedCount) * 100) : 0;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
    >
      {/* Box 1: Total Applied (Large Block using GlowCard) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-2 row-span-2 h-full min-h-[180px]">
        <GlowCard customSize={true} className="h-full bg-[#060c08] border-2 border-emerald-500/20 !p-6 flex flex-col justify-between text-emerald-400 relative overflow-hidden" glowColor="blue">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 pointer-events-none">
            <Briefcase size={120} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-emerald-500/60 uppercase tracking-widest block">&gt; APPLICATIONS_SUBMITTED</span>
            <div className="mt-4">
              <span className="text-6xl font-display font-bold text-emerald-300 tracking-wider block mb-1 text-glow-green">{appliedCount}</span>
              <span className="text-xs text-emerald-500/80 font-mono block">Registered job portal nodes</span>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Box 2: Offers / Success Rate (using GlowCard) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-2 h-full">
        <GlowCard customSize={true} className="h-full bg-[#060c08] border-2 border-emerald-500/20 !p-6 flex flex-col justify-between text-emerald-400" glowColor="green">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-emerald-500/60 uppercase tracking-widest block">&gt; OFFERS_RECEIVED</span>
            <Award size={20} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2">
            <span className="text-4xl font-display font-bold text-emerald-300 tracking-wider text-glow-strong">{offersCount}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-500/10 flex justify-between items-center font-mono">
            <span className="text-xs text-emerald-500/60">CONVERSION_RATE:</span>
            <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-sm text-emerald-300">{successRate}%</span>
          </div>
        </GlowCard>
      </motion.div>

      {/* Box 3: Interviews Scheduled (Using GlowCard) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-1 h-full">
        <GlowCard customSize={true} className="h-full bg-[#060c08] border-2 border-emerald-500/20 !p-6 flex flex-col justify-between text-emerald-400" glowColor="orange">
          <span className="text-xs font-mono font-bold text-emerald-500/60 uppercase tracking-widest block">&gt; INTERVIEWS</span>
          <div className="flex items-center gap-2 mt-2">
            <Calendar size={18} className="text-emerald-500" />
            <span className="text-3xl font-display font-bold text-emerald-300 tracking-wider text-glow-green">{interviewsCount}</span>
          </div>
          <span className="text-xs text-emerald-500/50 font-mono mt-2 block">Pending Schedule</span>
        </GlowCard>
      </motion.div>

      {/* Box 4: Activity Status (Using GlowCard) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-1 h-full">
        <GlowCard customSize={true} className="h-full bg-[#060c08] border-2 border-emerald-500/20 !p-6 flex flex-col justify-between text-emerald-400" glowColor="purple">
          <span className="text-xs font-mono font-bold text-emerald-500/60 uppercase tracking-widest block">&gt; PORTAL_STATUS</span>
          <div className="flex items-center gap-2 mt-2">
            <Activity size={18} className="text-emerald-400 animate-pulse" />
            <span className="text-xl font-display font-bold text-emerald-300 tracking-wider text-glow-green">ONLINE</span>
          </div>
          <span className="text-xs text-emerald-500/50 font-mono mt-2 block">TPO Link Sync active</span>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
