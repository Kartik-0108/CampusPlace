import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';

const COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'Applied', label: 'Applied', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Shortlisted', label: 'Shortlisted', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Assessment', label: 'Assessment', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Interview', label: 'Interview', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'HR Round', label: 'HR Round', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'Offer', label: 'Offer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Placed', label: 'Placed', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'Rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' }
];

interface KanbanBoardProps {
  applications: Application[];
  readOnly?: boolean;
  onStatusChange?: (id: string, newStatus: ApplicationStatus) => void;
  isStudent?: boolean;
}

export default function KanbanBoard({ applications, readOnly = true, onStatusChange, isStudent = false }: KanbanBoardProps) {
  const [draggedApp, setDraggedApp] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (readOnly) return;
    setDraggedApp(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to generate before adding opacity
    setTimeout(() => {
      const el = document.getElementById(`kanban-card-${id}`);
      if (el) el.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    if (readOnly) return;
    setDraggedApp(null);
    const el = document.getElementById(`kanban-card-${id}`);
    if (el) el.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    if (readOnly || !draggedApp) return;
    e.preventDefault();
    if (onStatusChange) {
      onStatusChange(draggedApp, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x hide-scrollbar" style={{ minHeight: '60vh' }}>
      {COLUMNS.map((col) => {
        const columnApps = applications.filter(a => a.status === col.id);
        
        return (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 flex flex-col snap-center"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={`mb-3 px-3 py-2 rounded-md border font-semibold text-sm flex items-center justify-between shadow-sm ${col.color}`}>
              <span>{col.label}</span>
              <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{columnApps.length}</span>
            </div>

            <div className="flex-1 rounded-lg bg-slate-50 border border-slate-200/60 p-3 space-y-3 min-h-[150px] transition-colors">
              <AnimatePresence>
                {columnApps.map((app) => (
                  <motion.div
                    key={app.id}
                    id={`kanban-card-${app.id}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable={!readOnly}
                    onDragStart={(e: any) => handleDragStart(e, app.id)}
                    onDragEnd={(e: any) => handleDragEnd(e, app.id)}
                    className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm ${!readOnly ? 'cursor-grab active:cursor-grabbing' : ''} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3 items-center">
                        {app.companyLogo ? (
                           <img src={app.companyLogo} className="w-8 h-8 rounded bg-slate-100 object-contain" alt="" />
                        ) : (
                           <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{app.companyName.charAt(0)}</div>
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm leading-tight">{app.jobTitle}</h4>
                          <p className="text-xs text-slate-500">{app.companyName}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!isStudent && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-700">{app.studentName}</p>
                        <p className="text-[10px] text-slate-500">{app.studentDepartment} • {app.studentCgpa} CGPA</p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> {app.appliedDate}</span>
                      <span className="truncate max-w-[100px]">{app.id.substring(0, 8)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {columnApps.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
