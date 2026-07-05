import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, BookOpen, Banknote, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentAttendance } from '../../services/attendanceService';
import { getStudentMarks } from '../../services/examService';
import { getFeeByStudent } from '../../services/financeService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const studentId = user?.referenceId; // linked student record
  const [data, setData] = useState({ attendance: null, marks: [], fee: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setIsLoading(false); return; }

    const load = async () => {
      try {
        const [attRes, marksRes, feeRes] = await Promise.all([
          getStudentAttendance(studentId).catch(() => null),
          getStudentMarks(studentId).catch(() => ({ marks: [] })),
          getFeeByStudent(studentId).catch(() => ({ fees: [] })),
        ]);

        const fees = feeRes?.fees || [];
        const currentFee = fees[0] || null;

        setData({
          attendance: attRes,
          marks: marksRes?.marks || [],
          fee: currentFee,
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [studentId]);

  const { attendance, marks, fee } = data;
  const attStats = attendance?.stats || {};
  const totalDays = attStats.total || 0;
  const presentDays = attStats.present || 0;
  const attPct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

  const lastExam = marks[0];
  const avgPct = marks.length > 0
    ? (marks.reduce((s, m) => s + (m.percentage || 0), 0) / marks.length).toFixed(1)
    : null;

  const isLowAttendance = attPct !== null && attPct < 75;

  return (
    <PageWrapper title={`Welcome, ${user?.name?.split(' ')[0]}! 👋`}>

      {/* Low Attendance Warning */}
      {isLowAttendance && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-300 text-sm">Low Attendance Alert!</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Your attendance is <strong>{attPct}%</strong>. CBSE requires a minimum of 75% to appear in board exams. Please inform your class teacher.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Attendance */}
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-blue-600" />
            </div>
            {attPct !== null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${attPct >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {attPct}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{presentDays} <span className="text-base text-slate-400 font-normal">/ {totalDays}</span></p>
          <p className="text-xs text-slate-500 mt-1">Days Present</p>
          <Link to="/my-attendance" className="text-xs text-primary-600 hover:underline mt-2 block">View Calendar →</Link>
        </div>

        {/* Last Exam */}
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {lastExam ? `${lastExam.percentage?.toFixed(0)}%` : '--'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {lastExam ? `Last: ${lastExam.examination?.name}` : 'No results yet'}
          </p>
          <Link to="/my-results" className="text-xs text-primary-600 hover:underline mt-2 block">View All Results →</Link>
        </div>

        {/* Average */}
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avgPct ? `${avgPct}%` : '--'}</p>
          <p className="text-xs text-slate-500 mt-1">Overall Average</p>
          <p className="text-xs text-slate-400 mt-2">{marks.length} exam{marks.length !== 1 ? 's' : ''} taken</p>
        </div>

        {/* Fee */}
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-orange-600" />
            </div>
            {fee?.isDefaulter && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Overdue</span>
            )}
          </div>
          <p className={`text-2xl font-bold ${fee?.totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {fee ? `₹${fee.totalDue?.toLocaleString('en-IN')}` : '--'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Fee Balance Due</p>
          <p className="text-xs text-slate-400 mt-2">Paid: ₹{(fee?.totalPaid || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Performance Summary */}
      {marks.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">📊 Exam Performance</h2>
          <div className="space-y-3">
            {marks.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 text-xs text-slate-600 dark:text-slate-400 truncate">{m.examination?.name}</div>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${m.percentage >= 75 ? 'bg-green-500' : m.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 w-20 justify-end">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{m.percentage?.toFixed(1)}%</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${m.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { to: '/my-attendance', label: 'My Attendance', icon: '📅', color: 'from-blue-400 to-blue-600' },
          { to: '/my-results', label: 'My Results', icon: '📝', color: 'from-purple-400 to-purple-600' },
          { to: '/ai', label: 'AI Study Coach', icon: '🤖', color: 'from-indigo-400 to-indigo-600' },
        ].map(({ to, label, icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`glass rounded-2xl p-5 flex flex-col items-center gap-2 text-center hover:-translate-y-1 transition-transform duration-300 border border-slate-200/50 dark:border-slate-700/50 group`}
          >
            <span className="text-3xl">{icon}</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary-600">{label}</span>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
};

export default StudentDashboard;
