import React, { useState, useEffect } from 'react';
import { Job, Department } from '../types.ts';
import { api } from '../api.ts';
import { Plus, Edit2, Trash2, Globe, FileText, CheckCircle, XCircle, Download, Printer } from 'lucide-react';

export default function JobDriveManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Job>>({
    companyName: '',
    companyLogo: '',
    title: '',
    description: '',
    jobType: 'Full-Time',
    packageAmount: 0,
    location: '',
    workMode: 'On-Site',
    cgpaCutoff: 0,
    backlogsAllowed: 0,
    allowedDepartments: [],
    postedDate: new Date().toISOString().split('T')[0],
    lastDateToApply: '',
    status: 'Draft',
    selectionProcess: '',
    numberOfRounds: 1,
    hrContact: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, deptsRes] = await Promise.all([
        api.getJobs(),
        api.getDepartments()
      ]);
      setJobs(jobsRes.jobs);
      setDepartments(deptsRes.departments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportDrivesToCSV = () => {
    const headers = ['Company Name', 'Job Title', 'Job Type', 'Package (LPA)', 'Location', 'Work Mode', 'Min CGPA Cutoff', 'Max Backlogs Allowed', 'Posted Date', 'Application Deadline', 'Status'];
    const rows = jobs.map(j => [
      j.companyName,
      j.title,
      j.jobType,
      j.packageAmount,
      j.location,
      j.workMode,
      j.cgpaCutoff,
      j.backlogsAllowed,
      j.postedDate,
      j.lastDateToApply,
      j.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Placement_Drives_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDrivesToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing the PDF generator. Please enable pop-ups for this site.');
      return;
    }

    const drivesHtml = jobs.map((j, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px; text-align: left;">${idx + 1}</td>
        <td style="padding: 8px; text-align: left; font-weight: 500;">${j.companyName}</td>
        <td style="padding: 8px; text-align: left;">${j.title}</td>
        <td style="padding: 8px; text-align: center; font-family: monospace;">${j.jobType}</td>
        <td style="padding: 8px; text-align: right; font-weight: 600; color: #057a55;">${j.packageAmount} LPA</td>
        <td style="padding: 8px; text-align: left;">${j.location} (${j.workMode})</td>
        <td style="padding: 8px; text-align: center; font-weight: 500;">&ge; ${j.cgpaCutoff}</td>
        <td style="padding: 8px; text-align: center; font-family: monospace;">${j.backlogsAllowed}</td>
        <td style="padding: 8px; text-align: center; font-size: 12px;">${j.lastDateToApply || '-'}</td>
        <td style="padding: 8px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; font-size: 11px; font-weight: 600; border-radius: 4px; ${j.status === 'Open' ? 'background-color: #def7ec; color: #03543f;' : j.status === 'Draft' ? 'background-color: #fef3c7; color: #92400e;' : 'background-color: #f3f4f6; color: #374151;'}">
            ${j.status}
          </span>
        </td>
      </tr>
    `).join('');

    const statsHeaderHtml = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; font-family: 'Inter', sans-serif;">
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Drives</div>
          <div style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px;">${jobs.length}</div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Active/Open</div>
          <div style="font-size: 20px; font-weight: bold; color: #057a55; margin-top: 4px;">${jobs.filter(j => j.status === 'Open').length}</div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Drafts</div>
          <div style="font-size: 20px; font-weight: bold; color: #b45309; margin-top: 4px;">${jobs.filter(j => j.status === 'Draft').length}</div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Highest CTC Drive</div>
          <div style="font-size: 20px; font-weight: bold; color: #7e3af2; margin-top: 4px;">
            ${Math.max(...jobs.map(j => j.packageAmount || 0), 0)} LPA
          </div>
        </div>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Placement Drives Audit Report - ${new Date().toLocaleDateString()}</title>
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
              @page { size: landscape; margin: 1.5cm; }
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
          
          <h2 style="font-size: 16px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-left: 4px solid #4f46e5; padding-left: 10px;">Placement Drives Summary Report</h2>
          
          ${statsHeaderHtml}
 
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">S.No</th>
                <th>Recruiter / Company</th>
                <th>Job Title / Designation</th>
                <th style="text-align: center;">Job Type</th>
                <th style="text-align: right;">CTC Package</th>
                <th>Location & Mode</th>
                <th style="text-align: center;">Min CGPA</th>
                <th style="text-align: center;">Max Backlogs</th>
                <th style="text-align: center;">Deadline</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${drivesHtml}
            </tbody>
          </table>
 
          <div class="footer">
            <div>
              <p>Scope: <strong>All Recorded Recruitment Campaigns</strong></p>
              <p style="font-size: 10px; color: #94a3b8; margin-top: 4px;">System ID: CampusPlace-Drives-${Math.random().toString(36).substring(2, 9).toUpperCase()}</p>
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

  const handleOpenForm = (job?: Job) => {
    if (job) {
      setEditingId(job.id);
      setFormData(job);
    } else {
      setEditingId(null);
      setFormData({
        companyName: '',
        companyLogo: '',
        title: '',
        description: '',
        jobType: 'Full-Time',
        packageAmount: 0,
        location: '',
        workMode: 'On-Site',
        cgpaCutoff: 0,
        backlogsAllowed: 0,
        allowedDepartments: [],
        postedDate: new Date().toISOString().split('T')[0],
        lastDateToApply: '',
        status: 'Draft',
        selectionProcess: '',
        numberOfRounds: 1,
        hrContact: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateJob(editingId, formData);
      } else {
        await api.postJob(formData as any);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save job drive');
    }
  };

  const toggleDept = (deptId: string) => {
    const current = formData.allowedDepartments || [];
    if (current.includes(deptId)) {
      setFormData({ ...formData, allowedDepartments: current.filter(id => id !== deptId) });
    } else {
      setFormData({ ...formData, allowedDepartments: [...current, deptId] });
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Placement Drives Management</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportDrivesToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3.5 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
            title="Export all placement drives to Excel/CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportDrivesToPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 px-3.5 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
            title="Generate beautiful drives audit report PDF"
          >
            <Printer size={14} />
            <span>Print Report (PDF)</span>
          </button>

          <button onClick={() => handleOpenForm()} className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Plus size={16} /> Create Drive
          </button>
        </div>
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Company Details</h3>
              <div><label className="text-sm font-medium">Company Name</label><input required className="w-full mt-1 border-slate-200 rounded-md" value={formData.companyName} onChange={e=>setFormData({...formData, companyName: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Company Logo URL</label><input className="w-full mt-1 border-slate-200 rounded-md" value={formData.companyLogo} onChange={e=>setFormData({...formData, companyLogo: e.target.value})} /></div>
              <div><label className="text-sm font-medium">HR Contact Email/Phone</label><input className="w-full mt-1 border-slate-200 rounded-md" value={formData.hrContact} onChange={e=>setFormData({...formData, hrContact: e.target.value})} /></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Role Details</h3>
              <div><label className="text-sm font-medium">Job Role</label><input required className="w-full mt-1 border-slate-200 rounded-md" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Job Type</label>
                  <select className="w-full mt-1 border-slate-200 rounded-md" value={formData.jobType} onChange={e=>setFormData({...formData, jobType: e.target.value as any})}>
                    <option>Full-Time</option><option>Internship</option><option>Intern + Full-Time</option>
                  </select>
                </div>
                <div><label className="text-sm font-medium">Package (LPA)</label><input type="number" step="0.1" required className="w-full mt-1 border-slate-200 rounded-md" value={formData.packageAmount} onChange={e=>setFormData({...formData, packageAmount: parseFloat(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Location</label><input required className="w-full mt-1 border-slate-200 rounded-md" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} /></div>
                <div><label className="text-sm font-medium">Work Mode</label>
                  <select className="w-full mt-1 border-slate-200 rounded-md" value={formData.workMode} onChange={e=>setFormData({...formData, workMode: e.target.value as any})}>
                    <option>On-Site</option><option>Remote</option><option>Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold border-b pb-2">Description & Eligibility</h3>
              <div><label className="text-sm font-medium">Job Description</label><textarea required rows={3} className="w-full mt-1 border-slate-200 rounded-md" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">Min CGPA</label><input type="number" step="0.1" required className="w-full mt-1 border-slate-200 rounded-md" value={formData.cgpaCutoff} onChange={e=>setFormData({...formData, cgpaCutoff: parseFloat(e.target.value)})} /></div>
                <div><label className="text-sm font-medium">Max Backlogs</label><input type="number" required className="w-full mt-1 border-slate-200 rounded-md" value={formData.backlogsAllowed} onChange={e=>setFormData({...formData, backlogsAllowed: parseInt(e.target.value)})} /></div>
                <div><label className="text-sm font-medium">Deadline</label><input type="date" required className="w-full mt-1 border-slate-200 rounded-md" value={formData.lastDateToApply} onChange={e=>setFormData({...formData, lastDateToApply: e.target.value})} /></div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Allowed Departments (Leave empty to allow all)</label>
                <div className="flex flex-wrap gap-2">
                  {departments.map(dept => (
                    <label key={dept.id} className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer text-sm ${formData.allowedDepartments?.includes(dept.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>
                      <input type="checkbox" checked={formData.allowedDepartments?.includes(dept.id) || false} onChange={() => toggleDept(dept.id)} className="hidden" />
                      {dept.code}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 md:col-span-2 flex justify-between items-center border-t pt-4">
               <div>
                  <label className="text-sm font-medium mr-3">Status</label>
                  <select className="border-slate-200 rounded-md text-sm font-medium" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value as any})}>
                    <option value="Draft">Draft</option>
                    <option value="Open">Published (Open)</option>
                    <option value="Closed">Closed</option>
                    <option value="Completed">Completed</option>
                  </select>
               </div>
               <div className="flex gap-3">
                 <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                 <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Save Drive</button>
               </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
               <div className="flex items-start gap-4">
                 {job.companyLogo ? (
                   <img src={job.companyLogo} alt={job.companyName} className="w-12 h-12 rounded bg-slate-100 object-contain" />
                 ) : (
                   <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">{job.companyName.charAt(0)}</div>
                 )}
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                   <p className="text-slate-600 text-sm font-medium">{job.companyName}</p>
                   <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                     <span className={`px-2 py-0.5 rounded-full font-medium ${job.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : job.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{job.status}</span>
                     <span>{job.packageAmount} LPA</span>
                     <span>{job.location}</span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={() => handleOpenForm(job)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"><Edit2 size={16} /></button>
               </div>
            </div>
          ))}
          {jobs.length === 0 && <div className="text-center p-8 text-slate-500 bg-white rounded-lg border">No drives created yet.</div>}
        </div>
      )}
    </div>
  );
}
