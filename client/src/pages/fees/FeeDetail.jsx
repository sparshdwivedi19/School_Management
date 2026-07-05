import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFee, recordPayment } from '../../services/financeService';
import PageWrapper from '../../components/layout/PageWrapper';
import { useToast } from '../../contexts/ToastContext';
import { IndianRupee, FileText, CheckCircle, Clock, Plus, X, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';

const FeeDetail = () => {
  const { id } = useParams();
  const [fee, setFee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { paymentMode: 'Cash', paymentDate: new Date().toISOString().split('T')[0] }
  });

  const fetchFee = async () => {
    try {
      setIsLoading(true);
      const data = await getFee(id);
      setFee(data.fee);
    } catch {
      error('Failed to load fee details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFee(); }, [id]);

  const onPayment = async (data) => {
    setIsSaving(true);
    try {
      const result = await recordPayment(id, { ...data, amount: Number(data.amount) });
      success(`Payment recorded! Receipt: ${result.receiptNumber}`);
      setShowPayModal(false);
      reset();
      fetchFee();
    } catch (err) {
      error(err.response?.data?.message || 'Payment failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageWrapper title="Loading..." />;
  if (!fee) return <PageWrapper title="Fee Detail"><p className="text-slate-500">Record not found.</p></PageWrapper>;

  const collectionPct = fee.totalFee > 0 ? Math.round((fee.totalPaid / fee.totalFee) * 100) : 0;

  return (
    <PageWrapper title="Fee Detail">
      {/* Header Card */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-2xl">
              {fee.student?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{fee.student?.name}</h2>
              <p className="text-sm text-slate-500">{fee.student?.admissionNumber} • Class {fee.class} - {fee.section}</p>
              <p className="text-xs text-slate-400 mt-0.5">Session: {fee.academicSession}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPayModal(true)}
            className="btn-primary flex items-center gap-2"
            disabled={fee.totalDue === 0}
          >
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-600 dark:text-slate-400">Collection Progress</span>
            <span className="font-bold text-primary-600">{collectionPct}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${collectionPct}%` }}
            />
          </div>
        </div>

        {/* KPI Mini Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Total Fee', value: fee.totalFee, color: 'text-slate-700 dark:text-slate-300' },
            { label: 'Paid', value: fee.totalPaid, color: 'text-green-600 dark:text-green-400' },
            { label: 'Due', value: fee.totalDue, color: fee.totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>₹{value?.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Structure */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Fee Structure</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 dark:bg-slate-800/40">
              <tr>
                <th className="text-left px-4 py-2 text-slate-500 font-medium">Category</th>
                <th className="text-left px-4 py-2 text-slate-500 font-medium">Description</th>
                <th className="text-right px-4 py-2 text-slate-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fee.feeStructure?.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹{item.amount?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment History */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Payment History</h3>
          </div>
          {fee.payments?.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No payments recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {fee.payments?.map((p, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">₹{p.amount?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500">{p.paymentMode} • {new Date(p.paymentDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-500">{p.receiptNumber}</p>
                    <a
                      href={`/api/v1/fees/${id}/receipt/${p.receiptNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-600 hover:underline flex items-center gap-1 justify-end mt-0.5"
                    >
                      <Download className="w-3 h-3" /> Receipt
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Record Payment</h3>
              <button onClick={() => setShowPayModal(false)} className="p-1 text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onPayment)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  {...register('amount', { required: true, min: 1, max: fee.totalDue })}
                  className="input-field"
                  placeholder={`Max due: ₹${fee.totalDue}`}
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1">Enter a valid amount (max ₹{fee.totalDue})</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Mode *</label>
                <select {...register('paymentMode')} className="input-field">
                  {['Cash', 'Online', 'Cheque', 'DD', 'UPI'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Date</label>
                <input type="date" {...register('paymentDate')} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks</label>
                <input {...register('remarks')} className="input-field" placeholder="Optional..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPayModal(false)} className="btn-primary flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 shadow-none">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn-primary flex-1">
                  {isSaving ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default FeeDetail;
