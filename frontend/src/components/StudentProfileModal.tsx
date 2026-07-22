import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StudentProfile } from '../types.ts';
import { ExternalLink, Briefcase, GraduationCap, X, Edit2, Check, Loader2 } from 'lucide-react';

interface StudentProfileModalProps {
  profile: StudentProfile;
  onClose: () => void;
  isAdmin?: boolean;
  onUpdateStatus?: (status: 'Placed' | 'Unplaced', company?: string, packageAmt?: number) => Promise<void>;
}

export default function StudentProfileModal({ profile, onClose, isAdmin, onUpdateStatus }: StudentProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<'Placed' | 'Unplaced'>(profile.placedStatus);
  const [editCompany, setEditCompany] = useState(profile.placementCompany || '');
  const [editPackage, setEditPackage] = useState(profile.placementPackage?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdateStatus) return;
    setIsSaving(true);
    try {
      await onUpdateStatus(
        editStatus, 
        editStatus === 'Placed' ? editCompany : undefined,
        editStatus === 'Placed' ? Number(editPackage) : undefined
      );
      setIsEditing(false);
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
              <GraduationCap className="text-indigo-600" size={20} />
              {profile.name}
            </h3>
            <p className="text-sm text-slate-500 font-mono mt-1">{profile.rollNumber} • {profile.department}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 bg-white flex-1">
          {/* Academic Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Academic Overview</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">CGPA</div>
                <div className="font-semibold text-slate-900">{profile.cgpa}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Active Backlogs</div>
                <div className="font-semibold text-slate-900">{profile.backlogs}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                   <span className={`w-2 h-2 rounded-full ${profile.placedStatus === 'Placed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                   {profile.placedStatus}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-center">
                 {profile.resumeUrl ? (
                   <a href={profile.resumeUrl} target="_blank" rel="noreferrer" download={(profile.resumeUrl || '').startsWith('data:') ? 'resume.pdf' : undefined} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                     <ExternalLink size={14} />
                     View Resume
                   </a>
                 ) : (
                   <span className="text-slate-400 text-sm">No Resume</span>
                 )}
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Technical Skills</h4>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1.5 rounded-md font-medium border border-indigo-100">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No technical skills listed.</p>
            )}
          </div>

          {/* Projects */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Briefcase size={14} /> Projects & Experience
            </h4>
            {profile.projects && profile.projects.length > 0 ? (
              <div className="space-y-4">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="border-l-2 border-indigo-200 pl-4 py-1">
                    <h5 className="font-semibold text-slate-900">{proj.title}</h5>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2">
                        <ExternalLink size={12} /> View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No projects added yet.</p>
            )}
          </div>
          
          {/* Placement Offer (Editable by Admin) */}
          {(profile.placedStatus === 'Placed' || isAdmin) && (
            <div>
               <div className="flex items-center justify-between mb-3 border-b border-emerald-100 pb-2">
                 <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Placement Offer</h4>
                 {isAdmin && !isEditing && (
                   <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                     <Edit2 size={12} /> Edit Status
                   </button>
                 )}
               </div>

               {isEditing ? (
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-medium text-slate-700 mb-1">Placement Status</label>
                       <select 
                         value={editStatus} 
                         onChange={(e) => setEditStatus(e.target.value as 'Placed' | 'Unplaced')}
                         className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                       >
                         <option value="Unplaced">Unplaced</option>
                         <option value="Placed">Placed</option>
                       </select>
                     </div>
                     {editStatus === 'Placed' && (
                       <>
                         <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                           <input 
                             type="text" 
                             value={editCompany} 
                             onChange={(e) => setEditCompany(e.target.value)}
                             placeholder="e.g. Google"
                             className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">Package (LPA)</label>
                           <input 
                             type="number" 
                             value={editPackage} 
                             onChange={(e) => setEditPackage(e.target.value)}
                             placeholder="e.g. 15.5"
                             className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                           />
                         </div>
                       </>
                     )}
                   </div>
                   <div className="flex items-center gap-2 pt-2 justify-end">
                     <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors">
                       Cancel
                     </button>
                     <button onClick={handleSave} disabled={isSaving} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                       {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                       Save Changes
                     </button>
                   </div>
                 </div>
               ) : profile.placedStatus === 'Placed' ? (
                 <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                   <p className="text-emerald-800 font-medium">Offered role at <span className="font-bold">{profile.placementCompany}</span> for <span className="font-bold">{profile.placementPackage} LPA</span></p>
                 </div>
               ) : (
                 <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                   <p className="text-slate-500 text-sm italic">Student is currently unplaced.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
