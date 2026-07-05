import React, { useState } from 'react';
import { Download, FileSpreadsheet, Users, CalendarCheck, Banknote, Briefcase, BarChart3 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useToast } from '../../contexts/ToastContext';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

const REPORTS = [
  {
    id: 'students',
    label: 'Student Directory',
    description: 'All student records with personal, academic, and contact details',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    fields: ['class', 'section', 'academicSession'],
  },
  {
    id: 'fees',
    label: 'Fee Collection Report',
    description: 'Class-wise fee billing, collection, dues, and defaulter status',
    icon: Banknote,
    color: 'from-green-500 to-emerald-600',
    fields: ['class', 'section', 'academicSession'],
  },
  {
    id: 'attendance',
    label: 'Attendance Report',
    description: 'Monthly attendance matrix for a class and section',
    icon: CalendarCheck,
    color: 'from-yellow-500 to-orange-500',
    fields: ['class', 'section', 'month'],
    required: ['class', 'section'],
  },
  {
    id: 'salary',
    label: 'Salary Register',
    description: 'Staff salary payments, status, and disbursement details',
    icon: Briefcase,
    color: 'from-purple-500 to-purple-600',
    fields: ['month', 'academicSession'],
  },
  {
    id: 'financial',
    label: 'Financial Summary',
    description: 'Annual income, expenditure, and net surplus report',
    icon: BarChart3,
    color: 'from-rose-500 to-pink-600',
    fields: ['academicSession'],
  },
];

const ReportCard = ({ report }) => {
  const [params, setParams] = useState({ academicSession: '2025-26' });
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError } = useToast();
  const Icon = report.icon;

  const handleDownload = async () => {
    // Validate required fields
    for (const f of (report.required || [])) {
      if (!params[f]) {
        showError(`Please select ${f}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/reports/${report.id}?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Report generation failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.label.replace(/\s+/g, '-')}-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showError('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${report.color} p-5 text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">{report.label}</h3>
            <p className="text-xs text-white/80 mt-0.5">{report.description}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 space-y-3">
        {report.fields.includes('class') && (
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Class</label>
            <select className="input-field text-sm py-1.5" value={params.class || ''} onChange={e => setParams(p => ({ ...p, class: e.target.value }))}>
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {report.fields.includes('section') && (
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Section</label>
            <select className="input-field text-sm py-1.5" value={params.section || ''} onChange={e => setParams(p => ({ ...p, section: e.target.value }))}>
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        {report.fields.includes('month') && (
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Month</label>
            <select className="input-field text-sm py-1.5" value={params.month || ''} onChange={e => setParams(p => ({ ...p, month: e.target.value }))}>
              <option value="">All Months</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
        {report.fields.includes('academicSession') && (
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Academic Session</label>
            <select className="input-field text-sm py-1.5" value={params.academicSession} onChange={e => setParams(p => ({ ...p, academicSession: e.target.value }))}>
              {['2024-25', '2025-26', '2026-27'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isLoading ? 'Generating...' : 'Download Excel'}
          <FileSpreadsheet className="w-4 h-4 opacity-70" />
        </button>
      </div>
    </div>
  );
};

const ReportsCenter = () => (
  <PageWrapper title="Reports Center">
    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
      Generate and download Excel reports for all school data. Select your filters, then click Download.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {REPORTS.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  </PageWrapper>
);

export default ReportsCenter;
