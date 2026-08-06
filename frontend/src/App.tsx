import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { User } from './types.ts';
import { api, getSavedToken, removeToken, saveToken } from './api.ts';
import AuthScreen from './components/AuthScreen.tsx';
import StudentDashboard from './components/StudentDashboard.tsx';
import CompanyDashboard from './components/CompanyDashboard.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import NotificationBell from './components/NotificationBell.tsx';
import MainframeLoading from './components/MainframeLoading.tsx';
import ThemeTransition from './components/ThemeTransition.tsx';
import { getFirebaseInitError } from './services/gmail.ts';
import { LogOut, Shield, BookOpen, Building, RefreshCw, Sparkles, Sliders, ArrowRight, Sun, Moon, GraduationCap, UserX } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSandbox, setShowSandbox] = useState(false);

  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== null ? saved === 'light' : true; // Default to light mode
  });

  const toggleTheme = (e?: React.MouseEvent) => {
    const isLight = !isLightMode;
    
    if (!document.startViewTransition) {
      setIsLightMode(isLight);
      return;
    }

    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const right = window.innerWidth - x;
    const bottom = window.innerHeight - y;
    const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
    document.documentElement.style.setProperty('--r', `${maxRadius}px`);
    
    document.documentElement.classList.remove('theme-transitioning-to-light', 'theme-transitioning-to-dark');
    document.documentElement.classList.add(isLight ? 'theme-transitioning-to-light' : 'theme-transitioning-to-dark');

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsLightMode(isLight);
      });
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transitioning-to-light', 'theme-transitioning-to-dark');
    });
  };

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const checkSession = async () => {
    const token = getSavedToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      } else {
        removeToken();
        setLoading(false);
      }
    } catch (err) {
      console.error('Session check failed', err);
      removeToken();
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogout = () => {
    removeToken();
    setUser(null);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError("Please type 'DELETE' to confirm.");
      return;
    }
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await api.deleteAccount();
      if (res.success) {
        removeToken();
        setUser(null);
        setShowDeleteModal(false);
        setDeleteConfirmationText('');
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSandboxSwitch = (userId: string) => {
    saveToken(userId);
    setLoading(true);
    api.getMe()
      .then(res => {
        if (res.success) {
          setUser(res.user);
        }
      })
      .catch(err => {
        console.error('Failed to quick switch user', err);
      })
      .finally(() => {
        setLoading(false);
        setShowSandbox(false);
      });
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setLoading(true);
  };

  if (loading) {
    return <MainframeLoading onComplete={() => setLoading(false)} />;
  }

  if (!user) {
    const firebaseError = getFirebaseInitError();
    return (
      <div className="min-h-screen bg-[#030704] text-emerald-300 flex flex-col font-sans crt-container pixel-grid">
        {firebaseError && (
          <div className="bg-amber-950/20 theme-light:bg-amber-50 border-b border-amber-500/20 theme-light:border-amber-200 px-4 py-2.5 text-center text-xs text-amber-400 theme-light:text-amber-800 flex items-center justify-center gap-2 font-mono relative z-50">
            <span>⚠️ <b>Firebase System Notice:</b> {firebaseError}</span>
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <AuthScreen 
            onAuthSuccess={handleAuthSuccess} 
            isLightMode={isLightMode}
            onToggleTheme={toggleTheme}
          />
        </div>
      </div>
    );
  }

  // Preset quick switch user listing
  const sandboxPresets = [
    { id: 'usr_admin1', label: 'TPO Officer (Admin)', role: 'admin', icon: Shield, bg: 'hover:bg-rose-50/50' },
    { id: 'usr_stud1', label: 'John (Student - Unplaced)', role: 'student', icon: BookOpen, bg: 'hover:bg-emerald-50/50' },
    { id: 'usr_stud2', label: 'Priya (Student - Placed)', role: 'student', icon: BookOpen, bg: 'hover:bg-blue-50/50' },
    { id: 'usr_comp1', label: 'Google Recruiter (Company)', role: 'company', icon: Building, bg: 'hover:bg-amber-50/50' },
    { id: 'usr_comp4', label: 'Infosys (Unapproved Recruiter)', role: 'company', icon: Building, bg: 'hover:bg-slate-100' }
  ];

  const firebaseError = getFirebaseInitError();

  return (
    <div className="min-h-screen bg-[#030704] text-emerald-300 flex flex-col font-sans crt-container pixel-grid">
      {firebaseError && (
        <div className="bg-amber-950/20 theme-light:bg-amber-50 border-b border-amber-500/20 theme-light:border-amber-200 px-4 py-2.5 text-center text-xs text-amber-400 theme-light:text-amber-800 flex items-center justify-center gap-2 font-mono relative z-50">
          <span>⚠️ <b>Firebase System Notice:</b> {firebaseError}</span>
        </div>
      )}
      {/* Header bar */}
      <header className="bg-[#050a06]/90 backdrop-blur-md border-b-2 border-emerald-500/25 sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 bg-emerald-950/40 rounded-lg border border-emerald-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)] theme-light:bg-indigo-50 theme-light:border-indigo-200 theme-light:shadow-none">
              <GraduationCap size={16} className="text-emerald-400 theme-light:text-indigo-600 relative z-10" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-[1.5px] border-[#050a06] shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse theme-light:border-white theme-light:bg-indigo-500" />
            </div>
            <div>
              <span className="font-display font-semibold text-emerald-400 text-lg tracking-wider block text-glow-green">CampusPlace</span>
              <span className="text-[9px] text-emerald-500/50 block font-mono -mt-1 tracking-widest uppercase">Verified Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            <button
              onClick={toggleTheme}
              className="p-1.5 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-950/40 rounded transition-colors border border-transparent hover:border-emerald-500/20"
              title="Toggle Theme"
            >
              {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Quick Switch Button (Development / Sandbox Only) */}
            {import.meta.env.DEV && (
              <div className="relative">
                <button
                  id="sandbox_switch_btn"
                  onClick={() => setShowSandbox(!showSandbox)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080f0a] border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 text-emerald-400 font-medium text-xs rounded shadow-sm transition-all active:scale-[0.98]"
                >
                  <Sliders size={14} className="text-emerald-500" />
                  <span className="tracking-wider">Portal Switch</span>
                </button>

                {showSandbox && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#050a06] border-2 border-emerald-500/40 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] p-2 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 pb-2 border-b border-emerald-500/20 mb-2">
                      <span className="text-xs font-semibold text-emerald-300 block tracking-wider font-display uppercase">Sandbox Access</span>
                      <span className="text-[10px] text-emerald-500/60 font-mono">Bypass auth for demo user profiles.</span>
                    </div>
                    <div className="space-y-1">
                      {sandboxPresets.map(preset => {
                        const IconComp = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handleSandboxSwitch(preset.id)}
                            className="w-full text-left p-2 rounded flex items-center justify-between group text-xs transition-all hover:bg-emerald-950/30 text-emerald-400 border border-transparent hover:border-emerald-500/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-emerald-950/50 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors border border-emerald-500/10">
                                <IconComp size={12} />
                              </div>
                              <div>
                                <span className="font-medium text-emerald-200 block">{preset.label}</span>
                                <span className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-mono block">{preset.role}</span>
                              </div>
                            </div>
                            <ArrowRight size={12} className="text-emerald-500/40 group-hover:text-emerald-400 transition-all group-hover:translate-x-1" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            <NotificationBell userId={user.id} />

            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-semibold text-emerald-300">{user.name}</span>
              <span className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-wider">{user.role}</span>
            </div>

            <button
              id="delete_account_btn"
              onClick={() => {
                setDeleteConfirmationText('');
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="p-1.5 text-rose-500 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors border border-transparent hover:border-rose-500/20 mr-1"
              title="Delete Account"
            >
              <UserX size={16} />
            </button>

            <button
              id="logout_btn"
              onClick={handleLogout}
              className="p-1.5 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-950/40 rounded transition-colors border border-transparent hover:border-emerald-500/20"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'student' && <StudentDashboard userId={user.id} onProfileUpdated={checkSession} />}
        {user.role === 'company' && <CompanyDashboard userId={user.id} />}
        {user.role === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer bar */}
      <footer className="bg-[#050a06]/90 border-t-2 border-emerald-500/25 mt-auto relative z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-5 h-5 bg-emerald-950/40 rounded border border-emerald-500/50 flex items-center justify-center theme-light:bg-indigo-50 theme-light:border-indigo-200">
              <GraduationCap size={11} className="text-emerald-400 theme-light:text-indigo-600" />
            </div>
            <span className="font-mono text-[11px] text-emerald-400 theme-light:text-indigo-600 tracking-wider uppercase text-glow-green">
              CampusPlace // Training & Placement Office
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-mono text-[10px] text-emerald-500/50">
            <span>© 2026 University Placement Cell. All rights reserved.</span>
            <span className="hidden sm:inline text-emerald-500/20">•</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400/80 font-medium">SECURE GATEWAY ACTIVE</span>
            </div>
          </div>
        </div>
      </footer>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white theme-light:bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl max-w-md w-full p-6 space-y-6 relative not-theme-light:bg-slate-950 not-theme-light:text-slate-100 not-theme-light:border-emerald-500/30">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-rose-600 flex items-center gap-2">
                <UserX size={24} />
                Delete Account Permanently
              </h3>
              <p className="text-sm text-slate-500 not-theme-light:text-slate-400">
                This action is entirely irreversible. Deleting your account will permanently remove your profile, applications, posted jobs, and all other associated data from our systems.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 not-theme-light:text-slate-400">
                Type <span className="font-mono text-rose-600 font-bold bg-rose-50 px-1 py-0.5 rounded">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-md p-2 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm font-mono tracking-widest uppercase"
                disabled={isDeleting}
              />
              {deleteError && (
                <p className="text-xs text-rose-600 font-medium">
                  ⚠️ {deleteError}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 not-theme-light:border-emerald-500/10">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors not-theme-light:bg-emerald-950/40 not-theme-light:text-emerald-400 not-theme-light:hover:bg-emerald-900/30"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shadow-sm flex items-center gap-2"
                disabled={isDeleting || deleteConfirmationText !== 'DELETE'}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
