import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trophy, AlertTriangle } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getExam, getExamMarks } from '../../services/examService';
import { useToast } from '../../contexts/ToastContext';

const GRADE_COLORS = {
  A1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  A2: 'bg-green-100 text-green-700 border-green-200',
  B1: 'bg-blue-100 text-blue-700 border-blue-200',
  B2: 'bg-sky-100 text-sky-700 border-sky-200',
  C1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  C2: 'bg-orange-100 text-orange-700 border-orange-200',
  D:  'bg-orange-100 text-orange-800 border-orange-300',
  E:  'bg-red-100 text-red-700 border-red-200',
};

const ResultView = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [exam, setExam] = useState(null);
  const [marks, setMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [examData, marksData] = await Promise.all([getExam(examId), getExamMarks(examId)]);
        setExam(examData.exam);
        setMarks(marksData.marks || []);
      } catch {
        error('Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [examId]);

  if (isLoading || !exam) {
    return <PageWrapper title="Loading Results..."><div className="animate-pulse glass h-64 rounded-xl" /></PageWrapper>;
  }

  const passed = marks.filter(m => m.isPassed).length;
  const failed = marks.filter(m => !m.isPassed).length;
  const classAvg = marks.length > 0 ? (marks.reduce((sum, m) => sum + (m.percentage || 0), 0) / marks.length).toFixed(1) : 0;
  const topStudent = marks[0];

  return (
    <PageWrapper title={`Results: ${exam.name}`}>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/exams')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" /> Back to Exams
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${exam.status === 'ResultPublished' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {exam.status}
          </span>
          <span className="text-sm text-slate-500">Class {exam.class}-{exam.section}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: marks.length, icon: '👥', color: 'text-slate-700' },
          { label: 'Passed', value: passed, icon: '✅', color: 'text-green-600' },
          { label: 'Failed', value: failed, icon: '❌', color: 'text-red-600' },
          { label: 'Class Average', value: `${classAvg}%`, icon: '📊', color: 'text-blue-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Topper Banner */}
      {topStudent && (
        <div className="glass rounded-xl p-4 mb-6 flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-200 dark:border-yellow-800">
          <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold uppercase tracking-wider">Class Topper</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">{topStudent.student?.name}</p>
            <p className="text-sm text-slate-500">{topStudent.percentage?.toFixed(1)}% • Grade: {topStudent.grade} • {topStudent.totalMarks}/{topStudent.totalMaxMarks}</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      {marks.length === 0 ? (
        <div className="glass p-12 text-center rounded-xl text-slate-400">
          <p className="text-4xl mb-2">📝</p>
          <p>No marks entered yet. Use the Marks Entry page to enter results.</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Student</th>
                  {exam.subjects.map(s => (
                    <th key={s.name} className="text-center px-2 py-3 font-semibold text-slate-600 dark:text-slate-400 text-xs">{s.name}</th>
                  ))}
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">%</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Grade</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Result</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marks.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{m.rank || idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                          {m.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{m.student?.name}</p>
                          <p className="text-xs text-slate-400">{m.student?.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    {exam.subjects.map(sub => {
                      const sm = m.subjectMarks?.find(s => s.subject === sub.name);
                      return (
                        <td key={sub.name} className="px-2 py-3 text-center">
                          {sm?.isAbsent
                            ? <span className="text-slate-400 text-xs">AB</span>
                            : <span className={`text-xs font-semibold ${sm?.grade === 'E' ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>{sm?.marksObtained ?? '-'}</span>
                          }
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center font-semibold text-sm">{m.totalMarks}/{m.totalMaxMarks}</td>
                    <td className="px-4 py-3 text-center font-semibold text-sm">{m.percentage?.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${GRADE_COLORS[m.grade] || 'bg-slate-100'}`}>
                        {m.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.isPassed
                        ? <span className="text-green-600 text-xs font-semibold">PASS</span>
                        : <span className="text-red-600 text-xs font-semibold flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" />FAIL</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={`/api/v1/exams/report-card/${m.student?._id}/${examId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                        title="Download Report Card"
                      >
                        <Download className="w-4 h-4 mx-auto" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ResultView;
