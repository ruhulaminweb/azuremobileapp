import React from 'react';
import { WorkItem, TimeLogEntry, UserSettings, SprintCapacity, DayCompliance } from '../types';
import { Clock, CheckCircle2, AlertCircle, ArrowUpRight, Plus, ChevronRight, Zap, Target } from 'lucide-react';
import { MissingHoursBanner } from '../components/MissingHoursBanner';

interface HomeScreenProps {
  workItems: WorkItem[];
  timeLogs: TimeLogEntry[];
  settings: UserSettings;
  sprintCapacity: SprintCapacity;
  weekCompliance: DayCompliance[];
  missingDays: DayCompliance[];
  onOpenQuickLog: (workItemId?: number, date?: string) => void;
  onOpenWorkItem: (item: WorkItem) => void;
  onNavigateToTasks: () => void;
  onNavigateToLog: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  workItems,
  timeLogs,
  settings,
  sprintCapacity,
  weekCompliance,
  missingDays,
  onOpenQuickLog,
  onOpenWorkItem,
  onNavigateToTasks,
  onNavigateToLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = timeLogs.filter((l) => l.date === todayStr);
  const todayRecorded = todayLogs.reduce((sum, l) => sum + l.hours, 0);
  const target = settings.dailyTargetHours;
  const remainingToday = Math.max(0, target - todayRecorded);
  const isCompliant = todayRecorded >= target;

  const activeTasks = workItems.filter((w) => w.state === 'Doing' || w.state === 'To Do');

  // Chart days from Sun to Thu as shown in the prompt diagram (or full week)
  const chartDays = weekCompliance.slice(0, 5); // Sun, Mon, Tue, Wed, Thu
  const maxAxisHour = 9; // 0h, 3h, 6h, 9h as shown in prompt

  // Circular progress ring metrics
  const percentage = target > 0 ? (todayRecorded / target) * 100 : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (clampedPercentage / 100) * ringCircumference;

  return (
    <div className="p-4 space-y-4">
      {/* Missing hours banner if applicable */}
      <MissingHoursBanner
        missingDays={missingDays}
        onOpenAudit={onNavigateToLog}
      />

      {/* Today's Compliance Hero Card with Circular Progress Ring */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${isCompliant ? 'bg-emerald-500/10' : 'bg-sky-500/10'}`} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Working Hours
            </span>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              isCompliant
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                : 'bg-amber-950 text-amber-400 border border-amber-800/60'
            }`}
          >
            {isCompliant ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Target Met ({clampedPercentage.toFixed(0)}%)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Missing {remainingToday.toFixed(1)}h</span>
              </>
            )}
          </span>
        </div>

