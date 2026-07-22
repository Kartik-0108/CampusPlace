import React, { useState, useEffect } from 'react';
import { api, saveToken } from '../api.ts';
import { User } from '../types.ts';
import { 
  Shield, 
  BookOpen, 
  Building, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  TrendingUp, 
  Briefcase, 
  Users, 
  Award, 
  Sun, 
  Moon,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
}

export default function AuthScreen({ onAuthSuccess, isLightMode = false, onToggleTheme }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration States
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'company' | 'admin'>('student');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [cgpa, setCgpa] = useState('');
  const [tenthPercentage, setTenthPercentage] = useState('');
  const [twelfthPercentage, setTwelfthPercentage] = useState('');
  const [backlogs, setBacklogs] = useState('0');
  
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoUsers = [
    { email: 'admin@college.edu', label: 'TPO Officer (Admin)', icon: Shield, tag: 'ADMIN' },
    { email: 'john.doe@gmail.com', label: 'John (Student - Unplaced)', icon: BookOpen, tag: 'STUDENT' },
    { email: 'priya.patel@gmail.com', label: 'Priya (Student - Placed)', icon: GraduationCap, tag: 'STUDENT' },
    { email: 'hr@google.com', label: 'Google Recruiter (Company)', icon: Building, tag: 'RECRUITER' },
    { email: 'talent@infosys.com', label: 'Infosys (Pending Approval)', icon: Building, tag: 'RECRUITER' }
  ];

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    if (!loginEmail) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.login(loginEmail, customEmail ? 'password' : password);
      if (res.success) {
        saveToken(res.user.id);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'ACCESS_DENIED. INVALID_CREDENTIALS.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload: any = { email, password, name, role };
      
      if (role === 'student') {
        payload.studentData = {
          rollNumber,
          department,
          cgpa: parseFloat(cgpa),
          tenthPercentage: parseFloat(tenthPercentage) || 0,
          twelfthPercentage: parseFloat(twelfthPercentage) || 0,
          backlogs: parseInt(backlogs) || 0
        };
      } else if (role === 'company') {
        payload.companyData = {
          industry,
          website,
          location,
          description: description || 'New company registration'
        };
      }
      
      const res = await api.register(payload);
      if (res.success) {
        saveToken(res.user.id);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'REGISTRATION_FAILED. SYSTEM_ERROR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth_screen_container" 
      className="min-h-screen bg-[#030704] flex flex-col items-center justify-center font-sans selection:bg-emerald-950 selection:text-emerald-300 crt-container pixel-grid text-emerald-400 p-4 md:p-6 theme-light:bg-slate-50 theme-light:text-slate-800 relative"
    >
      
      {/* Floating Top Right Header Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-full bg-[#060c08] border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 transition-all flex items-center justify-center text-xs font-sans theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-700 theme-light:hover:bg-slate-100 shadow-sm"
            title="Toggle Theme"
          >
            {isLightMode ? (
              <Moon size={18} className="text-indigo-600" />
            ) : (
              <Sun size={18} className="text-amber-400" />
            )}
          </button>
        )}
      </div>

      <div className="w-full max-w-[480px] flex flex-col justify-center items-center py-10 relative">
        
        {/* Form Container Wrapper */}
        <div className="w-full space-y-8 bg-[#060c08]/90 p-6 md:p-8 rounded-2xl border-2 border-emerald-500/25 shadow-[0_0_40px_rgba(16,185,129,0.06)] relative theme-light:bg-white theme-light:border-slate-200 theme-light:shadow-2xl">
          
          {/* Form Header branding */}
          <div className="text-center">
            <div className="relative mx-auto w-14 h-14 bg-emerald-950/40 rounded-2xl border-2 border-emerald-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] theme-light:bg-indigo-50 theme-light:border-indigo-200 theme-light:shadow-none">
              <GraduationCap size={28} className="text-emerald-400 theme-light:text-indigo-600 relative z-10" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#060c08] shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse theme-light:border-white theme-light:bg-indigo-500" />
            </div>
             <h2 className="text-2xl font-mono font-bold text-emerald-300 tracking-wider uppercase theme-light:text-slate-800">
              {isRegistering ? 'Create Account' : 'Secure Sign In'}
            </h2>
            <p className="mt-1 text-xs font-mono text-emerald-500/60 uppercase tracking-widest theme-light:text-slate-400">
              {isRegistering ? 'Configure your CampusPlace profile' : 'Access your personalized workspace'}
            </p>
          </div>

          {/* Sliding Authenticate vs Register Switch */}
          <div className="flex bg-[#040805] p-1 rounded-xl border border-emerald-500/20 theme-light:bg-slate-100 theme-light:border-slate-200">
            <button
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-2.5 font-mono text-xs font-semibold rounded-lg uppercase tracking-wider transition-all ${!isRegistering ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_2px_8px_rgba(0,0,0,0.4)] theme-light:bg-white theme-light:text-slate-800 theme-light:border-slate-200 theme-light:shadow-sm' : 'text-emerald-500/50 hover:text-emerald-400 theme-light:text-slate-400 theme-light:hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-2.5 font-mono text-xs font-semibold rounded-lg uppercase tracking-wider transition-all ${isRegistering ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_2px_8px_rgba(0,0,0,0.4)] theme-light:bg-white theme-light:text-slate-800 theme-light:border-slate-200 theme-light:shadow-sm' : 'text-emerald-500/50 hover:text-emerald-400 theme-light:text-slate-400 theme-light:hover:text-slate-700'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-400 text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span>Authentication Error: {error}</span>
            </div>
          )}

          {/* Form blocks */}
          {!isRegistering ? (
            <form onSubmit={(e) => handleLogin(e)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-emerald-400/80 theme-light:text-slate-600 font-semibold uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus className="h-4 w-4 text-emerald-500/40 theme-light:text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@college.edu or name@company.com"
                      className="w-full pl-10 pr-4 py-3 font-mono text-sm border border-emerald-500/20 rounded-xl focus:border-emerald-400 bg-[#040805] text-emerald-300 outline-none transition-all placeholder:text-emerald-950/40 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800 theme-light:placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-emerald-400/80 theme-light:text-slate-600 font-semibold uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-emerald-500/40 theme-light:text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 font-mono text-sm border border-emerald-500/20 rounded-xl focus:border-emerald-400 bg-[#040805] text-emerald-300 outline-none transition-all placeholder:text-emerald-950/40 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800 theme-light:placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full pixel-btn-primary py-3.5 px-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 font-mono text-xs uppercase tracking-wider theme-light:bg-indigo-600 theme-light:hover:bg-indigo-700 theme-light:text-white theme-light:border-indigo-500 mt-2"
              >
                {loading ? 'Signing In...' : (
                  <>
                    <span>Access Placement Portal</span>
                    <LogIn size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-emerald-400/80 theme-light:text-slate-600 font-semibold uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full px-4 py-2.5 font-mono text-sm border border-emerald-500/20 rounded-xl focus:border-emerald-400 bg-[#040805] text-emerald-300 outline-none transition-all placeholder:text-emerald-950/30 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800 theme-light:placeholder:text-slate-300"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-emerald-400/80 theme-light:text-slate-600 font-semibold uppercase tracking-wider">Secure Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjun@college.edu"
                    className="w-full px-4 py-2.5 font-mono text-sm border border-emerald-500/20 rounded-xl focus:border-emerald-400 bg-[#040805] text-emerald-300 outline-none transition-all placeholder:text-emerald-950/30 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800 theme-light:placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-emerald-400/80 theme-light:text-slate-600 font-semibold uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 font-mono text-sm border border-emerald-500/20 rounded-xl focus:border-emerald-400 bg-[#040805] text-emerald-300 outline-none transition-all placeholder:text-emerald-950/30 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800 theme-light:placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-emerald-400/80 theme-light:text-slate-600 font-semibold uppercase tracking-wider">Access Profile Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 font-mono text-xs rounded-xl border transition-all ${role === 'student' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.15)] theme-light:bg-indigo-50 theme-light:border-indigo-500 theme-light:text-indigo-600' : 'bg-[#020503] border-emerald-500/15 text-emerald-500/40 hover:text-emerald-400 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-500 theme-light:hover:text-slate-700'}`}
                  >
                    <BookOpen size={14} />
                    Student Scholar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('company')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 font-mono text-xs rounded-xl border transition-all ${role === 'company' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.15)] theme-light:bg-indigo-50 theme-light:border-indigo-500 theme-light:text-indigo-600' : 'bg-[#020503] border-emerald-500/15 text-emerald-500/40 hover:text-emerald-400 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-500 theme-light:hover:text-slate-700'}`}
                  >
                    <Building size={14} />
                    Corporate Recruiter
                  </button>
                </div>
              </div>

              {role === 'student' && (
                <div className="space-y-4 p-4 rounded-xl border border-emerald-500/20 bg-[#040805] theme-light:bg-slate-50 theme-light:border-slate-200">
                  <div className="text-[10px] font-mono font-bold text-emerald-500/50 uppercase tracking-widest border-b border-emerald-500/10 pb-1.5 theme-light:border-slate-200 theme-light:text-slate-500">
                    Academic Specs
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-emerald-400/80 theme-light:text-slate-600">Roll Number</label>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="CS202305"
                        className="w-full px-3 py-2 font-mono text-xs border border-emerald-500/10 rounded-lg focus:border-emerald-400 bg-[#020503] text-emerald-300 outline-none theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-emerald-400/80 theme-light:text-slate-600">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 font-mono text-xs border border-emerald-500/10 rounded-lg focus:border-emerald-400 bg-[#020503] text-emerald-300 outline-none theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800"
                      >
                        <option>Computer Science</option>
                        <option>Information Technology</option>
                        <option>Electronics</option>
                        <option>Mechanical</option>
                        <option>Civil</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-emerald-400/80 theme-light:text-slate-600 font-semibold">Cumulative CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        placeholder="e.g. 8.50"
                        className="w-full px-3 py-2 font-mono text-xs border border-emerald-500/10 rounded-lg focus:border-emerald-400 bg-[#020503] text-emerald-300 outline-none theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-emerald-400/80 theme-light:text-slate-600">Active Backlogs</label>
                      <input
                        type="number"
                        min="0"
                        value={backlogs}
                        onChange={(e) => setBacklogs(e.target.value)}
                        className="w-full px-3 py-2 font-mono text-xs border border-emerald-500/10 rounded-lg focus:border-emerald-400 bg-[#020503] text-emerald-300 outline-none theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'company' && (
                <div className="space-y-4 p-4 rounded-xl border border-emerald-500/20 bg-[#040805] theme-light:bg-slate-50 theme-light:border-slate-200">
                  <div className="text-[10px] font-mono font-bold text-emerald-500/50 uppercase tracking-widest border-b border-emerald-500/10 pb-1.5 theme-light:border-slate-200 theme-light:text-slate-500">
                    Recruiter Sourcing Details
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-emerald-400/80 theme-light:text-slate-600">Industry Sector</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. Technology"
                        className="w-full px-3 py-2 font-mono text-xs border border-emerald-500/10 rounded-lg focus:border-emerald-400 bg-[#020503] text-emerald-300 outline-none theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-emerald-400/80 theme-light:text-slate-600">Global HQ</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="San Francisco, CA"
                        className="w-full px-3 py-2 font-mono text-xs border border-emerald-500/10 rounded-lg focus:border-emerald-400 bg-[#020503] text-emerald-300 outline-none theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-emerald-400/80 theme-light:text-slate-600">Corporate URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full px-3 py-2 font-mono text-xs border border-emerald-500/10 rounded-lg focus:border-emerald-400 bg-[#020503] text-emerald-300 outline-none theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-800"
                      required
                    />
                  </div>
                   <p className="text-[10px] text-amber-500 font-mono flex items-center gap-1">
                    <span>⚠</span> Note: Your profile will be verified by the Training and Placement Officer (TPO).
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full pixel-btn-primary py-3.5 px-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 font-mono text-xs uppercase tracking-wider theme-light:bg-indigo-600 theme-light:hover:bg-indigo-700 theme-light:text-white theme-light:border-indigo-500 mt-4"
              >
                {loading ? 'Setting up profile...' : (
                  <>
                    <span>Create Profile</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Bypass / Debug access console (Development / Sandbox Only) */}
          {import.meta.env.DEV && (
            <div className="pt-6 border-t border-emerald-500/10 mt-6 theme-light:border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 shadow-[0_0_8px_rgba(16,185,129,0.15)] theme-light:bg-indigo-50 theme-light:text-indigo-600 theme-light:border-indigo-100 theme-light:shadow-none">
                  <Sparkles size={11} />
                </span>
                <span className="text-[10.5px] font-mono font-bold text-emerald-300 tracking-wider uppercase theme-light:text-slate-600">Quick Access Demo Profiles (Sandbox)</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                {demoUsers.map((user) => {
                  const IconComp = user.icon;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      key={user.email}
                      onClick={() => handleLogin(undefined, user.email)}
                      className="text-left p-3 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-950/20 flex items-center gap-3 transition-all group bg-[#020503] theme-light:bg-slate-50 theme-light:border-slate-200 theme-light:hover:bg-slate-100/70"
                    >
                      <div className="w-8 h-8 rounded bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-500/50 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors shrink-0 theme-light:bg-white theme-light:border-slate-200 theme-light:text-slate-500">
                        <IconComp size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-[9px] text-emerald-500/40 uppercase tracking-wider font-mono font-bold truncate group-hover:text-emerald-400 transition-colors theme-light:text-slate-400">{user.label.split('(')[0].trim()}</p>
                          <span className="text-[7.5px] font-mono px-1 rounded border border-emerald-500/15 text-emerald-500/50 shrink-0 theme-light:border-slate-200 theme-light:text-slate-400 font-bold">{user.tag}</span>
                        </div>
                        <p className="text-xs font-medium text-emerald-300 truncate theme-light:text-slate-600">{user.email}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Small copyright footer */}
        <div className="mt-8 text-center text-[10px] font-mono text-emerald-500/30 uppercase tracking-widest theme-light:text-slate-400">
          CampusPlace v2.0 // Centralized Placement Portal // © 2026
        </div>

      </div>

    </div>
  );
}
