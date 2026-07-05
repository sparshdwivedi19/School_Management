import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getStudents } from '../../services/studentService';
import { markAttendance, getDailyAttendance } from '../../services/attendanceService';
import { useToast } from '../../contexts/ToastContext';
import { Save, Calendar, Search, FileDown } from 'lucide-react';

const Attendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { success, error } = useToast();

  const fetchAttendance = async () => {
    if (!selectedClass || !selectedSection || !date) return;
    
    setIsLoading(true);
    try {
      // 1. Fetch all students in class/section
      const studentsData = await getStudents({ class: selectedClass, section: selectedSection, limit: 100 }); // Assuming max 100 students per section
      setStudents(studentsData.students);

      // 2. Fetch existing attendance for the date
      const attendanceData = await getDailyAttendance({ date, class: selectedClass, section: selectedSection });
      
      // 3. Merge data
      const records = {};
      
      // Default all to Present if no record exists yet
      studentsData.students.forEach(student => {
        records[student._id] = {
          status: 'Present',
          remarks: ''
        };
      });

      // Override with existing records
      if (attendanceData.attendance && attendanceData.attendance.length > 0) {
        attendanceData.attendance.forEach(record => {
          if (record.studentId && record.studentId._id) {
            records[record.studentId._id] = {
              status: record.status,
              remarks: record.remarks || ''
            };
          }
        });
      }

      setAttendanceRecords(records);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const markAllAs = (status) => {
    const newRecords = { ...attendanceRecords };
    Object.keys(newRecords).forEach(id => {
      newRecords[id].status = status;
    });
    setAttendanceRecords(newRecords);
  };

  const handleSave = async () => {
    if (Object.keys(attendanceRecords).length === 0) return;
    
    setIsSaving(true);
    try {
      const recordsToSubmit = Object.entries(attendanceRecords).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks
      }));

      await markAttendance({
        date,
        class: selectedClass,
        section: selectedSection,
        records: recordsToSubmit
      });
      
      success('Attendance marked successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // Mock classes (in real app, fetch from school settings)
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C', 'D'];

  return (
    <PageWrapper title="Student Attendance">
      
      {/* Filters */}
      <div className="glass p-6 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input-field"
          >
            <option value="">Select Class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
            className="input-field"
          >
            <option value="">Select Section</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="w-full md:w-1/4 flex gap-2">
          <button 
            onClick={fetchAttendance}
            disabled={!selectedClass || !selectedSection || isLoading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Loading...' : <><Search className="w-4 h-4" /> Fetch</>}
          </button>
        </div>
      </div>

      {/* Attendance Grid */}
      {students.length > 0 && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40 dark:bg-slate-800/40">
            <div className="flex gap-2 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full font-medium cursor-pointer" onClick={() => markAllAs('Present')}>Mark All Present</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full font-medium cursor-pointer" onClick={() => markAllAs('Absent')}>Mark All Absent</span>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-600 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Roll No</th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Present</th>
                  <th className="px-6 py-4 font-semibold text-center">Absent</th>
                  <th className="px-6 py-4 font-semibold text-center">Half-Day</th>
                  <th className="px-6 py-4 font-semibold text-center">Leave</th>
                  <th className="px-6 py-4 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {students.map((student, idx) => (
                  <tr key={student._id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">{student.rollNumber || (idx + 1)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs">
                          {student.photo ? <img src={student.photo} alt="P" className="w-full h-full rounded-full object-cover" /> : student.name.charAt(0)}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name={`status-${student._id}`} 
                        checked={attendanceRecords[student._id]?.status === 'Present'}
                        onChange={() => handleStatusChange(student._id, 'Present')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name={`status-${student._id}`} 
                        checked={attendanceRecords[student._id]?.status === 'Absent'}
                        onChange={() => handleStatusChange(student._id, 'Absent')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name={`status-${student._id}`} 
                        checked={attendanceRecords[student._id]?.status === 'Half-Day'}
                        onChange={() => handleStatusChange(student._id, 'Half-Day')}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name={`status-${student._id}`} 
                        checked={attendanceRecords[student._id]?.status === 'Leave'}
                        onChange={() => handleStatusChange(student._id, 'Leave')}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={attendanceRecords[student._id]?.remarks || ''}
                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-primary-500"
                        placeholder="Optional remarks..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && students.length === 0 && selectedClass && selectedSection && (
        <div className="glass p-8 text-center rounded-xl text-slate-500">
          No students found for the selected class and section.
        </div>
      )}
    </PageWrapper>
  );
};

export default Attendance;
