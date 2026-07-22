import React, { useState, useMemo } from 'react';
import { Job, Interview } from '../types.ts';
import { ChevronLeft, ChevronRight, Briefcase, Users, Calendar as CalendarIcon } from 'lucide-react';

interface AdminCalendarProps {
  jobs: Job[];
  interviews: Interview[];
}

export default function AdminCalendar({ jobs, interviews }: AdminCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = () => setCurrentDate(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    const dayJobs = jobs.filter(j => j.lastDateToApply.startsWith(dateString));
    const dayInterviews = interviews.filter(i => i.dateTime.startsWith(dateString));
    
    return { jobs: dayJobs, interviews: dayInterviews };
  };

  const renderCalendarDays = () => {
    const blanks = [];
    for (let i = 0; i < firstDay; i++) {
      blanks.push(<div key={`blank-${i}`} className="p-2 border border-slate-100 bg-slate-50 min-h-[100px]"></div>);
    }

    const daysInMonthArray = [];
    for (let d = 1; d <= days; d++) {
      const currentDayDate = new Date(year, month, d);
      // to keep it local time matching YYYY-MM-DD
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const dayJobs = jobs.filter(j => j.lastDateToApply.startsWith(dateString));
      const dayInterviews = interviews.filter(i => i.dateTime.startsWith(dateString));
      
      const isToday = new Date().toDateString() === currentDayDate.toDateString();

      daysInMonthArray.push(
        <div key={d} className={`p-2 border border-slate-100 min-h-[120px] transition-colors hover:bg-slate-50 ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
              {d}
            </span>
          </div>
          
          <div className="space-y-1.5 mt-2">
            {dayJobs.map(job => (
              <div key={job.id} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 p-1.5 rounded truncate flex items-center gap-1.5" title={`Job Deadline: ${job.companyName} - ${job.title}`}>
                <Briefcase size={12} className="shrink-0" />
                <span className="truncate">{job.companyName} Deadline</span>
              </div>
            ))}
            
            {dayInterviews.map(interview => (
              <div key={interview.id} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 p-1.5 rounded truncate flex items-center gap-1.5" title={`Interview: ${interview.companyName} - ${interview.studentName}`}>
                <Users size={12} className="shrink-0" />
                <span className="truncate">{new Date(interview.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {interview.companyName}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return [...blanks, ...daysInMonthArray];
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
            <CalendarIcon size={18} className="text-indigo-600" />
            Placement Calendar
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">Track upcoming placement drives deadlines and scheduled interviews.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={today} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            Today
          </button>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-slate-900 min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
        
        <div className="mt-5 flex items-center gap-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <span className="text-sm text-slate-600 font-medium">Job Application Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
            <span className="text-sm text-slate-600 font-medium">Scheduled Interview</span>
          </div>
        </div>
      </div>
    </div>
  );
}
