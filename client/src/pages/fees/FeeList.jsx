import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt, AlertCircle, IndianRupee, TrendingDown } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import { getFees } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';

const FeeList = () => {
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filter, setFilter] = useState({ isDefaulter: '', class: '', section: '' });
  const { error } = useToast();

  const fetchFees = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10 };
      if (filter.class) params.class = filter.class;
      if (filter.section) params.section = filter.section;
      if (filter.isDefaulter !== '') params.isDefaulter = filter.isDefaulter;
      const data = await getFees(params);
      setFees(data.fees);
      setPagination(data.pagination);
    } catch (err) {
      error('Failed to fetch fee records');
    } finally {
      setIsLoading(false);
    }
  }, [error, filter]);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 font-bold text-sm">
            {row.student?.photo ? <img src={row.student.photo} className="w-full h-full rounded-full object-cover" /> : row.student?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{row.student?.name}</p>
            <p className="text-xs text-slate-400">{row.student?.admissionNumber}</p>
          </div>
        </div>
      )
    },
    { header: 'Class', render: (row) => `${row.class} - ${row.section}` },
    {
      header: 'Total Fee',
      render: (row) => (
        <span className="font-semibold">₹{row.totalFee?.toLocaleString('en-IN')}</span>
      )
    },
    {
      header: 'Paid',
      render: (row) => (
        <span className="text-green-600 dark:text-green-400 font-semibold">₹{row.totalPaid?.toLocaleString('en-IN')}</span>
      )
    },
    {
      header: 'Due',
      render: (row) => (
        <span className={`font-bold ${row.totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600'}`}>
          ₹{row.totalDue?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
          !row.isDefaulter
            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {row.isDefaulter ? 'Defaulter' : 'Cleared'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <Link to={`/fees/${row._id}`} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
          <Receipt className="w-4 h-4" /> View
        </Link>
      )
    },
  ];

  return (
    <PageWrapper title="Fee Management">
      {/* Filters */}
      <div className="glass p-4 rounded-xl mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
          <select className="input-field py-1.5 text-sm" value={filter.class} onChange={e => setFilter(f => ({ ...f, class: e.target.value }))}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
          <select className="input-field py-1.5 text-sm" value={filter.section} onChange={e => setFilter(f => ({ ...f, section: e.target.value }))}>
            <option value="">All Sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select className="input-field py-1.5 text-sm" value={filter.isDefaulter} onChange={e => setFilter(f => ({ ...f, isDefaulter: e.target.value }))}>
            <option value="">All</option>
            <option value="true">Defaulters Only</option>
            <option value="false">Cleared</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Link to="/fees/defaulters" className="btn-primary flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-sm py-1.5">
            <AlertCircle className="w-4 h-4" /> Defaulters
          </Link>
          <Link to="/fees/assign" className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
            <Plus className="w-4 h-4" /> Assign Fee
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={fees}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={fetchFees}
        searchPlaceholder="Search students..."
      />
    </PageWrapper>
  );
};

export default FeeList;
