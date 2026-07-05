import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Trash2, CheckCircle, Clock, BookOpen } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import { getExams, deleteExam, publishResult } from '../../services/examService';
import { useToast } from '../../contexts/ToastContext';
import CreateExamModal from './CreateExamModal';

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  Ongoing: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  Completed: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  ResultPublished: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
};

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const { success, error } = useToast();

  const fetchExams = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await getExams({ page, limit: 10 });
      setExams(data.exams);
      setPagination(data.pagination);
    } catch {
      error('Failed to fetch exams');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam? All associated marks will also be deleted.')) return;
    try {
      await deleteExam(id);
      success('Exam deleted');
      fetchExams();
    } catch { error('Failed to delete exam'); }
  };

  const handlePublish = async (id) => {
    try {
      await publishResult(id);
      success('Result published!');
      fetchExams();
    } catch { error('Failed to publish result'); }
  };

  const columns = [
    {
      header: 'Exam',
      render: (row) => (
        <div>
          <p className="font-semibold text-sm">{row.name}</p>
          <p className="text-xs text-slate-400">Class {row.class}-{row.section} • {row.academicSession}</p>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row) => (
        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
          {row.type}
        </span>
      )
    },
    { header: 'Subjects', render: (row) => `${row.subjects?.length || 0} subjects` },
    { header: 'Start Date', render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString('en-IN') : '-' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusColors[row.status] || ''}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/exams/${row._id}/marks`} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Enter Marks">
            <BookOpen className="w-4 h-4" />
          </Link>
          <Link to={`/exams/${row._id}/results`} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors" title="View Results">
            <Eye className="w-4 h-4" />
          </Link>
          {row.status === 'Completed' && (
            <button
              onClick={() => handlePublish(row._id)}
              className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
              title="Publish Result"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <PageWrapper title="Examinations">
      <DataTable
        columns={columns}
        data={exams}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={fetchExams}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        }
      />

      {showCreate && (
        <CreateExamModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchExams(); }}
        />
      )}
    </PageWrapper>
  );
};

export default ExamList;
