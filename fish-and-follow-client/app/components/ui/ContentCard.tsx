import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: boolean;
}

export function ContentCard({ 
  children, 
  className = "", 
  padding = "md",
  blur = false 
}: ContentCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = blur 
    ? "bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[#A0E9FF]/30 hover:shadow-md transition-all duration-300"
    : "bg-white shadow rounded-lg";

  return (
    <div className={`${baseClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
