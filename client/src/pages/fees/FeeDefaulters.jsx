import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getDefaulters } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';
import { Phone } from 'lucide-react';

const FeeDefaulters = () => {
  const [defaulters, setDefaulters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ class: '', section: '' });
  const { error } = useToast();

  const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  const fetchDefaulters = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filter.class) params.class = filter.class;
      if (filter.section) params.section = filter.section;
      const data = await getDefaulters(params);
      setDefaulters(data.defaulters);
    } catch {
      error('Failed to fetch defaulters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDefaulters(); }, [filter]);

  const totalDue = defaulters.reduce((sum, d) => sum + (d.totalDue || 0), 0);

  return (
    <PageWrapper title="Fee Defaulters">
      {/* Summary Banner */}
      <div className="glass p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center justify-between bg-red-50/60 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
        <div>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Defaulters</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">{defaulters.length}</p>
        </div>
        <div>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Outstanding</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">₹{totalDue.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex gap-2">
          <select className="input-field py-1.5 text-sm" value={filter.class} onChange={e => setFilter(f => ({ ...f, class: e.target.value }))}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field py-1.5 text-sm" value={filter.section} onChange={e => setFilter(f => ({ ...f, section: e.target.value }))}>
            <option value="">All Sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : defaulters.length === 0 ? (
        <div className="glass p-12 text-center rounded-xl">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No Defaulters!</p>
          <p className="text-slate-500 mt-1">All fees have been collected for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaulters.map((d) => (
            <div key={d._id} className="glass rounded-xl p-5 border border-red-100 dark:border-red-900/30 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold">
                    {d.student?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{d.student?.name}</p>
                    <p className="text-xs text-slate-500">Class {d.class}-{d.section} • {d.student?.admissionNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Due</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">₹{d.totalDue?.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Total: ₹{d.totalFee?.toLocaleString('en-IN')} | Paid: ₹{d.totalPaid?.toLocaleString('en-IN')}</span>
                {d.student?.father?.mobile && (
                  <a href={`tel:${d.student.father.mobile}`} className="flex items-center gap-1 text-primary-600 hover:underline">
                    <Phone className="w-3 h-3" /> {d.student.father.mobile}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default FeeDefaulters;
