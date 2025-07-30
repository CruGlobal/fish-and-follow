import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  textColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  percentage,
  icon,
  gradientFrom,
  gradientTo,
  textColor = "text-gray-800"
}: StatCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[#A0E9FF]/30 p-4 sm:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background: `linear-gradient(to bottom right, var(--${gradientFrom}), var(--${gradientTo}))`
            }}
          >
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
      </div>
      {(subtitle || percentage) && (
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            {subtitle && <span className="text-gray-500">{subtitle}</span>}
            {percentage && (
              <span 
                className="font-semibold"
                style={{ color: 'var(--brand-primary)' }}
              >
                {percentage}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
