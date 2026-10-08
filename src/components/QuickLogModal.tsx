import React, { useState } from 'react';
import { WorkItem, ActivityType } from '../types';
import { X, Clock, Check, AlertCircle, Calendar } from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItems: WorkItem[];
  preselectedWorkItemId?: number;
  initialDate?: string;
  onSaveLog: (
    workItemId: number,
    hours: number,
    activity: ActivityType,
    comment: string,
    date: string
  ) => void;
}

const ACTIVITIES: ActivityType[] = [
  'Development',
  'Code Review',
  'Bugfixing',
  'Standup & Planning',
  'Testing',
  'Documentation',
];

const PRESET_HOURS = [0.5, 1.0, 2.0, 3.5, 4.0, 8.0];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  workItems,
  preselectedWorkItemId,
  initialDate,
  onSaveLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedId, setSelectedId] = useState<number>(
    preselectedWorkItemId || (workItems[0]?.id ?? 0)
  );
  const [hours, setHours] = useState<number>(2.0);
  const [activity, setActivity] = useState<ActivityType>('Development');
  const [comment, setComment] = useState<string>('');
  const [date, setDate] = useState<string>(initialDate || todayStr);

  if (!isOpen) return null;

  const currentWorkItem = workItems.find((w) => w.id === selectedId) || workItems[0];
  const currentCompleted = currentWorkItem?.completedWork ?? 0;
  const currentRemaining = currentWorkItem?.remainingWork ?? 0;
  const projectedCompleted = currentCompleted + hours;
  const projectedRemaining = Math.max(0, currentRemaining - hours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkItem || hours <= 0) return;
    onSaveLog(
      currentWorkItem.id,
      hours,
      activity,
      comment || `${activity} on #${currentWorkItem.id}`,
      date
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Log Working Hours</h3>
              <p className="text-xs text-slate-400">Record daily effort & sync to Azure DevOps task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Target Work Item Select */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
              Target Azure Work Item
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              {workItems.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.id} - [{item.type}] {item.title} ({item.state})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
              Timesheet Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="date"
                value={date}
                max={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Hours Input & Preset Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Hours Spent
              </label>
              <span className="text-sm font-bold text-sky-400">{hours} hours</span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-6 gap-1.5 mb-2.5">
              {PRESET_HOURS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setHours(preset)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                    hours === preset
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  +{preset}h
                </button>
              ))}
            </div>

            <input
              type="range"
              min="0.5"
              max="12"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Activity Category */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
              Activity Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ACTIVITIES.map((act) => (
                <button
                  type="button"
                  key={act}
                  onClick={() => setActivity(act)}
                  className={`px-2.5 py-2 text-xs font-medium rounded-lg text-left border transition-colors ${
                    activity === act
                      ? 'bg-sky-950 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Comment / Note */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
              Timesheet Note / Description
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you accomplish during this session?"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Azure DevOps Completed Work Sync Impact Preview */}
          <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-3 text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-sky-300">
              <AlertCircle className="w-4 h-4 text-sky-400" />
              <span>Azure DevOps Effort Calculation</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
              <div>
                <span>Completed Work: </span>
                <span className="text-slate-200 font-medium">
                  {currentCompleted}h → <strong className="text-emerald-400">+{hours}h ({projectedCompleted}h)</strong>
                </span>
              </div>
              <div>
                <span>Remaining Work: </span>
                <span className="text-slate-200 font-medium">
                  {currentRemaining}h → <strong className="text-sky-400">{projectedRemaining}h</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save & Log {hours}h</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
