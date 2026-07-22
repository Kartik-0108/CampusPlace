import React, { useState, useEffect } from 'react';
import { StudentProfile, Job, Application, Interview, CompanyProfile } from '../types.ts';
import { api } from '../api.ts';
import { BookOpen, MapPin, Award, CheckCircle2, AlertCircle, FileText, Plus, Trash2, Calendar, Link as LinkIcon, ExternalLink, RefreshCw, Trophy, Building, AlertOctagon, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { GlowCard } from './ui/spotlight-card.tsx';
import ApplicationViews from './ApplicationViews.tsx';
import DashboardWidgets from './DashboardWidgets.tsx';
import { initAuth, googleSignIn, logout, sendEmail, getAccessToken } from '../services/gmail.ts';

interface StudentDashboardProps {
  userId: string;
  onProfileUpdated?: () => void;
}

export default function StudentDashboard({ userId, onProfileUpdated }: StudentDashboardProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Profile Edit fields
  const [skillsInput, setSkillsInput] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [phone, setPhone] = useState('');

  // Gmail OAuth State
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'drives' | 'applications' | 'interviews' | 'profile'>('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await api.getStudentProfile(userId);
      if (pRes.success) {
        setProfile(pRes.student);
        setResumeUrl(pRes.student.resumeUrl || '');
      }

      const jRes = await api.getJobs();
      if (jRes.success) {
        setJobs(jRes.jobs);
      }

      const cRes = await api.getCompanies();
      if (cRes.success) {
        setCompanies(cRes.companies);
      }

      const aRes = await api.getApplications();
      if (aRes.success) {
        setApplications(aRes.applications);
      }

      const iRes = await api.getInterviews();
      if (iRes.success) {
        setInterviews(iRes.interviews);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        setGoogleUser(user);
      },
      () => {
        setNeedsAuth(true);
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGmailLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        setGoogleUser(result.user);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGmailLogout = async () => {
    await logout();
    setNeedsAuth(true);
    setGoogleUser(null);
  };

  const handleApply = async (jobId: string) => {
    setActionLoading(jobId);
    setError('');
    try {
      const res = await api.applyJob(jobId);
      if (res.success) {
        // Find company email to notify
        const appliedJob = jobs.find(j => j.id === jobId);
        const company = companies.find(c => c.userId === appliedJob?.companyId);

        if (company && !needsAuth && profile) {
           const confirmed = window.confirm(`Send application notification email to ${company.name} at ${company.email}?`);
           if (confirmed) {
              try {
                await sendEmail(
                  company.email,
                  `New Application for ${appliedJob?.title} from ${profile.name}`,
                  `Hello ${company.name} Recruiting Team,\n\nI have just submitted my application for the position of ${appliedJob?.title}.\n\nPlease review my profile and resume in your placement portal.\n\nBest regards,\n${profile.name}\n${profile.rollNumber} | ${profile.department}`
                );
                alert('Application submitted and email sent successfully!');
              } catch (emailErr) {
                console.error(emailErr);
                alert('Application submitted, but failed to send email. Please check your Gmail connection.');
              }
           } else {
               alert('Application submitted successfully! (Email skipped)');
           }
        } else {
           alert('Application submitted successfully!');
        }

        // Refresh application state
        const aRes = await api.getApplications();
        if (aRes.success) setApplications(aRes.applications);
        
        // Soft refresh profile (in case state changes)
        const pRes = await api.getStudentProfile(userId);
        if (pRes.success) setProfile(pRes.student);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to apply.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError('');
    try {
      const res = await api.updateStudentProfile(userId, {
        ...profile,
        resumeUrl
      });
      if (res.success) {
        setProfile(res.student);
        if (onProfileUpdated) onProfileUpdated();
        alert('Profile saved successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleAddSkill = () => {
    if (!profile || !skillsInput.trim()) return;
    const cleanSkill = skillsInput.trim();
    if (profile.skills.includes(cleanSkill)) return;

    const updatedSkills = [...profile.skills, cleanSkill];
    setProfile({ ...profile, skills: updatedSkills });
    setSkillsInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return;
    const updatedSkills = profile.skills.filter(s => s !== skillToRemove);
    setProfile({ ...profile, skills: updatedSkills });
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newProjectTitle.trim() || !newProjectDesc.trim()) return;

    const updatedProjects = [
      ...profile.projects,
      { title: newProjectTitle.trim(), description: newProjectDesc.trim(), url: newProjectUrl.trim() || undefined }
    ];

    setProfile({ ...profile, projects: updatedProjects });
    setNewProjectTitle('');
    setNewProjectDesc('');
    setNewProjectUrl('');
  };

  const handleRemoveProject = (index: number) => {
    if (!profile) return;
    const updatedProjects = profile.projects.filter((_, i) => i !== index);
    setProfile({ ...profile, projects: updatedProjects });
  };

  const checkEligibility = (job: Job): { eligible: boolean; reason?: string } => {
    if (!profile) return { eligible: false, reason: 'Profile missing' };
    
    if (profile.cgpa < job.cgpaCutoff) {
      return { eligible: false, reason: `CGPA (${profile.cgpa}) is below cutoff of ${job.cgpaCutoff}` };
    }
    if (profile.backlogs > job.backlogsAllowed) {
      return { eligible: false, reason: `Active backlogs (${profile.backlogs}) exceeds limit of ${job.backlogsAllowed}` };
    }
    return { eligible: true };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-indigo-600" size={32} />
          <span className="text-sm font-medium text-slate-500">Retrieving student profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-rose-50 rounded-xl border border-rose-100 text-rose-600">
        Profile data not found. Please log out and register again.
      </div>
    );
  }

  const isPlaced = profile.placedStatus === 'Placed';
  const appliedCount = applications.length;
  const selectedApp = applications.find(a => a.status === 'Placed');

  return (
    <div className="space-y-6">
      
      {/* Gmail OAuth Header Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Mail size={16} className="text-indigo-500" />
            Email Notifications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect your Gmail to send automated application emails to recruiters.
          </p>
        </div>
        <div>
          {needsAuth ? (
            <button 
              onClick={handleGmailLogin} 
              disabled={isLoggingIn}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
              {isLoggingIn ? 'Connecting...' : 'Connect Gmail'}
            </button>
          ) : (
            <button 
              onClick={handleGmailLogout}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-medium px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
              title={googleUser?.email}
            >
              <CheckCircle2 size={16} />
              Gmail Connected
            </button>
          )}
        </div>
      </div>

      {/* Celebration Header if Placed */}
      {isPlaced && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Trophy className="text-amber-300 animate-bounce" size={20} />
              <span className="font-semibold tracking-wider uppercase text-xs text-emerald-100">Congratulations {profile.name}! Placed Record Registered!</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Secured Offer at {profile.placementCompany}</h2>
            <p className="text-sm text-emerald-50 text-opacity-90 max-w-xl">
              Successfully recruited as a full-time candidate with an annual compensation package of <strong className="text-white font-semibold">{profile.placementPackage} LPA</strong>.
            </p>
          </div>
          <div className="hidden sm:block text-right bg-white/10 p-4 rounded-md border border-white/10">
            <span className="text-xs text-emerald-100 uppercase tracking-wider block font-semibold">Status</span>
            <span className="font-mono font-bold text-lg block mt-0.5">PLACED</span>
          </div>
        </motion.div>
      )}

      {/* Stats Cards (Bento Box) */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} 
           className="md:col-span-2 h-full min-h-[180px]">
<GlowCard customSize={true} glowColor="blue" className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-md flex flex-col justify-between text-slate-900 h-full">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
            <Award size={140} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <span className="text-sm font-semibold text-indigo-300 uppercase tracking-widest block">Placement Status</span>
            <div>
              <span className="text-5xl font-bold text-white tracking-tighter block mb-2">
                {isPlaced ? 'Placed' : 'Seeking Offers'}
              </span>
              <span className="text-sm text-slate-300 font-medium block">
                {isPlaced ? `Secured offer from ${profile.placementCompany}` : 'Actively applying for roles'}
              </span>
            </div>
          </div>
        </GlowCard>
</motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} 
           className="md:col-span-1 h-full">
<GlowCard customSize={true} glowColor="green" className="bg-white text-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">CGPA Detail</span>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">{profile.cgpa}</span>
            <span className="text-sm font-medium text-slate-500">/ 10.00</span>
          </div>
          <span className="text-xs text-indigo-600 font-medium mt-1">Dept: {profile.department}</span>
        </GlowCard>
</motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} 
           className="md:col-span-1 h-full">
<GlowCard customSize={true} glowColor="green" className="bg-white text-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Applications</span>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">{appliedCount}</span>
            <span className="text-sm font-medium text-slate-500">Submitted</span>
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-1">Active: {applications.filter(a => a.status !== 'Rejected' && a.status !== 'Placed').length}</span>
        </GlowCard>
</motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} 
           className="md:col-span-1 h-full">
<GlowCard customSize={true} glowColor="green" className="bg-white text-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Interviews</span>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              {interviews.filter(i => i.status === 'Scheduled').length}
            </span>
            <span className="text-sm font-medium text-slate-500">Scheduled</span>
          </div>
          <span className="text-xs text-indigo-500 font-medium mt-1">Awaiting rounds</span>
        </GlowCard>
</motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} 
           className="md:col-span-1 h-full">
<GlowCard customSize={true} glowColor="green" className="bg-white text-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Backlogs</span>
          <div className="my-2 flex items-baseline gap-1">
            <span className={`text-4xl font-bold tracking-tight ${profile.backlogs > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {profile.backlogs}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1">{profile.backlogs > 0 ? 'Eligibility Restricted' : 'Eligibility Cleared'}</span>
        </GlowCard>
</motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="flex overflow-x-auto [overflow-x-auto::-webkit-scrollbar]:hidden whitespace-nowrap border-b-2 border-slate-200 bg-white px-2 rounded-t font-mono">
        {[
          { id: 'overview', label: 'Dashboard Overview' },
          { id: 'drives', label: 'Placement Drives' },
          { id: 'applications', label: 'My Applications' },
          { id: 'interviews', label: 'Interviews' },
          { id: 'profile', label: 'Resume & Portfolio' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                isActive
                  ? 'text-slate-900 bg-slate-50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="active-student-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <DashboardWidgets 
                loading={false} 
                appliedCount={applications.length} 
                interviewsCount={interviews.length} 
                offersCount={applications.filter(a => a.status === 'Placed' || a.status === 'Placed').length} 
              />
            </div>
            
            {/* Quick Status and Resume */}
            <div className="md:col-span-2 space-y-6">
              <GlowCard customSize={true} glowColor="green" className="bg-white text-slate-900 p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-5">Account Status Summary</h3>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-md ${isPlaced ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {isPlaced ? 'Recruited (Placed)' : 'Active Job Seeker (Unplaced)'}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {isPlaced 
                        ? `Your details are successfully recorded as placed at ${profile.placementCompany} with a CTC offer of ${profile.placementPackage} LPA.` 
                        : 'Explore open placement drives below and apply. Make sure your resume PDF is updated in the Resume & Portfolio tab!'}
                    </p>
                    
                    {!profile.resumeUrl && (
                      <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 text-amber-800 text-sm rounded-md border border-amber-200">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span>Resume link is currently missing. Set your live PDF in the Resume & Portfolio tab.</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlowCard>

              {/* Recent Active Drives */}
              <GlowCard customSize={true} glowColor="blue" className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Placement Drives</h3>
                  <button onClick={() => setActiveTab('drives')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                    View All Open
                  </button>
                </div>
                
                <div className="space-y-3">
                  {jobs.filter(j => j.status === 'Open').slice(0, 3).map(job => {
                    const eligibility = checkEligibility(job);
                    const applied = applications.some(a => a.jobId === job.id);
                    return (
                      <div key={job.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-base text-slate-900">{job.title}</span>
                            <span className="text-xs font-medium uppercase bg-slate-100 text-slate-600 py-0.5 px-2 rounded-md">{job.jobType}</span>
                          </div>
                          <p className="text-sm text-indigo-600 font-medium">{job.companyName}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-medium text-slate-500">
                            <span>Package: <strong className="text-slate-700">{job.packageAmount} LPA</strong></span>
                            <span>Cutoff: <strong className="text-slate-700">{job.cgpaCutoff} CGPA</strong></span>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          {applied ? (
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-md border border-emerald-200 inline-block">Applied</span>
                          ) : eligibility.eligible ? (
                            <button
                              onClick={() => handleApply(job.id)}
                              disabled={actionLoading === job.id}
                              className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 py-2 px-4 rounded-md shadow-sm transition-colors disabled:bg-slate-300 w-full sm:w-auto"
                            >
                              {actionLoading === job.id ? 'Applying...' : 'Apply'}
                            </button>
                          ) : (
                            <span className="text-xs text-rose-600 font-medium flex items-center justify-center sm:justify-end gap-1.5 p-1.5 bg-rose-50 rounded-md border border-rose-100">
                              <AlertCircle size={14} />
                              Ineligible
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {jobs.filter(j => j.status === 'Open').length === 0 && (
                    <div className="text-center py-6 text-sm text-slate-500">No active placement drives found.</div>
                  )}
                </div>
              </GlowCard>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <GlowCard customSize={true} glowColor="purple" className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 relative overflow-hidden">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500/60 mb-4 relative z-10">Academic Record</h3>
                <div className="space-y-3 text-sm relative z-10 font-medium">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Roll Number</span>
                    <span className="font-mono text-slate-100">{profile.rollNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Department</span>
                    <span className="text-slate-100">{profile.department}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">CGPA</span>
                    <span className="text-slate-100">{profile.cgpa} / 10.0</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Backlogs</span>
                    <span className={`${profile.backlogs > 0 ? 'text-rose-400' : 'text-slate-900'}`}>{profile.backlogs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skills Stored</span>
                    <span className="text-slate-100">{profile.skills.length} Skills</span>
                  </div>
                </div>
              </GlowCard>

              {/* Quick links */}
              <GlowCard customSize={true} glowColor="orange" className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500/60 mb-3">Active Deliverables</h4>
                <div className="space-y-2 text-sm font-medium">
                  <button onClick={() => setActiveTab('profile')} className="w-full text-left p-2.5 hover:bg-slate-50 rounded-md flex items-center justify-between text-indigo-600 transition-colors border border-transparent hover:border-slate-200">
                    <span>Configure Resume PDF Link</span>
                    <FileText size={16} />
                  </button>
                  <button onClick={() => setActiveTab('profile')} className="w-full text-left p-2.5 hover:bg-slate-50 rounded-md flex items-center justify-between text-indigo-600 transition-colors border border-transparent hover:border-slate-200">
                    <span>Manage Projects ({profile.projects.length})</span>
                    <Plus size={16} />
                  </button>
                </div>
              </GlowCard>
            </div>

          </div>
        )}

        {/* DRIVES TAB */}
        {activeTab === 'drives' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Available Placement Drives</h3>
              <p className="text-sm text-slate-500">Filters: Eligible only (calculated automatically)</p>
            </div>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {jobs.map(job => {
                const eligibility = checkEligibility(job);
                const applied = applications.some(a => a.jobId === job.id);
                const isClosed = job.status !== 'Open';

                return (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)" }}
                    key={job.id} 
                    className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-medium uppercase px-2.5 py-0.5 rounded-md border ${
                          job.status === 'Open' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {job.status}
                        </span>
                        <span className="text-sm font-semibold text-indigo-600">{job.packageAmount} LPA</span>
                      </div>

                      <h4 className="text-base font-semibold text-slate-900">{job.title}</h4>
                      <p className="text-sm text-slate-600 font-medium">{job.companyName} • <span className="text-slate-500">{job.location}</span></p>

                      <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">{job.description}</p>

                      {/* Requirements */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.requirements.slice(0, 3).map((r, idx) => (
                          <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">{r}</span>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-sm text-slate-500">
                        <div>Cutoff: <span className="font-medium text-slate-900">{job.cgpaCutoff} CGPA</span></div>
                        <div>Max Backlogs: <span className="font-medium text-slate-900">{job.backlogsAllowed}</span></div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                      {/* Eligibility Banner */}
                      {isClosed ? (
                        <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                          <AlertOctagon size={16} /> Drive Closed
                        </span>
                      ) : eligibility.eligible ? (
                        <span className="text-sm text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-md font-medium border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 size={16} /> Eligible
                        </span>
                      ) : (
                        <div className="text-sm text-rose-600 font-medium flex flex-col max-w-[65%]">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle size={16} /> Ineligible
                          </span>
                          <span className="text-xs text-rose-500 truncate mt-1" title={eligibility.reason}>{eligibility.reason}</span>
                        </div>
                      )}

                      {applied ? (
                        <span className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md py-2 px-4">Applied</span>
                      ) : isClosed ? (
                        <button disabled className="text-sm font-medium bg-slate-100 text-slate-500 py-2 px-4 rounded-md cursor-not-allowed">Closed</button>
                      ) : eligibility.eligible ? (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={actionLoading === job.id}
                          className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 py-2 px-4 rounded-md shadow-sm transition-colors disabled:bg-slate-300"
                        >
                          {actionLoading === job.id ? 'Applying...' : 'Apply Now'}
                        </button>
                      ) : (
                        <button disabled className="text-sm font-medium bg-slate-100 text-slate-500 py-2 px-4 rounded-md cursor-not-allowed">Locked</button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {jobs.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">No job openings found.</div>
              )}
            </motion.div>
          </div>
        )}

        {/* MY APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-semibold text-slate-900 text-base">Application Tracker</h3>
              <span className="text-sm text-slate-500">Real-time status tracking</span>
            </div>
            <div className="p-4 bg-slate-50/50">
               {applications.length === 0 ? (
                 <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-lg border border-slate-200">You haven't applied for any placement drives yet.</div>
               ) : (
                 <ApplicationViews applications={applications} isStudent={true} />
               )}
            </div>
          </div>
        )}

        {/* INTERVIEWS TAB */}
        {activeTab === 'interviews' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Your Interview Schedule</h3>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {interviews.map(i => (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)" }}
                  key={i.id} 
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4 transition-all"
                >
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 flex-shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-md">
                        {i.mode}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                        i.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        i.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {i.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-base truncate">{i.jobTitle}</h4>
                      <p className="text-sm text-slate-600 font-medium truncate">{i.companyName}</p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-200 text-sm text-slate-600 space-y-2">
                      <div>Date & Time: <strong className="text-slate-900">{new Date(i.dateTime).toLocaleString()}</strong></div>
                      
                      {i.mode === 'Online' ? (
                        <div className="flex items-center gap-1.5 mt-2">
                          <LinkIcon size={16} className="text-slate-400" />
                          <a href={i.linkOrVenue} target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline flex items-center gap-1">
                            Join Meeting Link
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <div>Venue: <strong className="text-slate-900 break-words">{i.linkOrVenue}</strong></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {interviews.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
                  No upcoming interviews scheduled yet. Candidates will be notified once shortlisted.
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* PROFILE / RESUME & PORTFOLIO */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Edit details */}
            <div className="md:col-span-7 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-5">Update Placement Portfolio</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Resume Link (PDF URL or File Upload)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      {(resumeUrl || '').startsWith('data:') ? (
                        <div className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-600 flex items-center justify-between">
                          <span className="truncate">Local PDF Uploaded</span>
                          <button type="button" onClick={() => setResumeUrl('')} className="text-rose-500 hover:text-rose-700 font-medium">Remove</button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                          placeholder="https://drive.google.com/your-resume-pdf"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md outline-none text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-shadow"
                          required
                        />
                      )}
                    </div>
                    {resumeUrl && (
                      <a 
                        href={resumeUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        download={(resumeUrl || '').startsWith('data:') ? 'resume.pdf' : undefined} 
                        className="flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer border border-indigo-200"
                      >
                        View
                      </a>
                    )}
                    <label className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer border border-slate-200">
                      Upload PDF
                      <input 
                        type="file" 
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File too large. Please upload a PDF under 5MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setResumeUrl(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Please provide a valid document link or upload a PDF (max 5MB) so companies can review your profile.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Technical Skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g. React, Docker, Spring"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-md outline-none text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-slate-900 text-white font-medium px-4 py-2 text-sm rounded-md hover:bg-slate-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.map(s => (
                      <span key={s} className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-md font-medium flex items-center gap-1 border border-indigo-100">
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="text-indigo-400 hover:text-indigo-600 font-bold ml-1">×</button>
                      </span>
                    ))}
                    {profile.skills.length === 0 && (
                      <span className="text-sm text-slate-500">No skills added yet.</span>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white font-medium py-2 px-6 rounded-md text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Save Portfolio Settings
                  </button>
                </div>
              </form>
            </div>

            {/* Manage Projects */}
            <div className="md:col-span-5 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Add Academic Project</h3>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Project Title</label>
                    <input
                      type="text"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="e.g. Smart Irrigation System"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-shadow"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Brief Description</label>
                    <textarea
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      rows={3}
                      placeholder="Discuss tech stack and core outcomes..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-shadow resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Project URL (GitHub / Demo)</label>
                    <input
                      type="url"
                      value={newProjectUrl}
                      onChange={(e) => setNewProjectUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-shadow"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-medium py-2 px-4 text-sm rounded-md hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Project</span>
                  </button>
                </form>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Stored Projects ({profile.projects.length})</h4>
                <div className="space-y-3">
                  {profile.projects.map((p, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-start hover:bg-slate-100 transition-colors">
                      <div className="space-y-1">
                        <span className="font-semibold text-sm text-slate-900 block">{p.title}</span>
                        <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 mt-2 font-medium">
                            View link
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <button onClick={() => handleRemoveProject(idx)} className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 bg-white rounded-md border border-slate-200 shadow-sm ml-4 flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {profile.projects.length === 0 && (
                    <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-200 rounded-md bg-slate-50">No projects added yet.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
