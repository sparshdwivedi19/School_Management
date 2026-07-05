import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Plus, Banknote } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import { getSalaryPayments, generatePayroll, markSalaryPaid } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const SalaryList = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const { register: regGen, handleSubmit: handleGen, formState: { errors: genErrors } } = useForm({
    defaultValues: { academicSession: '2025-26' }
  });
  const { register: regPay, handleSubmit: handlePay, reset: resetPay } = useForm({
    defaultValues: { paymentMode: 'Online' }
  });

  const fetchPayments = async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await getSalaryPayments({ page, limit: 10 });
      setPayments(data.payments);
      setPagination(data.pagination);
    } catch {
      error('Failed to fetch salary records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const onGenerate = async (data) => {
    setIsSaving(true);
    try {
      const result = await generatePayroll(data);
      success(`Payroll generated for ${result.count} staff`);
      setShowGenerateModal(false);
      fetchPayments();
    } catch (err) {
      error(err.response?.data?.message || 'Payroll generation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const onMarkPaid = async (data) => {
    setIsSaving(true);
    try {
      await markSalaryPaid(selectedRecord._id, data);
      success('Salary marked as paid');
      setShowPayModal(false);
      setSelectedRecord(null);
      resetPay();
      fetchPayments();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to mark salary as paid');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: 'Staff Member',
      render: (row) => (
        <div>
          <p className="font-semibold text-sm">{row.teacher?.name}</p>
          <p className="text-xs text-slate-400">{row.teacher?.employeeId} • {row.teacher?.designation}</p>
        </div>
      )
    },
    { header: 'Month', accessor: 'month' },
    { header: 'Net Salary', render: (row) => <span className="font-bold">₹{row.netSalary?.toLocaleString('en-IN')}</span> },
    {
      header: 'Status',
      render: (row) => (
        <span className={`flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-full border ${
          row.status === 'Paid'
            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
        }`}>
          {row.status === 'Paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          {row.status}
        </span>
      )
    },
    { header: 'Payment Date', render: (row) => row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('en-IN') : '-' },
    {
      header: 'Actions',
      render: (row) => row.status === 'Pending' ? (
        <button
          onClick={() => { setSelectedRecord(row); setShowPayModal(true); }}
          className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
        >
          <Banknote className="w-3.5 h-3.5" /> Pay
        </button>
      ) : (
        <span className="text-xs text-slate-400">—</span>
      )
    },
  ];

  return (
    <PageWrapper title="Salary Management">
      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={fetchPayments}
        actions={
          <button onClick={() => setShowGenerateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Generate Payroll
          </button>
        }
      />

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Generate Monthly Payroll</h3>
              <button onClick={() => setShowGenerateModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleGen(onGenerate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Month *</label>
                <input {...regGen('month', { required: true })} className="input-field" placeholder="e.g. June 2025" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Session *</label>
                <input {...regGen('academicSession', { required: true })} className="input-field" />
              </div>
              <p className="text-xs text-slate-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                ⚠️ This will create salary records for all active staff based on their salary configuration. Once generated, each record must be individually marked as paid.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-primary flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 shadow-none">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn-primary flex-1">{isSaving ? 'Generating...' : 'Generate'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {showPayModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mark Salary as Paid</h3>
              <button onClick={() => { setShowPayModal(false); setSelectedRecord(null); }}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold">{selectedRecord.teacher?.name}</p>
              <p className="text-slate-500">{selectedRecord.month} • ₹{selectedRecord.netSalary?.toLocaleString('en-IN')}</p>
            </div>
            <form onSubmit={handlePay(onMarkPaid)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Mode</label>
                <select {...regPay('paymentMode')} className="input-field">
                  {['Cash', 'Online', 'Cheque', 'DD', 'UPI'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Transaction ID</label>
                <input {...regPay('bankTransactionId')} className="input-field" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks</label>
                <input {...regPay('remarks')} className="input-field" placeholder="Optional" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowPayModal(false); setSelectedRecord(null); }} className="btn-primary flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 shadow-none">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn-primary flex-1">{isSaving ? 'Saving...' : 'Confirm Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default SalaryList;
