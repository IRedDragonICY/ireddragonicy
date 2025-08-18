import React from 'react';
import { formatUtils } from '../utils';

interface StatItemProps {
  label: string;
  value: number | string | null | undefined;
  loading: boolean;
  suffix?: string;
}

interface StatsDisplayProps {
  stats: StatItemProps[];
}

const StatItem: React.FC<StatItemProps> = ({ label, value, loading, suffix = '' }) => (
  <span className="px-2 py-1 rounded bg-white/5 text-gray-200 border border-white/10">
    {label}: {loading ? '…' : (
      typeof value === 'number' 
        ? `${formatUtils.formatNumber(value)}${suffix}` 
        : value ?? '—'
    )}
  </span>
);

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => (
  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" aria-live="polite">
    {stats.map((stat, index) => (
      <StatItem key={index} {...stat} />
    ))}
  </div>
);