import React from 'react';

const PageHeader = ({ label, heading, description, children }) => {
  return (
    <div className="mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          {label && (
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary dark:text-primary-light">
              {label}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {heading}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
