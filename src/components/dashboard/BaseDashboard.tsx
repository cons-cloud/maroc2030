import React from 'react';
import type { ReactNode } from 'react';


interface BaseDashboardProps {
  children: ReactNode;
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  headerActions?: ReactNode;
  className?: string;
}

const BaseDashboard: React.FC<BaseDashboardProps> = ({
  children,
  title,
  description,
  loading = false,
  error = null,
  breadcrumbs = [],
  headerActions,
  className = '',
}) => {

  return (
    <div className={`p-4 md:p-6 ${className}`}>
        {/* Fil d'Ariane */}
        {breadcrumbs.length > 0 && (
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                  )}
                  {crumb.href ? (
                    <a 
                      href={crumb.href}
                      className={`text-sm font-medium ${
                        index === breadcrumbs.length - 1 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-white'
                      }`}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          
          {headerActions && (
            <div className="mt-4 md:mt-0">
              {headerActions}
            </div>
          )}
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Chargement...
            </span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {children}
          </div>
        )}
      </div>
  );
};

export default BaseDashboard;
