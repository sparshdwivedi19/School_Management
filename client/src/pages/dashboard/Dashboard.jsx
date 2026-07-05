import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserSquare2, IndianRupee, CalendarCheck,
  TrendingUp, TrendingDown, AlertCircle, BookOpen, ArrowRight,
  Banknote
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageWrapper from '../../components/layout/PageWrapper';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const KpiCard = ({ title, value, subtitle, icon: Icon, color, linkTo, linkLabel, trend }) => (
  <div className="glass rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300 group">
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {linkTo && (
      <Link to={linkTo} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium mt-auto group-hover:gap-2 transition-all">
        {linkLabel} <ArrowRight className="w-3 h-3" />
      </Link>
    )}
  </div>
);

const AttendanceDonut = ({ present, absent, late, leave }) => {
  const total = present + absent + late + leave || 1;
  const pct = Math.round((present / total) * 100);
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
          strokeDasharray={`${pct} 100`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{pct}%</span>
        <span className="text-xs text-slate-400">Present</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState('2025-26');
  const { error } = useToast();

  useEffect(() => {
    const fetchDash = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/dashboard/summary', { params: { academicSession: session } });
        setData(res.data.data);
      } catch {
        error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDash();
  }, [session]);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
          {[...Array(8)].map((_, i) => <div key={i} className="glass h-36 rounded-2xl" />)}
        </div>
      </PageWrapper>
    );
  }

  const { students, teachers, fees, todayAttendance, monthlyExpense, recentExams } = data || {};

  return (
    <PageWrapper title="Dashboard">
      {/* Date + Session */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <p className="text-slate-500 dark:text-slate-400 text-sm">{today}</p>
        <select className="input-field py-1.5 text-sm w-32" value={session} onChange={e => setSession(e.target.value)}>
          {['2024-25', '2025-26', '2026-27'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

        <KpiCard title="Fee Collected" value={`₹${((fees?.totalPaid || 0) / 100000).toFixed(1)}L`}
          subtitle={`${fees?.collectionRate || 0}% of total billed`}
          icon={IndianRupee} color="bg-green-100 text-green-600 dark:bg-green-900/30"
          linkTo="/fees" linkLabel="Fee Details" trend={fees?.collectionRate} />

        <KpiCard title="Fee Outstanding" value={`₹${((fees?.totalDue || 0) / 100000).toFixed(1)}L`}
          subtitle={`${fees?.defaulters || 0} defaulters`}
          icon={Banknote} color="bg-red-100 text-red-600 dark:bg-red-900/30"
          linkTo="/fees/defaulters" linkLabel="View Defaulters" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Attendance Card */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Today's Attendance</h2>
            <Link to="/attendance" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Mark Attendance <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <AttendanceDonut
            present={todayAttendance?.present || 0}
            absent={todayAttendance?.absent || 0}
            late={todayAttendance?.late || 0}
            leave={todayAttendance?.leave || 0}
          />
          <div className="grid grid-cols-2 gap-2 mt-5 text-center text-xs">
            {[
              { label: 'Present', value: todayAttendance?.present || 0, color: 'text-green-600' },
              { label: 'Absent', value: todayAttendance?.absent || 0, color: 'text-red-600' },
              { label: 'Late', value: todayAttendance?.late || 0, color: 'text-yellow-600' },
              { label: 'Leave', value: todayAttendance?.leave || 0, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-lg p-2">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Financial Overview</h2>
            <Link to="/finance" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Full Dashboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Billed', value: fees?.totalBilled || 0, color: 'text-blue-600' },
              { label: 'Collected', value: fees?.totalPaid || 0, color: 'text-green-600' },
              { label: 'Monthly Expense', value: monthlyExpense || 0, color: 'text-orange-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <p className={`text-xl font-bold ${color}`}>₹{(value / 1000).toFixed(1)}K</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
          {/* Fee collection progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500">Fee Collection Progress</span>
              <span className="font-semibold text-primary-600">{fees?.collectionRate || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700"
                style={{ width: `${fees?.collectionRate || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1.5 text-slate-400">
              <span>₹0</span>
              <span>₹{((fees?.totalBilled || 0) / 100000).toFixed(1)}L Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Alerts + Recent Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">⚠️ Attention Required</h2>
          <div className="space-y-3">
            {fees?.defaulters > 0 && (
              <Link to="/fees/defaulters" className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">{fees.defaulters} Fee Defaulters</p>
                  <p className="text-xs text-red-500 dark:text-red-400">₹{(fees.totalDue / 1000).toFixed(1)}K outstanding</p>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 ml-auto" />
              </Link>
            )}
            {students?.lowAttendance > 0 && (
              <Link to="/attendance" className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">{students.lowAttendance} Students Below 75%</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Attendance alert — may affect exams</p>
                </div>
                <ArrowRight className="w-4 h-4 text-yellow-400 ml-auto" />
              </Link>
            )}
            {fees?.defaulters === 0 && students?.lowAttendance === 0 && (
              <div className="text-center p-6 text-slate-400">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm">Everything looks good! No urgent alerts.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Exams */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Recent Exams</h2>
            <Link to="/exams" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              All Exams <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!recentExams?.length ? (
            <div className="text-center p-6 text-slate-400 text-sm">No exams created yet</div>
          ) : (
            <div className="space-y-3">
              {recentExams.map((exam, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{exam.name}</p>
                    <p className="text-xs text-slate-500">Class {exam.class}-{exam.section} • {exam.type}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0 ${
                    exam.status === 'ResultPublished' ? 'bg-green-100 text-green-700 border-green-200' :
                    exam.status === 'Completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>{exam.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
