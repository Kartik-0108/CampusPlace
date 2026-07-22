import React, { useState, useEffect } from 'react';
import { CompanyProfile, Job, Application, Interview, StudentProfile } from '../types.ts';
import { api } from '../api.ts';
import { Building, MapPin, Globe, Users, Briefcase, PlusCircle, CheckCircle, Clock, FileText, UserCheck, Trash2, Calendar, LinkIcon, Video, AlignLeft, ShieldAlert, Sparkles, AlertTriangle, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { initAuth, googleSignIn, logout, sendEmail, getAccessToken } from '../services/gmail.ts';
import StudentProfileModal from './StudentProfileModal.tsx';

interface CompanyDashboardProps {
  userId: string;
}

export default function CompanyDashboard({ userId }: CompanyDashboardProps) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);

  // Gmail OAuth State
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

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

  const handleViewStudent = async (studentId: string) => {
    try {
      const res = await api.getStudentProfile(studentId);
      if (res.success) {
        setViewingStudent(res.student);
      }
    } catch (err) {
      alert('Could not fetch student profile');
    }
  };

  // Selected Job for Applicant inspection
  const [selectedJobId, setSelectedJobId] = useState<string>('all');

  // Form states for NEW JOB
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [reqsInput, setReqsInput] = useState('');
  const [cgpaCutoff, setCgpaCutoff] = useState('7.0');
  const [backlogs, setBacklogs] = useState('0');
  const [packageLpa, setPackageLpa] = useState('');
  const [jobType, setJobType] = useState<'Full-Time' | 'Internship' | 'Intern + Full-Time'>('Full-Time');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');

  // Active sub-view
  const [activeTab, setActiveTab] = useState<'overview' | 'post_job' | 'drives' | 'applicants' | 'schedules'>('overview');

  // Candidate review helper states
  const [reviewingApp, setReviewingApp] = useState<Application | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Shortlisted' | 'Placed' | 'Rejected'>('Shortlisted');
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Schedule Interview states
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewMode, setInterviewMode] = useState<'Online' | 'In-Person'>('Online');
  const [interviewVenue, setInterviewVenue] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const meRes = await api.getMe();
      if (meRes.success) {
        setProfile(meRes.profile);
      }

      const jRes = await api.getJobs();
      if (jRes.success) {
        // Only get jobs posted by this company
        const companyJobs = jRes.jobs.filter(j => j.companyId === userId);
        setJobs(companyJobs);
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
      setError(err.message || 'Failed to retrieve company data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDesc || !packageLpa || !location || !deadline) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const res = await api.postJob({
        title: jobTitle,
        description: jobDesc,
        requirements: reqsInput.split(',').map(s => s.trim()).filter(Boolean),
        cgpaCutoff: parseFloat(cgpaCutoff),
        backlogsAllowed: parseInt(backlogs),
        packageAmount: parseFloat(packageLpa),
        jobType,
        location,
        lastDateToApply: deadline, allowedDepartments: [], workMode: "On-Site"
      });

      if (res.success) {
        alert('Job Drive posted successfully!');
        // Reset form
        setJobTitle('');
        setJobDesc('');
        setReqsInput('');
        setCgpaCutoff('7.0');
        setBacklogs('0');
        setPackageLpa('');
        setLocation('');
        setDeadline('');
        
        // Refresh & switch
        await fetchData();
        setActiveTab('drives');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post job.');
    }
  };

  const handleUpdateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp) return;

    try {
      const res = await api.updateApplicationStatus(reviewingApp.id, reviewStatus, reviewRemarks);
      if (res.success) {
        if (reviewStatus === 'Shortlisted' && !needsAuth && profile) {
          const studentProfileRes = await api.getStudentProfile(reviewingApp.studentId);
          if (studentProfileRes.success) {
             const studentEmail = studentProfileRes.student.email;
             const confirmed = window.confirm(`Send shortlist email to ${reviewingApp.studentName} at ${studentEmail}?`);
             if (confirmed) {
                try {
                  await sendEmail(
                    studentEmail,
                    `You have been shortlisted by ${profile.name}!`,
                    `Hello ${reviewingApp.studentName},\n\nCongratulations! Your application for the position of ${reviewingApp.jobTitle} has been shortlisted by ${profile.name}.\n\nRemarks: ${reviewRemarks || 'N/A'}\n\nPlease check your portal for next steps and interview schedules.\n\nBest regards,\n${profile.name}`
                  );
                  alert('Applicant status updated and email sent successfully!');
                } catch (emailErr) {
                  console.error(emailErr);
                  alert('Status updated, but failed to send email. Please check your Gmail connection.');
                }
             } else {
                 alert('Applicant status updated successfully! (Email skipped)');
             }
          } else {
              alert('Applicant status updated successfully! (Could not fetch email)');
          }
        } else {
            alert('Applicant status updated successfully!');
        }
        setReviewingApp(null);
        setReviewRemarks('');
        await fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update applicant.');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp || !interviewDate || !interviewVenue) {
      alert('Please complete all scheduling fields.');
      return;
    }

    try {
      const res = await api.scheduleInterview({
        applicationId: schedulingApp.id,
        dateTime: interviewDate,
        mode: interviewMode,
        linkOrVenue: interviewVenue
      });

      if (res.success) {
        alert('Interview successfully scheduled!');
        setSchedulingApp(null);
        setInterviewDate('');
        setInterviewVenue('');
        await fetchData();
        setActiveTab('schedules');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to schedule interview.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <Clock className="animate-spin text-indigo-600" size={32} />
          <span className="text-sm font-medium text-slate-500">Loading recruiter environment...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-slate-100 rounded-xl text-center text-slate-500">
        No active company profile found. Please register as a company recruiter to access drive panels.
      </div>
    );
  }

  // Handle Unapproved Company Access Block!
  if (!profile.isApproved) {
    return (
      <div id="unapproved_company_alert" className="bg-white border border-amber-200 rounded-2xl shadow-sm p-8 text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
          <ShieldAlert size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Accreditation Pending</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your organization profile <strong>{profile.name}</strong> is currently registered but awaits formal approval by the college **Placement Officer (TPO)**.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="bg-amber-50/50 p-4 rounded-xl text-left border border-amber-100 text-xs text-amber-800 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles size={14} className="text-amber-500" />
              <span>Sandbox Workaround Instructions:</span>
            </div>
            <p>
              You can bypass this check by logging in as the **Placement Officer (Admin)** from the sign-in screen, heading to the **"Companies"** tab, and clicking **"Approve"** on your registered profile! Once approved, switch back here to post drives and shortlist candidates.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-center gap-3 text-xs">
          <div className="text-slate-400 font-medium">Headquarters: {profile.location || 'Not Specified'}</div>
          <span className="text-slate-200">•</span>
          <div className="text-slate-400 font-medium">Industry: {profile.industry}</div>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const activeJobs = jobs.filter(j => j.status === 'Open').length;
  const filteredApps = selectedJobId === 'all'
    ? applications
    : applications.filter(a => a.jobId === selectedJobId);

  const pendingApps = filteredApps.filter(a => a.status === 'Applied').length;
  const shortlistedCount = filteredApps.filter(a => a.status === 'Shortlisted' || a.status === 'Interview').length;
  const selectedCount = filteredApps.filter(a => a.status === 'Placed').length;

  return (
    <div className="space-y-6">
      
      {/* Recruiter Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-md flex items-center justify-center font-bold text-xl text-white">
            {profile.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{profile.name} Recruiting Panel</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1"><Globe size={14} /> <a href={profile.website} target="_blank" rel="noreferrer" className="hover:text-slate-700 transition-colors">{profile.website}</a></span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 self-start md:self-auto">
          {needsAuth ? (
            <button 
              onClick={handleGmailLogin} 
              disabled={isLoggingIn}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors"
            >
              <Mail size={14} className={isLoggingIn ? "animate-pulse" : "text-blue-500"} />
              {isLoggingIn ? 'Connecting...' : 'Connect Gmail'}
            </button>
          ) : (
            <button 
              onClick={handleGmailLogout}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors"
              title={googleUser?.email}
            >
              <CheckCircle size={14} />
              Gmail Connected
            </button>
          )}

          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Approved Recruiter
          </div>
        </div>
      </div>

      {/* Recruiter Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Posted Drives</span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-slate-900 tracking-tight">{jobs.length}</span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <span className="text-xs text-indigo-600 font-medium block">Active: {activeJobs}</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Awaiting Screening</span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className={`text-3xl font-semibold tracking-tight ${pendingApps > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pendingApps}</span>
            <span className="text-xs text-slate-500">Candidates</span>
          </div>
          <span className="text-xs text-slate-500 font-medium block">Needs Review</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Shortlisted</span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-slate-900 tracking-tight">{shortlistedCount}</span>
            <span className="text-xs text-slate-500">Active</span>
          </div>
          <span className="text-xs text-indigo-600 font-medium block">Interviews: {interviews.filter(i => i.status === 'Scheduled').length}</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Recruits Secured</span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-emerald-600 tracking-tight">{selectedCount}</span>
            <span className="text-xs text-slate-500">Selected</span>
          </div>
          <span className="text-xs text-emerald-600 font-medium block">Placement Synced</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto [overflow-x-auto::-webkit-scrollbar]:hidden whitespace-nowrap border-b-2 border-slate-200 bg-slate-50 px-2 rounded-t font-mono">
        {[
          { id: 'overview', label: 'Dashboard' },
          { id: 'post_job', label: 'Post Drive' },
          { id: 'drives', label: 'Manage Drives' },
          { id: 'schedules', label: 'Interview Schedules' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                isActive
                  ? 'text-slate-900 bg-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="active-company-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="mt-4">
        
        {/* DASHBOARD & APPLICATIONS REVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Applicant screening queue */}
            <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Application Pipeline</h3>
                  <p className="text-sm text-slate-500">Screen, shortlist, and select candidates</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Filter by Drive:</span>
                  <select
                    id="company_job_filter"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-slate-900"
                  >
                    <option value="all">All Drives</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredApps.map(app => (
                  <div key={app.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => handleViewStudent(app.studentId)} className="font-semibold text-base text-indigo-600 hover:text-indigo-800 text-left transition-colors">
                            {app.studentName}
                          </button>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{app.studentRollNumber}</span>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                            app.status === 'Placed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            app.status === 'Shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            app.status === 'Interview' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{app.studentDepartment} <span className="text-slate-300 mx-1">•</span> <span className="font-medium text-slate-700">CGPA: {app.studentCgpa}</span></p>
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                          <span>Target Job: <strong className="text-slate-900 font-medium">{app.jobTitle}</strong></span>
                          <span>Applied: {app.appliedDate}</span>
                        </div>

                        {app.remarks && (
                          <div className="text-sm text-slate-600 mt-3 bg-slate-50 p-3 rounded-md border border-slate-200 leading-relaxed">
                            <strong className="font-semibold text-slate-900 block mb-1">Feedback Remarks:</strong> {app.remarks}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-end self-start">
                        <a
                          href={app.studentResumeUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                        >
                          <FileText size={14} />
                          <span>Resume</span>
                        </a>

                        <div className="flex gap-2">
                          {app.status === 'Applied' && (
                            <button
                              onClick={() => {
                                setReviewingApp(app);
                                setReviewStatus('Shortlisted');
                              }}
                              className="text-sm bg-slate-900 text-white font-medium py-1.5 px-3 rounded-md hover:bg-slate-800 transition-colors"
                            >
                              Screen
                            </button>
                          )}
                          {app.status === 'Shortlisted' && (
                            <button
                              onClick={() => {
                                setSchedulingApp(app);
                                setInterviewMode('Online');
                              }}
                              className="text-sm bg-indigo-600 text-white font-medium py-1.5 px-3 rounded-md hover:bg-indigo-700 flex items-center gap-1.5 transition-colors"
                            >
                              <Calendar size={14} />
                              Schedule
                            </button>
                          )}
                          {(app.status === 'Shortlisted' || app.status === 'Interview') && (
                            <button
                              onClick={() => {
                                setReviewingApp(app);
                                setReviewStatus('Placed');
                              }}
                              className="text-sm bg-emerald-600 text-white font-medium py-1.5 px-3 rounded-md hover:bg-emerald-700 flex items-center gap-1.5 transition-colors"
                            >
                              <UserCheck size={14} />
                              Offer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredApps.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-sm">No student applications received for this selection.</div>
                )}
              </div>
            </div>

            {/* Sidebar quick insights */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Screening Tips */}
              <div className="bg-slate-900 text-white p-6 rounded-lg border border-slate-800 shadow-sm relative overflow-hidden">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 relative z-10">Automated Screening</h4>
                <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                  Our system verifies student CGPA cutoffs and active backlog ceilings during submission. Only students matching your requirements are visible in your screening queue.
                </p>
                <div className="mt-4 bg-white/10 p-3 rounded-md text-xs text-slate-200 flex items-center gap-2 relative z-10 font-medium">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>100% eligibility verified.</span>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
              </div>

              {/* Active Jobs brief */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Your Job Drives ({jobs.length})</h4>
                <div className="space-y-2">
                  {jobs.map(j => (
                    <div key={j.id} className="text-sm p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-900 block">{j.title}</span>
                        <span className="text-xs text-slate-500">{j.jobType} • {j.packageAmount} LPA</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${j.status === 'Open' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{j.status}</span>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-sm text-slate-500">No posted job drives.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* POST JOB DRIVE FORM */}
        {activeTab === 'post_job' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-6">Post New Placement Drive</h3>
            
            <form onSubmit={handlePostJob} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title / Role Name</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Associate Cloud Engineer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  >
                    <option>Full-Time</option>
                    <option>Internship</option>
                    <option>Intern + Full-Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Description & Responsibilities</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={4}
                  placeholder="Summarize the core roles, technologies involved, and daily responsibilities..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-y"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Key Requirements (Comma Separated)</label>
                <input
                  type="text"
                  value={reqsInput}
                  onChange={(e) => setReqsInput(e.target.value)}
                  placeholder="e.g. Python, SQL, REST APIs, Git"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
                <p className="text-xs text-slate-500 mt-1.5">Enter skills separated by commas to render them as structured badges.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Min CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpaCutoff}
                    onChange={(e) => setCgpaCutoff(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Max Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={backlogs}
                    onChange={(e) => setBacklogs(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Annual CTC package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(e.target.value)}
                    placeholder="e.g. 12.5"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Date to Apply</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-medium py-2 px-6 rounded-md text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <PlusCircle size={14} />
                  <span>Publish Placement Drive</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MANAGE DRIVES */}
        {activeTab === 'drives' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Your Posted Drives</h3>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {jobs.map(job => (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)" }}
                  key={job.id} 
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-slate-500">ID: {job.id}</span>
                      <select
                        value={job.status}
                        onChange={async (e) => {
                          try {
                            const res = await api.updateJob(job.id, { status: e.target.value as any });
                            if (res.success) {
                              alert('Drive status updated!');
                              await fetchData();
                            }
                          } catch (err: any) {
                            alert(err.message || 'Failed to update status');
                          }
                        }}
                        className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-900 font-medium outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-base">{job.title}</h4>
                    <span className="text-sm text-slate-500 font-medium block mt-1">CTC: {job.packageAmount} LPA • Location: {job.location}</span>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Deadline: {job.lastDateToApply}</span>
                    <span>Posted: {job.postedDate}</span>
                  </div>
                </motion.div>
              ))}
              {jobs.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-lg">
                  No drives posted yet. Create your first drive using the "Post Drive" tab.
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* INTERVIEW SCHEDULES */}
        {activeTab === 'schedules' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Scheduled Interviews</h3>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {interviews.map(i => (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)" }}
                  key={i.id} 
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4 transition-all"
                >
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-md">
                    <Calendar size={20} />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase text-indigo-600 tracking-wider">{i.mode}</span>
                      <select
                        value={i.status}
                        onChange={async (e) => {
                          try {
                            const res = await api.updateInterview(i.id, { status: e.target.value as any });
                            if (res.success) {
                              alert('Interview status updated!');
                              await fetchData();
                            }
                          } catch (err: any) {
                            alert(err.message || 'Failed to update interview');
                          }
                        }}
                        className="border border-slate-300 rounded-md px-1.5 py-0.5 bg-white font-medium outline-none text-slate-900 focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-base mt-1">{i.studentName}</h4>
                    <span className="text-sm text-slate-600 block font-medium">{i.jobTitle}</span>
                    
                    <div className="mt-3 pt-3 border-t border-slate-200 text-sm text-slate-600 space-y-1">
                      <div>Date: <strong className="text-slate-900 font-medium">{new Date(i.dateTime).toLocaleString()}</strong></div>
                      <div>Venue/Link: <span className="font-mono text-slate-800 text-xs truncate block mt-1">{i.linkOrVenue}</span></div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {interviews.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-lg">
                  No interviews scheduled. Head to candidates list under "Dashboard" to shortlist and schedule.
                </div>
              )}
            </motion.div>
          </div>
        )}

      </div>

      {/* DIALOG: SCREENING CANDIDATE */}
      {reviewingApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden"
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-semibold text-slate-900">Review Candidate</h4>
                <p className="text-sm text-slate-500">{reviewingApp.studentName} • {reviewingApp.studentDepartment}</p>
              </div>
              <button onClick={() => setReviewingApp(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleUpdateApplication} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Action Outcome</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Shortlisted', 'Placed', 'Rejected'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setReviewStatus(opt)}
                      className={`py-2 border text-sm rounded-md font-medium text-center transition-colors ${
                        reviewStatus === opt
                          ? opt === 'Placed' ? 'border-emerald-600 bg-emerald-600 text-white' :
                            opt === 'Rejected' ? 'border-rose-600 bg-rose-600 text-white' :
                            'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback / Remarks</label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  rows={3}
                  placeholder="Include interview timings, resume suggestions, or offer terms..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-y"
                  required
                />
              </div>

              {reviewStatus === 'Placed' && (
                <div className="p-4 bg-emerald-50 rounded-md border border-emerald-200 text-sm text-emerald-800 leading-normal flex items-start gap-2">
                  <Sparkles size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p>
                    <strong>Automated Record Sync:</strong> Marking this candidate as **Selected** will automatically update their profile status to **Placed**, registering {profile.name} as their recruiter with the CTC package specified in the job posting!
                  </p>
                </div>
              )}

              <div className="pt-5 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewingApp(null)}
                  className="text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 py-2 px-6 rounded-md transition-colors"
                >
                  Submit Status Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DIALOG: SCHEDULE INTERVIEW */}
      {schedulingApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden"
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-semibold text-slate-900">Schedule Interview</h4>
                <p className="text-sm text-slate-500">{schedulingApp.studentName} • {schedulingApp.jobTitle}</p>
              </div>
              <button onClick={() => setSchedulingApp(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleScheduleInterview} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Interview Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Online', 'In-Person'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInterviewMode(m)}
                      className={`py-2 border text-sm font-medium rounded-md text-center transition-colors ${
                        interviewMode === m ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {interviewMode === 'Online' ? 'Meeting URL (Google Meet/Teams)' : 'Office Cabin / Venue Location'}
                </label>
                <input
                  type="text"
                  value={interviewVenue}
                  onChange={(e) => setInterviewVenue(e.target.value)}
                  placeholder={interviewMode === 'Online' ? 'https://meet.google.com/...' : 'Seminar Room 3, CSE Block'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div className="pt-5 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 py-2 px-6 rounded-md transition-colors"
                >
                  Schedule and Notify
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DIALOG: VIEW STUDENT PROFILE */}
      {viewingStudent && (
        <StudentProfileModal profile={viewingStudent} onClose={() => setViewingStudent(null)} />
      )}
    </div>
  );
}
