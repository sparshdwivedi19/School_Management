import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { Download, FileText, TrendingUp, Award } from 'lucide-react';
import { getStudentMarks, getReportCardUrl } from '../../services/examService';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const GRADE_COLORS = {
  A1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  A2: 'bg-green-100 text-green-700 border-green-200',
  B1: 'bg-blue-100 text-blue-700 border-blue-200',
  B2: 'bg-sky-100 text-sky-700 border-sky-200',
  C1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  C2: 'bg-orange-100 text-orange-700 border-orange-200',
  D: 'bg-orange-100 text-orange-800 border-orange-300',
  E: 'bg-red-100 text-red-700 border-red-200',
};

const MyResults = () => {
  const { user } = useAuth();
  const studentId = user?.referenceId;
  const [marks, setMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!studentId) { setIsLoading(false); return; }
    getStudentMarks(studentId)
      .then(data => {
        setMarks(data.marks || []);
        if (data.marks?.length > 0) setSelected(data.marks[0]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [studentId]);

  // Build radar chart data from selected exam's subject marks
  const radarData = selected?.subjectMarks?.map(sm => ({
    subject: sm.subject,
    score: sm.isAbsent ? 0 : Math.round((sm.marksObtained / sm.maxMarks) * 100),
    fullMark: 100,
  })) || [];

  return (
    <PageWrapper title="My Results">
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="glass h-20 rounded-xl" />)}
        </div>
      ) : marks.length === 0 ? (
        <div className="glass p-16 text-center rounded-xl text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">No results published yet</p>
          <p className="text-sm mt-1">Check back after your exams are evaluated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam List */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Examinations</h2>
            {marks.map((m, i) => (
              <button
                key={i}
                onClick={() => setSelected(m)}
                className={`w-full text-left glass rounded-xl p-4 border transition-all hover:-translate-y-0.5 ${
                  selected?._id === m._id
                    ? 'border-primary-400 dark:border-primary-500 shadow-md'
                    : 'border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{m.examination?.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.examination?.type} • {m.examination?.academicSession}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${m.isPassed ? 'text-green-600' : 'text-red-600'}`}>{m.percentage?.toFixed(1)}%</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${GRADE_COLORS[m.grade] || ''}`}>{m.grade}</span>
                  </div>
                </div>
                <div className="mt-2 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${m.percentage >= 75 ? 'bg-green-500' : m.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Detail View */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selected.examination?.name}</h2>
                    <p className="text-sm text-slate-500">{selected.examination?.type} • {selected.totalMarks}/{selected.totalMaxMarks} marks</p>
                  </div>
                  <a
                    href={getReportCardUrl(studentId, selected.examination?._id)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary flex items-center gap-2 text-sm py-2"
                  >
                    <Download className="w-4 h-4" /> Report Card
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{selected.percentage?.toFixed(1)}%</p>
                    <p className="text-xs text-slate-400">Percentage</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${GRADE_COLORS[selected.grade]?.includes('emerald') || GRADE_COLORS[selected.grade]?.includes('green') ? 'text-green-600' : 'text-orange-600'}`}>{selected.grade}</p>
                    <p className="text-xs text-slate-400">Grade</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{selected.rank || '-'}</p>
                    <p className="text-xs text-slate-400">Class Rank</p>
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              {radarData.length > 2 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Subject Performance Radar</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      <Tooltip formatter={(v) => `${v}%`} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Subject-wise Marks */}
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Subject</th>
                      <th className="text-center px-4 py-3 text-slate-500 font-medium">Marks</th>
                      <th className="text-center px-4 py-3 text-slate-500 font-medium">%</th>
                      <th className="text-center px-4 py-3 text-slate-500 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selected.subjectMarks?.map((sm, i) => {
                      const pct = sm.isAbsent ? 0 : ((sm.marksObtained / sm.maxMarks) * 100).toFixed(1);
                      return (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{sm.subject}</td>
                          <td className="px-4 py-3 text-center">
                            {sm.isAbsent ? <span className="text-slate-400 text-xs">Absent</span> : `${sm.marksObtained} / ${sm.maxMarks}`}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{sm.isAbsent ? '-' : `${pct}%`}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${GRADE_COLORS[sm.grade] || 'bg-slate-100 border-slate-200'}`}>
                              {sm.grade || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default MyResults;
