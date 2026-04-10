import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: (item: T) => React.ReactNode;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  onSort,
  pagination,
  isLoading,
  emptyMessage = 'No data found',
  actions,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessorKey as string}
                  className={cn(
                    'px-6 py-4',
                    column.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  onClick={() => column.sortable && handleSort(column.accessorKey as string)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col opacity-50">
                        <ChevronUp className={cn('h-3 w-3', sortConfig?.key === column.accessorKey && sortConfig.direction === 'asc' && 'opacity-100 text-blue-600')} />
                        <ChevronDown className={cn('h-3 w-3 -mt-1', sortConfig?.key === column.accessorKey && sortConfig.direction === 'desc' && 'opacity-100 text-blue-600')} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-10 text-center italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  {columns.map((column) => (
                    <td key={column.accessorKey as string} className="px-6 py-4 text-slate-900 dark:text-slate-200">
                      {column.cell ? column.cell(item) : item[column.accessorKey as string]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <span className="text-xs text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
export { Table };
