import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Download, Edit, Trash2, Eye } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import { getStudents, deleteStudent } from '../../services/studentService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  
  const { success, error } = useToast();
  const { user } = useAuth();
  const isAdminOrPrincipal = ['admin', 'principal'].includes(user?.role);

  const fetchStudents = useCallback(async (page = 1, searchQuery = search) => {
    try {
      setIsLoading(true);
      const data = await getStudents({ page, limit: 10, search: searchQuery });
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  }, [error, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (value) => {
    setSearch(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    setDebounceTimeout(
      setTimeout(() => {
        fetchStudents(1, value);
      }, 500)
    );
  };

  const handlePageChange = (newPage) => {
    fetchStudents(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        success('Student deleted successfully');
        fetchStudents(pagination.page);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
            {row.photo ? (
              <img src={row.photo} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-primary-100 dark:bg-primary-900/30">
                {row.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold">{row.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{row.email || row.mobile || 'No contact'}</p>
          </div>
        </div>
      )
    },
    { header: 'Adm No.', accessor: 'admissionNumber' },
    { 
      header: 'Class', 
      accessor: 'class',
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
          {row.class} - {row.section}
        </span>
      )
    },
    { 
      header: 'Gender', 
      accessor: 'gender',
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400">{row.gender}</span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/students/${row._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="View Profile">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/students/${row._id}/edit`} className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          {isAdminOrPrincipal && (
            <button 
              onClick={() => handleDelete(row._id)}
              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const actions = (
    <>
      <button className="btn-primary bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 flex items-center gap-2 font-medium shadow-sm">
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>
      <Link to="/students/new" className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Student</span>
      </Link>
    </>
  );

  return (
    <PageWrapper title="Students Directory">
      <DataTable 
        columns={columns}
        data={students}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Search by name, adm no..."
        actions={actions}
      />
    </PageWrapper>
  );
};

export default StudentList;
