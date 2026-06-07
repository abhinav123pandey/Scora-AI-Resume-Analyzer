import React from 'react';

// A simple animated shimmer placeholder for loading states.
// Use it wherever you'd normally show a spinner over content.
// Example: <Skeleton className="h-6 w-48 rounded" />
const Skeleton = ({ className = '' }) => (
  <div
    className={`bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-md ${className}`}
    aria-hidden="true"
  />
);

// Pre-built skeleton for a stat card
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
);

// Pre-built skeleton for a resume card
export const ResumeCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <div className="flex gap-3">
      <Skeleton className="h-9 flex-1 rounded-lg" />
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
