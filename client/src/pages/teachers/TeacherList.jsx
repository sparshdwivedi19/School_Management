import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import { getTeachers, deleteTeacher } from '../../services/teacherService';
import { useToast } from '../../contexts/ToastContext';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  
  const { success, error } = useToast();

  const fetchTeachers = useCallback(async (page = 1, searchQuery = search) => {
    try {
      setIsLoading(true);
      const data = await getTeachers({ page, limit: 10, search: searchQuery });
      setTeachers(data.teachers);
      setPagination(data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch teachers');
    } finally {
      setIsLoading(false);
    }
  }, [error, search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleSearch = (value) => {
    setSearch(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    setDebounceTimeout(
      setTimeout(() => {
        fetchTeachers(1, value);
      }, 500)
    );
  };

  const handlePageChange = (newPage) => {
    fetchTeachers(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this teacher?')) {
      try {
        await deleteTeacher(id);
        success('Teacher removed successfully');
        fetchTeachers(pagination.page);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to remove teacher');
      }
    }
  };

  const columns = [
    {
      header: 'Staff Member',
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
            <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Emp ID', accessor: 'employeeId' },
    { 
      header: 'Designation', 
      accessor: 'designation',
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
          {row.designation}
        </span>
      )
    },
    { header: 'Mobile', accessor: 'mobile' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/teachers/${row._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="View Profile">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/teachers/${row._id}/edit`} className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => handleDelete(row._id)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const actions = (
    <Link to="/teachers/new" className="btn-primary flex items-center gap-2">
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Add Staff</span>
    </Link>
  );

  return (
    <PageWrapper title="Staff Directory">
      <DataTable 
        columns={columns}
        data={teachers}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Search by name, emp id..."
        actions={actions}
      />
    </PageWrapper>
  );
};

export default TeacherList;
