import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-shimmer rounded-lg ${className}`} aria-hidden="true" />
);

export const StatCardSkeleton = () => (
  <div className="bg-[#0d1526] rounded-xl border border-blue-500/10 p-5 space-y-3">
    <Skeleton className="h-9 w-9 rounded-lg" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-28" />
  </div>
);

export const ResumeCardSkeleton = () => (
  <div className="bg-[#0d1526] rounded-xl border border-blue-500/10 p-5 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
    <Skeleton className="h-1.5 w-full rounded-full" />
    <div className="flex gap-3">
      <Skeleton className="h-9 flex-1 rounded-lg" />
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
