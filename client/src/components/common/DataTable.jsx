import React from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { TableSkeleton } from './Skeleton';

const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  pagination, 
  onPageChange,
  onSearch,
  searchPlaceholder = "Search...",
  actions
}) => {
  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 dark:bg-slate-800/40">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10 h-10 text-sm"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={columns.length} />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-600 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="px-6 py-4 font-semibold whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {data && data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr 
                    key={row._id || rowIndex} 
                    className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white/40 dark:bg-slate-800/40">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Showing page <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.page}</span> of <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.pages}</span>
          </span>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
