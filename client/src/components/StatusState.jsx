import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className="bg-white dark:bg-charcoal rounded-[24px] border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between h-[360px] animate-pulse"
        >
          <div>
            <div className="w-full h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 shimmer"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-slate-150 dark:bg-slate-850 rounded w-1/2 mb-4"></div>
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-50 dark:border-slate-800/80 pt-4 flex items-center justify-between">
            <div className="h-4 bg-slate-150 dark:bg-slate-850 rounded w-1/4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export const EmptyState = ({ 
  title = "No items found", 
  description = "Try changing your filters or search criteria.", 
  icon: Icon = AlertTriangle, 
  actionText, 
  onAction 
}) => {
  return (
    <div className="bg-white dark:bg-charcoal p-10 md:p-12 rounded-[24px] border border-slate-100 dark:border-slate-800/80 text-center max-w-md mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-white leading-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-2 font-medium">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 btn-primary mx-auto"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState = ({ 
  message = "An error occurred while loading this section.", 
  onRetry 
}) => {
  return (
    <div className="bg-white dark:bg-charcoal p-10 md:p-12 rounded-[24px] border border-slate-100 dark:border-slate-800/80 text-center max-w-md mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <IconComponent className="w-6 h-6 text-rose-500" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-white leading-tight">
        Oops! Something went wrong
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 btn-secondary mx-auto flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      )}
    </div>
  );
};

// Internal utility helper
const IconComponent = ({ className }) => <AlertCircle className={className} />;
