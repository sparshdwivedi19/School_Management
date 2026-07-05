import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, Users, AlertCircle, Banknote } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getFeeAnalytics, getExpenseAnalytics, getSalaryAnalytics } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b'];

const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="glass rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 text-sm shadow-xl border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const FinanceDashboard = () => {
  const [feeData, setFeeData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState('2025-26');
  const { error } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [feeRes, expenseRes] = await Promise.all([
          getFeeAnalytics({ academicSession: session }),
          getExpenseAnalytics({ academicSession: session }),
        ]);
        setFeeData(feeRes);
        setExpenseData(expenseRes);
      } catch {
        error('Failed to load finance data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [session]);

  const feeSummary = feeData?.summary || {};
  const collectionRate = feeSummary.grandTotalFee
    ? Math.round((feeSummary.grandTotalPaid / feeSummary.grandTotalFee) * 100)
    : 0;

  // Prepare class-wise data for bar chart
  const classWiseData = (feeData?.classWise || []).map(item => ({
    name: `${item._id.class}-${item._id.section}`,
    'Fee Billed': item.totalFee,
    'Collected': item.totalPaid,
    'Due': item.totalDue,
  }));

  // Expense by category for pie chart
  const expenseByCategory = (expenseData?.byCategory || []).map(item => ({
    name: item._id,
    value: item.total,
  }));

  // Expense by month for area chart
  const expenseByMonth = (expenseData?.byMonth || []).map(item => ({
    month: item._id,
    Expense: item.total,
  }));

  if (isLoading) {
    return (
      <PageWrapper title="Finance Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 h-28" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Finance Dashboard">
      {/* Session Filter */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">Academic Session</p>
        <select
          className="input-field py-1.5 text-sm w-36"
          value={session}
          onChange={e => setSession(e.target.value)}
        >
          {['2024-25', '2025-26', '2026-27'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard
          title="Total Billed"
          value={`₹${(feeSummary.grandTotalFee || 0).toLocaleString('en-IN')}`}
          subtitle={`${feeSummary.totalStudents || 0} students`}
          icon={IndianRupee}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
        />
        <KpiCard
          title="Collected"
          value={`₹${(feeSummary.grandTotalPaid || 0).toLocaleString('en-IN')}`}
          subtitle={`${collectionRate}% collection rate`}
          icon={TrendingUp}
          color="bg-green-100 text-green-600 dark:bg-green-900/30"
          trend={collectionRate}
        />
        <KpiCard
          title="Outstanding"
          value={`₹${(feeSummary.grandTotalDue || 0).toLocaleString('en-IN')}`}
          subtitle={`${feeSummary.totalDefaulters || 0} defaulters`}
          icon={AlertCircle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30"
        />
        <KpiCard
          title="Total Expenses"
          value={`₹${(expenseData?.grandTotal || 0).toLocaleString('en-IN')}`}
          subtitle="All categories"
          icon={TrendingDown}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Fee Collection Progress (Overall) */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 self-start">Collection Rate</h3>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#6366f1" strokeWidth="3"
                strokeDasharray={`${collectionRate} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-primary-600">{collectionRate}%</span>
              <span className="text-xs text-slate-500">Collected</span>
            </div>
          </div>
          <div className="w-full mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Billed</span>
              <span className="font-semibold">₹{(feeSummary.grandTotalFee || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-600">Collected</span>
              <span className="font-semibold text-green-600">₹{(feeSummary.grandTotalPaid || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-500">Due</span>
              <span className="font-semibold text-red-500">₹{(feeSummary.grandTotalDue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Class-wise Fee Bar Chart */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Class-wise Fee Collection</h3>
          {classWiseData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={classWiseData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Due" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category Pie */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Expense Breakdown</h3>
          {expenseByCategory.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No expense data yet</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {expenseByCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 min-w-max">
                {expenseByCategory.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="font-semibold ml-auto">₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expense by Month Area Chart */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Monthly Expense Trend</h3>
          {expenseByMonth.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No expense data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={expenseByMonth} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Expense" stroke="#f59e0b" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default FinanceDashboard;
