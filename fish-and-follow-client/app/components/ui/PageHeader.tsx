import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  centered?: boolean;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  centered = false, 
  className = "" 
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${centered ? 'text-center' : ''} ${className}`}>
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
    </div>
  );
}
