import React from 'react';
import { ApplicationStatus, RuleOutcome, RuleSeverity } from '../../types/api';

interface StatusBadgeProps {
  status: ApplicationStatus | RuleOutcome | RuleSeverity | string;
  type?: 'status' | 'stage' | 'severity' | 'outcome';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  let bg = 'bg-slate-100 text-slate-800 border-slate-300';
  let label = status.replace(/_/g, ' ').toUpperCase();

  switch (status) {
    case 'approved':
    case 'pass':
    case 'compliant':
    case 'resolved':
    case 'active':
    case 'verified':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold';
      break;
    
    case 'submitted':
    case 're_scrutiny':
      bg = 'bg-sky-50 text-sky-800 border-sky-400 font-semibold';
      break;

    case 'scrutiny':
    case 'evc':
    case 'shc':
    case 'sac':
      bg = 'bg-blue-50 text-blue-900 border-blue-400 font-semibold';
      break;

    case 'rectification':
    case 'needs_attention':
    case 'needs_review':
    case 'open':
    case 'major':
      bg = 'bg-amber-50 text-amber-900 border-amber-400 font-semibold';
      break;

    case 'rectification_submitted':
      bg = 'bg-purple-50 text-purple-900 border-purple-400 font-semibold';
      label = 'RECTIFICATION SUBMITTED';
      break;

    case 'rejected':
    case 'fail':
    case 'non_compliant':
    case 'critical':
      bg = 'bg-red-50 text-red-900 border-red-500 font-bold';
      break;

    case 'draft':
    case 'minor':
    case 'info':
    case 'pending':
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
  }

  const sizeClass = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5' 
    : size === 'md' 
      ? 'text-xs px-2.5 py-1' 
      : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center gap-1 border rounded shadow-xs uppercase tracking-wider ${bg} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
};
