import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Key } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import DataTable from '../../components/common/DataTable';
import { getUsers, deleteUser } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  
  const { success, error } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async (page = 1, searchQuery = search) => {
    try {
      setIsLoading(true);
      const data = await getUsers({ page, limit: 10, search: searchQuery });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [error, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value) => {
    setSearch(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    setDebounceTimeout(
      setTimeout(() => {
        fetchUsers(1, value);
      }, 500)
    );
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await deleteUser(id);
        success('User deleted successfully');
        fetchUsers(pagination.page);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    principal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    operator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-500 font-bold bg-primary-100 dark:bg-primary-900/30">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{row.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${roleColors[row.role]} capitalize`}>
          {row.role}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'isActive',
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${row.isActive ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
          {row.isActive ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Action buttons (in a real app, these would open modals or link to forms) */}
          <button className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors" title="Reset Password">
            <Key className="w-4 h-4" />
          </button>
          {currentUser?._id !== row._id && (
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
    <button className="btn-primary flex items-center gap-2">
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Add User</span>
    </button>
  );

  return (
    <PageWrapper title="User Management">
      <DataTable 
        columns={columns}
        data={users}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Search by name, email..."
        actions={actions}
      />
    </PageWrapper>
  );
};

export default UserList;
