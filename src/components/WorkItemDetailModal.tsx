import React, { useState } from 'react';
import { WorkItem, WorkItemState, TimeLogEntry } from '../types';
import { X, Clock, User, Calendar, Tag, Layers, Check, ExternalLink, Plus } from 'lucide-react';

interface WorkItemDetailModalProps {
  item: WorkItem | null;
  onClose: () => void;
  onUpdateState: (id: number, newState: WorkItemState) => void;
  onOpenQuickLog: (workItemId: number) => void;
  timeLogs: TimeLogEntry[];
}

export const WorkItemDetailModal: React.FC<WorkItemDetailModalProps> = ({
  item,
  onClose,
  onUpdateState,
  onOpenQuickLog,
  timeLogs,
}) => {
  if (!item) return null;

  const itemLogs = timeLogs.filter((l) => l.workItemId === item.id);
  const totalItemLogged = itemLogs.reduce((sum, l) => sum + l.hours, 0);

  const states: WorkItemState[] = ['To Do', 'Doing', 'Done', 'Blocked'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-400">#{item.id}</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-medium text-slate-300">{item.type}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-base font-bold text-slate-100 leading-snug">{item.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
          </div>

          {/* State Segmented Control */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
              Work Item State
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {states.map((st) => {
                const isActive = item.state === st;
                return (
                  <button
                    key={st}
                    onClick={() => onUpdateState(item.id, st)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? st === 'Done'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : st === 'Doing'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : st === 'Blocked'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Effort Summary Card */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3.5 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Azure Scheduling Effort</span>
              <span className="text-sky-400 font-mono text-[11px] font-normal">VSTS.Scheduling</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Estimate</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{item.originalEstimate}h</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Completed</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{item.completedWork}h</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Remaining</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">{item.remainingWork}h</div>
              </div>
            </div>
          </div>

          {/* Assigned & Iteration Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
              <User className="w-4 h-4 text-slate-400" />
              <div className="truncate">
                <div className="text-[10px] text-slate-500">Assigned To</div>
                <div className="font-medium text-slate-200 truncate">{item.assignedTo.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
              <Layers className="w-4 h-4 text-slate-400" />
              <div className="truncate">
                <div className="text-[10px] text-slate-500">Iteration</div>
                <div className="font-medium text-slate-200 truncate">{item.iteration}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Timesheet History for this item */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Timesheet History ({itemLogs.length} logs · {totalItemLogged}h total)
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenQuickLog(item.id);
                }}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Time</span>
              </button>
            </div>

            {itemLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No timesheet records logged yet for this task.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {itemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg text-xs border border-slate-800/60"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{log.hours}h</span>
                      <span className="text-slate-500"> · </span>
                      <span className="text-slate-400">{log.activity}</span>
                      <div className="text-[11px] text-slate-500 truncate">{log.comment}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{log.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenQuickLog(item.id);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Time to #{item.id}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