        {/* Circular Progress Ring & Metrics Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          {/* Circular Progress Ring */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              className="w-36 h-36 transform -rotate-90"
              viewBox="0 0 136 136"
            >
              <defs>
                <linearGradient id="todayRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isCompliant ? '#10b981' : '#0284c7'} />
                  <stop offset="100%" stopColor={isCompliant ? '#34d399' : '#38bdf8'} />
                </linearGradient>
              </defs>

              {/* Background Track Circle */}
              <circle
                cx="68"
                cy="68"
                r={ringRadius}
                stroke="#1e293b"
                strokeWidth="11"
                fill="transparent"
              />

              {/* Animated Progress Ring */}
              <circle
                cx="68"
                cy="68"
                r={ringRadius}
                stroke="url(#todayRingGradient)"
                strokeWidth="11"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                {todayRecorded.toFixed(1)}h
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                of {target.toFixed(1)}h
              </span>
              <span
                className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full mt-1 ${
                  isCompliant
                    ? 'text-emerald-400 bg-emerald-950/80'
                    : 'text-sky-400 bg-sky-950/80'
                }`}
              >
                {clampedPercentage.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Details & Quick Logging Panel */}
          <div className="flex-1 w-full space-y-3">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Settings Target</span>
                <span className="text-xs font-semibold text-slate-200">{target.toFixed(1)}h / day</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Current Logged</span>
                <span className="text-xs font-semibold text-sky-400">{todayRecorded.toFixed(1)}h</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Remaining Deficit</span>
                <span className={`text-xs font-bold ${remainingToday > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {remainingToday > 0 ? `${remainingToday.toFixed(1)}h needed` : '0.0h (100% satisfied)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              {isCompliant
                ? 'Target hours achieved. Additional recorded effort is logged as overtime.'
                : `Under-logging alert active. Log ${remainingToday.toFixed(1)} more hours to fulfill compliance.`}
            </p>

            {/* Quick Logging Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => onOpenQuickLog(undefined, todayStr)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-md shadow-sky-600/30 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Time</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recorded vs Target Hours Chart Card (Explicitly requested in Master Prompt) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>— Recorded vs target hours</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Weekly compliance breakdown</p>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500" />
              <span className="text-slate-300 font-medium">Recorded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-500 border-t border-dashed border-slate-400" />
              <span className="text-slate-400 font-medium">Target ({target}h)</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative pt-3 pb-1">
          {/* Background Grid Lines for 0h, 3h, 6h, 9h as requested */}
          <div className="absolute inset-x-8 top-3 bottom-8 flex flex-col justify-between pointer-events-none">
            {[9, 6, 3, 0].map((hour) => (
              <div key={hour} className="w-full border-b border-slate-800/80 flex items-center">
                <span className="absolute -left-7 text-[10px] font-mono text-slate-400">
                  {hour}h
                </span>
              </div>
            ))}
          </div>

          {/* Target Reference Line (8h) */}
          <div
            className="absolute inset-x-8 border-b-2 border-dashed border-sky-400/40 pointer-events-none z-10"
            style={{
              top: `${Math.max(4, (1 - target / maxAxisHour) * 100)}%`,
            }}
          />

          {/* Bar Columns: Sun, Mon, Tue, Wed, Thu */}
          <div className="ml-7 mr-2 h-44 flex items-end justify-between px-2 sm:px-6 relative z-10">
            {chartDays.map((day) => {
              const heightPercent = Math.min(100, (day.recordedHours / maxAxisHour) * 100);
              const isToday = day.date === todayStr;
              const hasDeficit = day.isWorkingDay && day.recordedHours < day.targetHours;

              return (
                <div
                  key={day.date}
                  onClick={() => onOpenQuickLog(undefined, day.date)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded shadow mb-1 whitespace-nowrap">
                    {day.recordedHours.toFixed(1)}h
                  </div>

                  {/* Bar */}
                  <div className="w-7 sm:w-10 bg-slate-800/60 rounded-t-lg flex flex-col justify-end p-0.5 relative h-36">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        day.recordedHours >= day.targetHours
                          ? 'bg-gradient-to-t from-sky-600 to-sky-400 group-hover:from-sky-500 group-hover:to-sky-300'
                          : day.recordedHours > 0
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day label: Sun, Mon, Tue, Wed, Thu */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? 'text-sky-400 underline decoration-2' : 'text-slate-400'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    {hasDeficit && (
                      <span className="block w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto mt-0.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Azure Sprint Capacity vs Personal Hours Card (Consideration #3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sprint 24 Team vs Personal Capacity
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {sprintCapacity.startDate} - {sprintCapacity.endDate}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Distinguishes sprint/team capacity from personal daily recorded timesheets.
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Sprint Personal Target</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {sprintCapacity.personalCapacityHours} hours
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">8h × 10 working days</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Sprint Logged So Far</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              {sprintCapacity.loggedHoursInSprint} hours
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {((sprintCapacity.loggedHoursInSprint / sprintCapacity.personalCapacityHours) * 100).toFixed(0)}% capacity fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Azure Tasks in Progress */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            My Active Azure Tasks ({activeTasks.length})
          </h4>
          <button
            onClick={onNavigateToTasks}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {activeTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              onClick={() => onOpenWorkItem(task)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-2xl p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-sky-400">#{task.id}</span>
                  <span className="text-slate-500">·</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                      task.type === 'Bug'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                        : task.type === 'User Story'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                        : 'bg-sky-950/80 text-sky-300 border border-sky-800/50'
                    }`}
                  >
                    {task.type}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-[11px] font-medium text-amber-400">{task.state}</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                  {task.title}
                </h5>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>{task.completedWork}h completed</span>
                  <span>·</span>
                  <span>{task.remainingWork}h remaining</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQuickLog(task.id);
                }}
                className="p-2 text-sky-400 hover:text-white hover:bg-sky-600 rounded-xl bg-slate-800 border border-slate-700/60 transition-colors shrink-0"
                title="Log hours"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
