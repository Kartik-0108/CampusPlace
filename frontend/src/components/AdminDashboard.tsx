import React, { useState, useEffect } from 'react';
import { AnalyticsStats, CompanyProfile, StudentProfile, Job } from '../types.ts';
import { api } from '../api.ts';
import { Shield, Users, Building, Sparkles, Briefcase, RefreshCw, Check, AlertCircle, TrendingUp, BarChart as BarChartIcon, User, Layers, Search, CheckCircle, Clock, Award, Download, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion } from 'motion/react';
import { GlowCard } from './ui/spotlight-card.tsx';
import DepartmentsManager from './DepartmentsManager.tsx';
import JobDriveManager from './JobDriveManager.tsx';
import StudentProfileModal from './StudentProfileModal.tsx';
import AdminCalendar from './AdminCalendar.tsx';

export default function AdminDashboard() {
  const [isLightMode, setIsLightMode] = useState(() => {
    return document.body.classList.contains('theme-light') || localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('theme-light'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);

  // Search/Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sub tab view
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'students' | 'drives' | 'departments' | 'calendar'>('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const sRes = await api.getAnalytics();
      if (sRes.success) {
        setStats(sRes.stats);
      }

      const cRes = await api.getCompanies();
      if (cRes.success) {
        setCompanies(cRes.companies);
      }

      const stRes = await api.getStudents();
      if (stRes.success) {
        setStudents(stRes.students);
      }

      const jRes = await api.getJobs();
      if (jRes.success) {
        setJobs(jRes.jobs);
      }
      
      const iRes = await api.getInterviews();
      if (iRes.success) {
        setInterviews(iRes.interviews);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load placement reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveCompany = async (companyUserId: string) => {
    setActionLoading(companyUserId);
    try {
      const res = await api.approveCompany(companyUserId);
      if (res.success) {
        alert('Company successfully accredited!');
        await fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStudentStatus = async (status: 'Placed' | 'Unplaced', company?: string, packageAmt?: number) => {
    if (!viewingStudent) return;
    try {
      const res = await api.updateStudentProfile(viewingStudent.userId, {
        placedStatus: status,
        placementCompany: company,
        placementPackage: packageAmt,
      });
      if (res.success) {
        setViewingStudent(res.student);
        await fetchData(); // refresh stats and tables
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update student');
    }
  };

  const exportStudentsToCSV = () => {
    const headers = ['Roll Number', 'Name', 'Email', 'Department', 'CGPA', 'Tenth %', 'Twelfth %', 'Backlogs', 'Placed Status', 'Placement Company', 'Placement Package (LPA)', 'Skills'];
    const rows = filteredStudents.map(s => [
      s.rollNumber,
      s.name,
      s.email,
      s.department || '',
      s.cgpa,
      s.tenthPercentage,
      s.twelfthPercentage,
      s.backlogs,
      s.placedStatus,
      s.placementCompany || '-',
      s.placementPackage !== undefined ? s.placementPackage : '-',
      s.skills ? s.skills.join('; ') : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Student_Placement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudentsToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing the PDF generator. Please enable pop-ups for this site.');
      return;
    }

    const studentsHtml = filteredStudents.map((s, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px; text-align: left;">${idx + 1}</td>
        <td style="padding: 8px; text-align: left; font-weight: 500;">${s.name}<br/><span style="font-size: 10px; color: #64748b; font-family: monospace;">${s.rollNumber}</span></td>
        <td style="padding: 8px; text-align: left;">${s.department || '-'}</td>
        <td style="padding: 8px; text-align: center;">${s.cgpa}</td>
        <td style="padding: 8px; text-align: center; font-family: monospace;">${s.backlogs}</td>
        <td style="padding: 8px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; font-size: 11px; font-weight: 600; border-radius: 4px; ${s.placedStatus === 'Placed' ? 'background-color: #def7ec; color: #03543f;' : 'background-color: #f3f4f6; color: #374151;'}">
            ${s.placedStatus}
          </span>
        </td>
        <td style="padding: 8px; text-align: left;">
          ${s.placedStatus === 'Placed' ? `<strong>${s.placementCompany}</strong>` : '-'}
        </td>
        <td style="padding: 8px; text-align: right; font-weight: 600;">
          ${s.placedStatus === 'Placed' ? `${s.placementPackage} LPA` : '-'}
        </td>
      </tr>
    `).join('');

    const statsHeaderHtml = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; font-family: 'Inter', sans-serif;">
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Students</div>
          <div style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px;">${filteredStudents.length}</div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Placed</div>
          <div style="font-size: 20px; font-weight: bold; color: #057a55; margin-top: 4px;">${filteredStudents.filter(s => s.placedStatus === 'Placed').length}</div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Placement %</div>
          <div style="font-size: 20px; font-weight: bold; color: #1c64f2; margin-top: 4px;">
            ${filteredStudents.length > 0 ? Math.round((filteredStudents.filter(s => s.placedStatus === 'Placed').length / filteredStudents.length) * 100) : 0}%
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Highest Package</div>
          <div style="font-size: 20px; font-weight: bold; color: #7e3af2; margin-top: 4px;">
            ${Math.max(...filteredStudents.map(s => s.placementPackage || 0), 0)} LPA
          </div>
        </div>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Placement Report - ${new Date().toLocaleDateString()}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th { background-color: #f1f5f9; color: #475569; font-weight: 600; padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
            .signature { margin-top: 40px; border-top: 1px solid #94a3b8; width: 200px; text-align: center; padding-top: 8px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
              @page { size: portrait; margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 10px;">
            <button onclick="window.print()" style="background-color: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;">Print / Save PDF</button>
          </div>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; color: #0f172a; font-weight: 700;">UNIVERSITY PLACEMENT OFFICE</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569; letter-spacing: 0.5px;">CAMPUSPLACE PLACEMENT & TRAINING PORTAL</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 500;">Report Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <h2 style="font-size: 16px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-left: 4px solid #4f46e5; padding-left: 10px;">Student Placement Directory Summary</h2>
          
          ${statsHeaderHtml}

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">S.No</th>
                <th>Student & Roll No.</th>
                <th>Department</th>
                <th style="text-align: center;">CGPA</th>
                <th style="text-align: center;">Backlogs</th>
                <th style="text-align: center;">Status</th>
                <th>Company</th>
                <th style="text-align: right;">Package</th>
              </tr>
            </thead>
            <tbody>
              ${studentsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <p>Filters Applied: Department: <strong>${selectedDept}</strong> | Status: <strong>${selectedStatus}</strong></p>
              <p style="font-size: 10px; color: #94a3b8; margin-top: 4px;">System ID: CampusPlace-Report-${Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
            </div>
            <div>
              <div class="signature">
                <strong>Training & Placement Officer</strong>
                <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">Authorized Signature</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-indigo-400" size={32} />
          <span className="text-sm font-medium text-slate-500">Compiling placement analytics reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
        {error}
      </div>
    );
  }

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.skills.some(sk => sk.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || s.placedStatus === selectedStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Recharts color palette
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  // Prepare Recharts bar chart data
  const chartData = stats?.departmentStats.map(dept => ({
    name: dept.department.replace('Computer Science', 'CSE').replace('Information Technology', 'IT').replace('Electronics', 'ECE').replace('Mechanical', 'ME').replace('Civil', 'CE'),
    Placed: dept.placed,
    Unplaced: dept.total - dept.placed,
    Average: dept.averagePackage
  })) || [];

  const pieData = [
    { name: 'Placed', value: stats?.placedStudents || 0 },
    { name: 'Unplaced', value: stats?.unplacedStudents || 0 }
  ];

  return (
    <div className="space-y-6">
      
      {/* TPO Admin header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Shield className="text-indigo-400" size={16} />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">TPO Panel</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Placement Officer Administration</h2>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Monitor college placement metrics, accredit industry recruiters, and generate automated statistics.
          </p>
        </div>
        <div className="hidden sm:block text-right bg-slate-50 py-3 px-5 rounded-md border border-slate-200">
          <span className="text-xs text-slate-500 font-mono uppercase font-semibold tracking-wider block">University Office</span>
          <span className="block text-sm text-slate-900 font-medium mt-0.5">Placement & Training Command</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto [overflow-x-auto::-webkit-scrollbar]:hidden whitespace-nowrap border-b-2 border-slate-200 bg-slate-50 px-2 rounded-t font-mono">
        {[
          { id: 'overview', label: 'Analytics & Reports' },
          { id: 'companies', label: `Recruiters Accreditation (${companies.filter(c => !c.isApproved).length} Pending)` },
          { id: 'students', label: 'Students Directory' },
          { id: 'drives', label: 'Job Drives Audit' },
          { id: 'departments', label: 'Departments' },
          { id: 'calendar', label: 'Calendar' }
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
                  layoutId="active-admin-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            
            {/* Top statistics panel (Bento Box) */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {/* Box 1: Highest Offer (Large Block) */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} className="md:col-span-2 row-span-2 relative transition-all min-h-[220px] h-full">
                <GlowCard customSize={true} className="h-full bg-white border-2 border-slate-200 p-6 flex flex-col justify-between text-slate-900 relative overflow-hidden shadow-sm" glowColor="purple">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
                  <Sparkles size={120} />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <span className="text-sm font-semibold text-indigo-300 uppercase tracking-widest block">Highest Package Offered</span>
                  <div>
                    <span className="text-6xl font-bold text-white tracking-tighter block mb-1">{stats.highestPackage} <span className="text-2xl font-medium text-slate-400">LPA</span></span>
                    <span className="text-sm text-slate-300 font-medium block">Top Tier Candidate Placement</span>
                  </div>
                </div>
                </GlowCard>
              </motion.div>

              {/* Box 2: Total Recruits / Placement Rate */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} className="md:col-span-2 h-full transition-all">
                <GlowCard customSize={true} className="h-full bg-white border-2 border-slate-200 p-6 flex flex-col justify-between text-slate-900 shadow-sm" glowColor="blue">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Total Recruits</span>
                  <Award size={20} className="text-indigo-600" />
                </div>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-white tracking-tight">{stats.placedStudents}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Placement Rate</span>
                  <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{stats.placementPercentage}%</span>
                </div>
                </GlowCard>
              </motion.div>

              {/* Box 3: Avg CTC Offer */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} className="md:col-span-1 h-full transition-all">
                <GlowCard customSize={true} className="h-full bg-white border-2 border-slate-200 p-6 flex flex-col justify-between text-slate-900 shadow-sm" glowColor="green">
                <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider block">Average CTC</span>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp size={20} className="text-amber-500" />
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{stats.averagePackage} <span className="text-sm font-medium text-slate-500">LPA</span></span>
                </div>
                <span className="text-xs text-slate-500 font-medium mt-2 block">Annual base offer</span>
                </GlowCard>
              </motion.div>

              {/* Box 4: Registrations */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} className="md:col-span-1 h-full transition-all">
                <GlowCard customSize={true} className="h-full bg-white border-2 border-slate-200 p-6 flex flex-col justify-between text-slate-900 shadow-sm" glowColor="green">
                <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider block">Registrations</span>
                <div className="flex items-center gap-2 mt-2">
                  <Users size={20} className="text-indigo-500" />
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{stats.totalStudents}</span>
                </div>
                <span className="text-xs text-slate-500 mt-2 block">Students Recorded</span>
                </GlowCard>
              </motion.div>

              {/* Box 5: Active Partners */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} className="md:col-span-4 h-full transition-all">
                <GlowCard customSize={true} className="h-full w-full bg-white border-2 border-slate-200 p-6 flex flex-col justify-center text-slate-900 shadow-sm" glowColor="purple">
                  <div className="flex flex-row items-center w-full">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 font-mono uppercase tracking-wider block">Recruitment Partners</span>
                    <span className="text-3xl font-bold text-indigo-300 tracking-tight mt-1 block">
                      {companies.filter(c => c.isApproved).length} <span className="text-sm font-medium text-indigo-400">Active Companies</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-1">
                      {companies.filter(c => !c.isApproved).length} Pending
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">Awaiting verification</span>
                  </div>
                </div>
                  </div>
                </GlowCard>
              </motion.div>
            </motion.div>

            {/* Recharts Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Placement ratios - Bar chart */}
              <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base tracking-tight">Department-wise Recruitment Status</h3>
                    <p className="text-xs text-slate-500 mt-1">Total student volume versus successfully placed candidates by course department</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 theme-light:bg-indigo-50/50 theme-light:border-indigo-100/50">
                    <TrendingUp className="text-indigo-600 theme-light:text-indigo-600" size={18} />
                  </div>
                </div>

                <div className="h-68">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? '#f1f5f9' : 'rgba(16, 185, 129, 0.08)'} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: isLightMode ? '#64748b' : '#34d399', fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: isLightMode ? '#64748b' : '#34d399', fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isLightMode ? '#ffffff' : '#040805',
                          borderRadius: '8px', 
                          border: isLightMode ? '1px solid #cbd5e1' : '1px solid rgba(16, 185, 129, 0.3)', 
                          fontSize: '12px',
                          color: isLightMode ? '#0f172a' : '#a7f3d0',
                          boxShadow: isLightMode ? '0 4px 6px -1px rgba(0,0,0,0.05)' : '0 0 15px rgba(16,185,129,0.15)',
                          fontFamily: 'monospace'
                        }} 
                        cursor={{ fill: isLightMode ? '#f8fafc' : 'rgba(16, 185, 129, 0.04)' }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                      <Bar dataKey="Placed" fill="#10b981" radius={[4, 4, 0, 0]} name="Placed (Count)" />
                      <Bar 
                        dataKey="Unplaced" 
                        fill={isLightMode ? '#cbd5e1' : 'rgba(16, 185, 129, 0.12)'} 
                        stroke={isLightMode ? 'transparent' : 'rgba(16, 185, 129, 0.4)'}
                        strokeWidth={isLightMode ? 0 : 1}
                        radius={[4, 4, 0, 0]} 
                        name="Seekers (Count)" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ratio Pie Chart */}
              <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base tracking-tight mb-1">Overall Conversion Rate</h3>
                  <p className="text-xs text-slate-500">Placement rate comparison of eligible batch strength</p>
                </div>

                <div className="h-44 flex items-center justify-center relative my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={82}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill={isLightMode ? '#f1f5f9' : 'rgba(16, 185, 129, 0.1)'} stroke={isLightMode ? 'transparent' : 'rgba(16, 185, 129, 0.25)'} strokeWidth={1} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Absolute Center percentage */}
                  <div className="absolute text-center">
                    <span className={`text-4xl font-extrabold tracking-tighter block ${isLightMode ? 'text-slate-900' : 'text-emerald-400 text-glow-green font-mono'}`}>
                      {stats.placementPercentage}%
                    </span>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-emerald-500/50 font-mono'}`}>
                      Placed
                    </span>
                  </div>
                </div>

                <div className="flex justify-around text-xs border-t border-slate-100 pt-4 font-mono uppercase tracking-wider">
                  <div className="text-center flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-slate-500">Placed:</span>
                    <strong className="text-slate-900 font-bold ml-0.5">{stats.placedStudents}</strong>
                  </div>
                  <div className="text-center flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${isLightMode ? 'bg-slate-300' : 'bg-emerald-950 border border-emerald-500/40'}`}></span>
                    <span className="text-slate-500">Seekers:</span>
                    <strong className="text-slate-900 font-bold ml-0.5">{stats.unplacedStudents}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Department stats table and Recent Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Stats Grid table */}
              <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-slate-400" />
                  Course & Department Overview
                </h3>

                <div className="overflow-x-auto [overflow-x-auto::-webkit-scrollbar]:hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-medium">
                        <th className="pb-3 px-2 font-medium">Course Department</th>
                        <th className="pb-3 px-2 text-center font-medium">Total Candidates</th>
                        <th className="pb-3 px-2 text-center font-medium text-emerald-600">Placed</th>
                        <th className="pb-3 px-2 text-center font-medium">Avg CTC Offer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.departmentStats.map(dept => (
                        <tr key={dept.department} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-2 font-medium text-slate-900">{dept.department}</td>
                          <td className="py-3 px-2 text-center text-slate-600">{dept.total}</td>
                          <td className="py-3 px-2 text-center font-semibold text-emerald-600">{dept.placed}</td>
                          <td className="py-3 px-2 text-center text-slate-600">{dept.averagePackage} LPA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent placements log */}
              <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  Recent Placement Feeds
                </h3>

                <div className="space-y-3">
                  {stats.recentPlacements.map((rp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm text-slate-900 block">{rp.studentName}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{rp.department}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-sm text-emerald-600 block">{rp.companyName}</span>
                        <span className="text-xs text-slate-600 block mt-0.5">{rp.packageAmount} LPA</span>
                      </div>
                    </div>
                  ))}
                  {stats.recentPlacements.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">No placements recorded yet in this batch.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* COMPANIES VETTING / APPROVAL */}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-base">Accredit Recruiting Partners</h3>
              <p className="text-sm text-slate-500">Review industry details and authorize job drive posting credentials.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {companies.map(comp => (
                <div key={comp.userId} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900 text-base">{comp.name}</h4>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                        comp.isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {comp.isApproved ? 'Accredited Partner' : 'Awaiting Approval'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 block">{comp.industry} • Location: {comp.location || 'Not Configured'}</span>
                    <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">{comp.description || 'No description provided.'}</p>
                    {comp.website && (
                      <a href={comp.website} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 font-medium hover:underline block mt-2">{comp.website}</a>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {comp.isApproved ? (
                      <span className="text-sm text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 py-1.5 px-3 rounded-md border border-emerald-200">
                        <Check size={16} /> Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveCompany(comp.userId)}
                        disabled={actionLoading === comp.userId}
                        className="text-sm bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {actionLoading === comp.userId ? 'Accrediting...' : 'Approve Accreditation'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-12">No companies currently registered on the portal.</p>
              )}
            </div>
          </div>
        )}

        {/* STUDENTS DIRECTORY */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Search and Filters panel */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, roll, skills..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 bg-white rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors text-slate-900"
                />
              </div>

              <div className="flex items-center flex-wrap gap-3">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-sm border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="All">All Status</option>
                  <option value="Placed">Placed</option>
                  <option value="Unplaced">Unplaced</option>
                </select>

                <div className="h-6 w-px bg-slate-200 hidden md:block" />

                <button
                  onClick={exportStudentsToCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                  title="Export current filtered list to Excel/CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={exportStudentsToPDF}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 px-3 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                  title="Generate beautiful placement directory PDF report"
                >
                  <Printer size={14} />
                  <span>Print Report (PDF)</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto [overflow-x-auto::-webkit-scrollbar]:hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50">
                    <th className="py-3 px-6 font-medium">Roll & Student</th>
                    <th className="py-3 px-6 font-medium">Department</th>
                    <th className="py-3 px-6 text-center font-medium">CGPA</th>
                    <th className="py-3 px-6 font-medium">Skills</th>
                    <th className="py-3 px-6 text-center font-medium">Status</th>
                    <th className="py-3 px-6 text-center font-medium">Resume</th>
                    <th className="py-3 px-6 text-right font-medium">Offer LPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => (
                    <tr key={student.userId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600 text-xs uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <button onClick={() => setViewingStudent(student)} className="font-medium text-indigo-600 hover:text-indigo-800 text-left transition-colors block">
                              {student.name}
                            </button>
                            <span className="text-xs text-slate-500 font-mono block">{student.rollNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-slate-600">{student.department}</td>
                      <td className="py-3 px-6 text-center font-medium text-slate-900">{student.cgpa}</td>
                      <td className="py-3 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                          {student.skills.map(sk => (
                            <span key={sk} className="text-xs font-medium bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 border border-slate-200">{sk}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                          student.placedStatus === 'Placed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {student.placedStatus}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        {student.resumeUrl ? (
                          <a href={student.resumeUrl} target="_blank" rel="noreferrer" download={(student.resumeUrl || '').startsWith('data:') ? 'resume.pdf' : undefined} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            View PDF
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {student.placedStatus === 'Placed' ? (
                          <div className="space-y-0.5">
                            <span className="text-sm font-medium text-slate-900 block">{student.placementPackage} LPA</span>
                            <span className="text-xs text-slate-500 block">{student.placementCompany}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No students matching criteria found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLACEMENT DRIVES AUDIT */}
        {activeTab === 'drives' && (
          <div className="pt-4">
            <JobDriveManager />
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="pt-4">
            <DepartmentsManager />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="pt-4">
            <AdminCalendar jobs={jobs} interviews={interviews} />
          </div>
        )}
      </div>

      {/* DIALOG: VIEW STUDENT PROFILE */}
      {viewingStudent && (
        <StudentProfileModal 
          profile={viewingStudent} 
          onClose={() => setViewingStudent(null)} 
          isAdmin={true}
          onUpdateStatus={handleUpdateStudentStatus}
        />
      )}
    </div>
  );
}
