import React from 'react';
import { DayCompliance } from '../types';
import { AlertTriangle, ChevronRight, Clock } from 'lucide-react';

interface MissingHoursBannerProps {
  missingDays: DayCompliance[];
  onOpenAudit: () => void;
}

export const MissingHoursBanner: React.FC<MissingHoursBannerProps> = ({ missingDays, onOpenAudit }) => {
  if (missingDays.length === 0) return null;

  const totalMissingHours = missingDays.reduce((sum, d) => sum + (d.targetHours - d.recordedHours), 0);

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-300">
              {missingDays.length} {missingDays.length === 1 ? 'Day has' : 'Days have'} missing hours
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              -{totalMissingHours.toFixed(1)}h deficit
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Missing-day audit detected incomplete timesheets in your working cycle.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenAudit}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/40 transition-colors shrink-0"
      >
        <span>Fix</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
