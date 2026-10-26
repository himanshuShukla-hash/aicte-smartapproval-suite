import React from 'react';
import { ApplicationStatus } from '../../types/api';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface StageStepperProps {
  status: ApplicationStatus;
}

const STAGES = [
  { id: 'draft', label: '1. Draft Preparation' },
  { id: 'submitted', label: '2. Application Submission' },
  { id: 'scrutiny', label: '3. Regional Scrutiny' },
  { id: 'rectification', label: '4. Rectification / Re-Scrutiny' },
  { id: 'evc', label: '5. Committee & EVC' },
  { id: 'final', label: '6. Council Order' },
];

export const StageStepper: React.FC<StageStepperProps> = ({ status }) => {
  const getStageIndex = (st: ApplicationStatus): number => {
    switch (st) {
      case 'draft': return 0;
      case 'submitted': return 1;
      case 'scrutiny': return 2;
      case 'rectification':
      case 're_scrutiny': return 3;
      case 'evc':
      case 'shc':
      case 'sac': return 4;
      case 'approved':
      case 'rejected': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(status);

  return (
    <div className="bg-white border border-slate-300 rounded p-4 shadow-xs">
      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-900" />
          Official Workflow Progression Pipeline
        </span>
        <span className="text-slate-500 font-normal">
          Stage {currentIndex + 1} of 6
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex || (idx === 5 && status === 'approved');
          const isCurrent = idx === currentIndex && status !== 'approved' && status !== 'rejected';
          const isRejected = idx === 5 && status === 'rejected';

          let boxColor = 'border-slate-200 bg-slate-50 text-slate-500';
          let icon = <span className="w-5 h-5 rounded-full border border-slate-300 text-[10px] flex items-center justify-center font-bold text-slate-400">{idx + 1}</span>;

          if (isCompleted) {
            boxColor = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
          } else if (isCurrent) {
            if (status === 'rectification') {
              boxColor = 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-300';
              icon = <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />;
            } else {
              boxColor = 'border-blue-700 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-300';
              icon = <Clock className="w-5 h-5 text-blue-800 animate-spin" style={{ animationDuration: '4s' }} />;
            }
          } else if (isRejected) {
            boxColor = 'border-red-500 bg-red-50 text-red-900 font-bold';
            icon = <XCircle className="w-5 h-5 text-red-600" />;
          }

          return (
            <div
              key={stage.id}
              className={`border rounded p-2.5 flex flex-col justify-between text-xs transition-all ${boxColor}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold">{icon}</span>
                {idx < 5 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />}
              </div>
              <div className="leading-tight">
                <p className="font-semibold">{stage.label}</p>
                <p className="text-[10px] opacity-75 mt-0.5">
                  {isCompleted ? 'Completed' : isCurrent ? 'Under Active Review' : 'Upcoming'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
