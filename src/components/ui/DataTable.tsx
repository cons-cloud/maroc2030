import * as React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { DataTablePagination } from './DataTablePagination';
import { DataTableFilters } from './DataTableFilters';

type DataTableComponent = <T extends Record<string, any>>(props: DataTableProps<T>) => React.JSX.Element;

// Composant Table simplifié pour éviter les problèmes d'importation
const TableComponent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
    {children}
  </table>
);

// Composant Skeleton simplifié
const Skeleton = ({
  className = '',
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={style}
  />
);

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  filters?: {
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filterOptions?: {
      label: string;
      value: string;
      options: { value: string; label: string }[];
      onValueChange: (value: string) => void;
    }[];
    onResetFilters?: () => void;
  };
  emptyState?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  className?: string;
  rowClassName?: string;
  headerClassName?: string;
  loadingRows?: number;
}

const DataTable: DataTableComponent = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  onRowClick,
  pagination,
  filters,
  emptyState,
  className = '',
  rowClassName = '',
  headerClassName = '',
  loadingRows = 5,
}: DataTableProps<T>) => {
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[part];
    }, obj);
  };

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    
    if (column.key.includes('.')) {
      return getNestedValue(item, column.key) || '-';
    }
    
    // Vérification de type pour éviter les erreurs
    const value = (item as any)[column.key];
    return value !== undefined && value !== null ? String(value) : '-';
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Une erreur est survenue
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showEmptyState = !loading && data.length === 0;

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {filters && (
        <DataTableFilters
          searchPlaceholder={filters.searchPlaceholder}
          searchValue={filters.searchValue}
          onSearchChange={filters.onSearchChange}
          filterOptions={filters.filterOptions}
          onResetFilters={filters.onResetFilters}
        />
      )}

      <div className="overflow-x-auto">
        <TableComponent className="min-w-full divide-y divide-gray-200">
          <thead className={`bg-gray-50 ${headerClassName}`}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key as string}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Squelette de chargement
              Array.from({ length: loadingRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column, colIndex) => (
                    <td
                      key={`skeleton-${rowIndex}-${colIndex}`}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : showEmptyState ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">
                      {emptyState?.title || 'Aucune donnée disponible'}
                    </h3>
                    <p className="text-gray-500">
                      {emptyState?.description || 'Aucun enregistrement trouvé.'}
                    </p>
                    {emptyState?.action}
                  </div>
                </td>
              </tr>
            ) : (
              // Données réelles
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(item)}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${rowClassName}`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.key as string}`}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </TableComponent>
      </div>

      {pagination && data.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <DataTablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export { DataTable };
export default DataTable;
