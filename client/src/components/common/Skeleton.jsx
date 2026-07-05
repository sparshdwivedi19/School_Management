import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'bg-slate-200 dark:bg-slate-700 animate-pulse';
  
  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded-sm h-4 w-full',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="glass p-6 rounded-xl flex flex-col gap-4 w-full">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-1/4" />
      </div>
    </div>
    <Skeleton variant="rectangular" className="w-full h-32" />
    <div className="flex justify-between mt-2">
      <Skeleton variant="text" className="w-1/4" />
      <Skeleton variant="text" className="w-1/4" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="glass rounded-xl overflow-hidden">
    <div className="flex p-4 border-b border-slate-200 dark:border-slate-700">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" className="flex-1 mx-2" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" className="flex-1 mx-2 h-3" />
        ))}
      </div>
    ))}
  </div>
);
