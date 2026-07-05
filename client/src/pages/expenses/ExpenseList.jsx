import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import { getExpenses, createExpense, deleteExpense } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const CATEGORIES = ['Salary', 'Electricity', 'Maintenance', 'Internet', 'Stationery', 'Events', 'Transportation', 'RentLease', 'Equipment', 'Miscellaneous'];
const PAYMENT_MODES = ['Cash', 'Online', 'Cheque', 'DD', 'UPI'];

const categoryColors = {
  Salary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Electricity: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Internet: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Stationery: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Events: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Transportation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  RentLease: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Equipment: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  Miscellaneous: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const { register, handleSubmit, reset: resetForm, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'Cash',
      academicSession: '2025-26',
      month: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    }
  });

  const fetchExpenses = async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await getExpenses({ page, limit: 10 });
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch {
      error('Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await createExpense(data);
      success('Expense recorded');
      setShowModal(false);
      resetForm();
      fetchExpenses();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      success('Expense deleted');
      fetchExpenses(pagination.page);
    } catch {
      error('Failed to delete expense');
    }
  };

  const columns = [
    {
      header: 'Title',
      render: (row) => (
        <div>
          <p className="font-semibold text-sm">{row.title}</p>
          {row.vendor && <p className="text-xs text-slate-400">{row.vendor}</p>}
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[row.category] || 'bg-slate-100 text-slate-600'}`}>
          {row.category}
        </span>
      )
    },
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-IN') },
    { header: 'Mode', accessor: 'paymentMode' },
    {
      header: 'Amount',
      render: (row) => <span className="font-bold text-red-600 dark:text-red-400">₹{row.amount?.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <PageWrapper title="Expenses">
      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={fetchExpenses}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        }
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Expense</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                  <input {...register('title', { required: true })} className="input-field" placeholder="e.g. April Electricity Bill" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select {...register('category', { required: true })} className="input-field">
                    <option value="">Select</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                  <input type="number" {...register('amount', { required: true, min: 1 })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input type="date" {...register('date', { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Mode *</label>
                  <select {...register('paymentMode')} className="input-field">
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Month *</label>
                  <input {...register('month', { required: true })} className="input-field" placeholder="e.g. June 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Session *</label>
                  <input {...register('academicSession', { required: true })} className="input-field" placeholder="e.g. 2025-26" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor</label>
                  <input {...register('vendor')} className="input-field" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice No.</label>
                  <input {...register('invoiceNumber')} className="input-field" placeholder="Optional" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                  <textarea {...register('notes')} className="input-field resize-none h-16" placeholder="Optional notes..." />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-primary flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 shadow-none">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn-primary flex-1">
                  {isSaving ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ExpenseList;
