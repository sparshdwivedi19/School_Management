import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarCheck, CalendarX, Clock, Coffee, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const STATUS_CONFIG = {
  Present: { color: 'bg-green-500', light: 'bg-green-100 text-green-700', icon: CalendarCheck },
  Absent:  { color: 'bg-red-500',   light: 'bg-red-100 text-red-700',   icon: CalendarX },
  Late:    { color: 'bg-yellow-500', light: 'bg-yellow-100 text-yellow-700', icon: Clock },
  Leave:   { color: 'bg-blue-400',  light: 'bg-blue-100 text-blue-700',  icon: Coffee },
  Holiday: { color: 'bg-slate-300', light: 'bg-slate-100 text-slate-600', icon: Coffee },
};

const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

const MyAttendance = () => {
  const { user } = useAuth();
  const studentId = user?.referenceId;
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  });
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!studentId) { setIsLoading(false); return; }
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/attendance', {
          params: { studentId, month: selectedMonth, year, limit: 100 }
        });
        setRecords(res.data.data?.attendance || []);
      } catch {
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [studentId, selectedMonth, year]);

  // Build a date→status map
  const statusMap = {};
  records.forEach(r => {
    statusMap[new Date(r.date).toDateString()] = r.status;
  });

  // Get all days in selected month/year
  const monthIndex = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(selectedMonth);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();

  const stats = {
    Present: 0, Absent: 0, Late: 0, Leave: 0,
  };
  records.forEach(r => { if (stats[r.status] !== undefined) stats[r.status]++; });
  const totalWorkingDays = records.length;
  const attPct = totalWorkingDays > 0 ? Math.round((stats.Present / totalWorkingDays) * 100) : null;

  return (
    <PageWrapper title="My Attendance">
      {/* Month Selector */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          className="input-field py-1.5 text-sm"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          className="input-field py-1.5 text-sm w-24"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {attPct !== null && (
          <span className={`ml-auto text-sm font-bold px-3 py-1.5 rounded-lg border ${attPct >= 75 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
            {attPct < 75 && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
            {attPct}% Attendance
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([status, count]) => {
          const Icon = STATUS_CONFIG[status]?.icon || CalendarCheck;
          return (
            <div key={status} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${STATUS_CONFIG[status]?.light}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{count}</p>
                <p className="text-xs text-slate-500">{status}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar */}
      <div className="glass rounded-2xl p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first day offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, monthIndex, day);
            const dateStr = date.toDateString();
            const status = statusMap[dateStr];
            const isToday = date.toDateString() === new Date().toDateString();
            const isFuture = date > new Date();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const config = STATUS_CONFIG[status];

            return (
              <div
                key={day}
                title={status || (isWeekend ? 'Weekend' : '')}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  isToday ? 'ring-2 ring-primary-500 ring-offset-1' : ''
                } ${
                  isFuture ? 'text-slate-300 dark:text-slate-600' :
                  isWeekend ? 'bg-slate-50 dark:bg-slate-800/30 text-slate-400' :
                  config ? `${config.color} text-white shadow-sm` :
                  'text-slate-400 dark:text-slate-500'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'Holiday').map(([status, { color }]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-3 h-3 rounded-sm ${color}`} />
              {status}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default MyAttendance;
