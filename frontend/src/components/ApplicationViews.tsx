import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../types.ts';
import KanbanBoard from './KanbanBoard.tsx';
import { LayoutGrid, List, Clock as ClockIcon, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApplicationViewsProps {
  applications: Application[];
  isStudent?: boolean;
}

const STATUS_ORDER: ApplicationStatus[] = [
  'Applied', 'Shortlisted', 'Assessment', 'Interview', 'HR Round', 'Offer', 'Placed'
];

export default function ApplicationViews({ applications, isStudent = false }: ApplicationViewsProps) {
  const [view, setView] = useState<'list' | 'kanban' | 'timeline'>('kanban');

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-lg border border-slate-200">
        You haven't applied for any placement drives yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 px-4 pt-4">
        <button onClick={() => setView('list')} className={`p-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${view === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <List size={16} /> List
        </button>
        <button onClick={() => setView('kanban')} className={`p-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${view === 'kanban' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <LayoutGrid size={16} /> Kanban
        </button>
        <button onClick={() => setView('timeline')} className={`p-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${view === 'timeline' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <ClockIcon size={16} /> Timeline
        </button>
      </div>

      <div className="p-4 bg-slate-50/50 min-h-[60vh] rounded-b-lg">
        <AnimatePresence mode="wait">
          {view === 'kanban' && (
            <motion.div key="kanban" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <KanbanBoard applications={applications} isStudent={isStudent} readOnly={isStudent} />
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">{app.jobTitle}</h4>
                    <p className="text-slate-600 font-medium mt-1">{app.companyName}</p>
                    <div className="mt-2 text-sm text-slate-500">
                      Applied on: {app.appliedDate}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Status: {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-4xl mx-auto">
              {applications.map(app => {
                const currentStatusIndex = app.status === 'Rejected' ? -1 : STATUS_ORDER.indexOf(app.status);
                
                return (
                  <div key={app.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="mb-6 border-b border-slate-100 pb-4">
                      <h4 className="font-semibold text-slate-900 text-lg">{app.jobTitle}</h4>
                      <p className="text-slate-600 font-medium">{app.companyName}</p>
                    </div>
                    
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-100"></div>
                      
                      <div className="space-y-6 relative">
                        {app.status === 'Rejected' ? (
                          <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 relative z-10"><XCircle size={20} /></div>
                             <div className="pt-2">
                               <p className="font-semibold text-red-600">Application Rejected</p>
                               <p className="text-sm text-slate-500 mt-1">{app.remarks || 'No further details available.'}</p>
                             </div>
                          </div>
                        ) : (
                          STATUS_ORDER.map((status, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;
                            const isPending = index > currentStatusIndex;
                            
                            return (
                              <div key={status} className="flex gap-4 items-start group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10 transition-colors ${
                                  isCompleted ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 border-2 border-white'
                                }`}>
                                  {isCompleted ? <CheckCircle2 size={20} /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />}
                                </div>
                                <div className="pt-2 flex-1">
                                  <p className={`font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {status}
                                  </p>
                                  {isCurrent && app.remarks && (
                                    <div className="mt-2 text-sm text-indigo-700 bg-indigo-50 p-3 rounded-md border border-indigo-100 inline-block">
                                      {app.remarks}
                                    </div>
                                  )}
                                  {isCurrent && (
                                     <p className="text-xs text-indigo-500 mt-1 uppercase tracking-wider font-semibold">Current Stage</p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
