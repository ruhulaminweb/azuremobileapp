import React, { useState } from 'react';
import { TimeLogEntry, WorkItem, UserSettings, DayCompliance } from '../types';
import { Calendar, AlertTriangle, Download, Plus, Trash2, Clock, CheckCircle2, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface LogScreenProps {
  timeLogs: TimeLogEntry[];
  workItems: WorkItem[];
  settings: UserSettings;
  missingDays: DayCompliance[];
  onOpenQuickLog: (workItemId?: number, date?: string) => void;
  onDeleteLog: (id: string) => void;
  onBackfillDay: (date: string, hours: number) => void;
}

export const LogScreen: React.FC<LogScreenProps> = ({
  timeLogs,
  workItems,
  settings,
  missingDays,
  onOpenQuickLog,
  onDeleteLog,
  onBackfillDay,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'daily' | 'audit'>('daily');

  // Generate 14 days list for the date selector strip
  const dateStrip = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWorking = settings.workingDays.includes(dayOfWeek);

    const loggedForDay = timeLogs
      .filter((l) => l.date === dStr)
      .reduce((sum, l) => sum + l.hours, 0);

    return {
      date: dStr,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      dayNum: d.getDate(),
      isWorking,
      logged: loggedForDay,
      target: isWorking ? settings.dailyTargetHours : 0,
    };
  });

  const selectedDateLogs = timeLogs.filter((l) => l.date === selectedDate);
  const totalSelectedHours = selectedDateLogs.reduce((sum, l) => sum + l.hours, 0);
  const isWorkingDay = settings.workingDays.includes(new Date(selectedDate).getDay());
  const dailyTarget = isWorkingDay ? settings.dailyTargetHours : 0;
  const isCompliant = !isWorkingDay || totalSelectedHours >= dailyTarget;

  // Export functions
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Work Item ID', 'Work Item Title', 'Type', 'Hours', 'Activity', 'Comment'];
    const rows = timeLogs.map((l) => [
      l.id,
      l.date,
      l.workItemId,
      `"${l.workItemTitle.replace(/"/g, '""')}"`,
      l.workItemType,
      l.hours,
      l.activity,
      `"${l.comment.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `azureops_timesheet_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Daily Timesheet Log</h2>
          <p className="text-xs text-slate-400">Date-wise attendance & compliance records</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => onOpenQuickLog(undefined, selectedDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Segmented View: Daily View vs Missing-Hours Audit */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('daily')}
          className={`py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'daily'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Timesheet
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Missing-Hours Audit ({missingDays.length})</span>
        </button>
      </div>

      {activeTab === 'daily' ? (
        <>
          {/* 14-Day Horizontal Date Strip */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
              Select Date
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {dateStrip.map((item) => {
                const isSelected = item.date === selectedDate;
                const isCompliantDay = !item.isWorking || item.logged >= item.target;
                const isDeficit = item.isWorking && item.logged < item.target;

                return (
                  <button
                    key={item.date}
                    onClick={() => setSelectedDate(item.date)}
                    className={`flex flex-col items-center min-w-[54px] py-2.5 px-1.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-sky-950 border-sky-400 ring-1 ring-sky-400 shadow-md'
                        : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium">{item.dayName}</span>
                    <span className="text-sm font-bold text-slate-100 my-0.5">{item.dayNum}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          !item.isWorking
                            ? 'bg-slate-700'
                            : item.logged >= item.target
                            ? 'bg-emerald-400'
                            : item.logged > 0
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Summary Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-slate-200">{selectedDate}</span>
                <span>·</span>
                <span>{isWorkingDay ? 'Working Day' : 'Weekend'}</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {totalSelectedHours.toFixed(1)}h
                {isWorkingDay && <span className="text-xs text-slate-400 font-normal"> / {dailyTarget}h target</span>}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                  isCompliant
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                }`}
              >
                {isCompliant ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Compliant</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Deficit -{(dailyTarget - totalSelectedHours).toFixed(1)}h</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Logged Entries for Selected Date */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Logged Work Sessions ({selectedDateLogs.length})
              </span>
            </div>

            {selectedDateLogs.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center space-y-3">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">No hours logged for {selectedDate}</p>
                {isWorkingDay && (
                  <p className="text-[11px] text-amber-400">
                    This is a working day with 0 recorded hours. Click below to log effort.
                  </p>
                )}
                <button
                  onClick={() => onOpenQuickLog(undefined, selectedDate)}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Time for This Day</span>
                </button>
              </div>
            ) : (
              selectedDateLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-extrabold">{log.hours}</span>
                      <span className="text-[9px] font-medium uppercase">hrs</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-bold text-sky-400">#{log.workItemId}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] font-medium text-slate-300">{log.activity}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100 truncate">{log.workItemTitle}</h4>
                      {log.comment && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{log.comment}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Missing-Hours Audit Tab (Consideration #2) */
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Missing-Hours Accuracy Engine</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Azure DevOps tracks cumulative Completed Work, but does not enforce date-wise daily timesheet compliance.
              This audit cross-references your daily target against recorded timesheet records to ensure zero compliance gaps.
            </p>
          </div>

          {missingDays.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">100% Compliant!</h4>
              <p className="text-xs text-slate-400">
                All working days in the evaluated period have met or exceeded the daily {settings.dailyTargetHours}h target.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {missingDays.map((d) => {
                const deficit = d.targetHours - d.recordedHours;
                return (
                  <div
                    key={d.date}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{d.date}</span>
                        <span className="text-slate-500">({d.dayName})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60">
                          Missing {deficit.toFixed(1)}h
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Recorded: {d.recordedHours}h / Target: {d.targetHours}h
                      </p>
                    </div>

                    <button
                      onClick={() => onBackfillDay(d.date, deficit)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-sm transition-transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Backfill {deficit.toFixed(1)}h</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
