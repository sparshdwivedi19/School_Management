import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getExam, getExamMarks, bulkEnterMarks } from '../../services/examService';
import { getStudents } from '../../services/studentService';
import { useToast } from '../../contexts/ToastContext';

const gradeColors = {
  A1: 'text-emerald-600 font-bold', A2: 'text-green-600 font-bold',
  B1: 'text-blue-600 font-semibold', B2: 'text-blue-500 font-semibold',
  C1: 'text-yellow-600', C2: 'text-orange-600',
  D: 'text-orange-700', E: 'text-red-600 font-bold',
};

const MarksEntry = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: { subjectName: { obtained, isAbsent } } }
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [examData, existingMarks, studentsData] = await Promise.all([
          getExam(examId),
          getExamMarks(examId),
          null, // fetched below
        ]);

        const exam = examData.exam;
        setExam(exam);

        const studRes = await getStudents({ class: exam.class, section: exam.section, limit: 100 });
        const studentList = studRes.students || [];
        setStudents(studentList);

        // Initialize marks data
        const initial = {};
        studentList.forEach(student => {
          initial[student._id] = {};
          exam.subjects.forEach(sub => {
            initial[student._id][sub.name] = { obtained: '', isAbsent: false, maxMarks: sub.maxMarks };
          });
        });

        // Pre-fill with existing marks
        (existingMarks.marks || []).forEach(markDoc => {
          const sid = markDoc.student?._id;
          if (!sid || !initial[sid]) return;
          markDoc.subjectMarks.forEach(sm => {
            if (initial[sid][sm.subject]) {
              initial[sid][sm.subject] = {
                obtained: sm.isAbsent ? '' : sm.marksObtained,
                isAbsent: sm.isAbsent,
                maxMarks: sm.maxMarks,
              };
            }
          });
        });

        setMarksData(initial);
      } catch (err) {
        error('Failed to load exam data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [examId]);

  const handleMarksChange = (studentId, subjectName, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectName]: { ...prev[studentId][subjectName], obtained: value }
      }
    }));
  };

  const handleAbsentToggle = (studentId, subjectName) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectName]: { ...prev[studentId][subjectName], isAbsent: !prev[studentId][subjectName]?.isAbsent, obtained: '' }
      }
    }));
  };

  const handleSave = async () => {
    if (!exam) return;
    setIsSaving(true);
    try {
      const entries = students.map(student => ({
        studentId: student._id,
        subjectMarks: exam.subjects.map(sub => {
          const entry = marksData[student._id]?.[sub.name] || {};
          return {
            subject: sub.name,
            maxMarks: sub.maxMarks,
            marksObtained: entry.isAbsent ? 0 : (Number(entry.obtained) || 0),
            isAbsent: entry.isAbsent || false,
          };
        })
      }));

      await bulkEnterMarks({ examinationId: examId, entries });
      success('Marks saved and grades calculated!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !exam) {
    return <PageWrapper title="Loading Marks Entry..."><div className="animate-pulse glass h-64 rounded-xl" /></PageWrapper>;
  }

  return (
    <PageWrapper title={`Marks Entry: ${exam.name}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button onClick={() => navigate('/exams')} className="flex items-center gap-1 hover:text-primary-600">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>•</span>
          <span>Class {exam.class}-{exam.section}</span>
          <span>•</span>
          <span>{students.length} students</span>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Marks'}
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 sticky left-0 bg-slate-50/80 dark:bg-slate-800/50 min-w-[180px]">
                  Student
                </th>
                {exam.subjects.map(sub => (
                  <th key={sub.name} className="px-3 py-3 font-semibold text-slate-600 dark:text-slate-400 text-center min-w-[120px]">
                    <p>{sub.name}</p>
                    <p className="text-xs font-normal text-slate-400">/ {sub.maxMarks}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student, idx) => (
                <tr key={student._id} className={`${idx % 2 === 0 ? 'bg-white/40 dark:bg-slate-900/20' : ''} hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors`}>
                  <td className="px-4 py-3 sticky left-0 bg-inherit">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                        {student.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.admissionNumber}</p>
                      </div>
                    </div>
                  </td>
                  {exam.subjects.map(sub => {
                    const entry = marksData[student._id]?.[sub.name] || {};
                    const pct = entry.isAbsent ? null : (Number(entry.obtained) / sub.maxMarks * 100);
                    const gradeKey = pct === null ? null : pct >= 91 ? 'A1' : pct >= 81 ? 'A2' : pct >= 71 ? 'B1' : pct >= 61 ? 'B2' : pct >= 51 ? 'C1' : pct >= 41 ? 'C2' : pct >= 33 ? 'D' : 'E';

                    return (
                      <td key={sub.name} className="px-3 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={sub.maxMarks}
                            value={entry.isAbsent ? '' : (entry.obtained ?? '')}
                            onChange={e => handleMarksChange(student._id, sub.name, e.target.value)}
                            disabled={entry.isAbsent}
                            className="w-16 text-center px-2 py-1 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-40"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={entry.isAbsent || false}
                              onChange={() => handleAbsentToggle(student._id, sub.name)}
                              className="w-3 h-3"
                              id={`ab-${student._id}-${sub.name}`}
                            />
                            <label htmlFor={`ab-${student._id}-${sub.name}`} className="text-xs text-slate-400 cursor-pointer">AB</label>
                            {gradeKey && (
                              <span className={`text-xs ml-1 ${gradeColors[gradeKey] || ''}`}>{gradeKey}</span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default MarksEntry;
