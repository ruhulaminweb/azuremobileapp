import React, { useState } from 'react';
import { WorkItem, WorkItemState, WorkItemType } from '../types';
import { Search, Plus, Filter, CheckCircle, Clock, ChevronRight, AlertCircle, Layers } from 'lucide-react';

interface TasksScreenProps {
  workItems: WorkItem[];
  onOpenWorkItem: (item: WorkItem) => void;
  onOpenQuickLog: (workItemId: number) => void;
  onUpdateState: (id: number, newState: WorkItemState) => void;
  onCreateTask: (title: string, type: WorkItemType, estimate: number) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  workItems,
  onOpenWorkItem,
  onOpenQuickLog,
  onUpdateState,
  onCreateTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Doing' | 'To Do' | 'Done' | 'Bugs'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<WorkItemType>('Task');
  const [newEstimate, setNewEstimate] = useState<number>(4);

  const filteredItems = workItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'Doing') return item.state === 'Doing';
    if (activeFilter === 'To Do') return item.state === 'To Do';
    if (activeFilter === 'Done') return item.state === 'Done';
    if (activeFilter === 'Bugs') return item.type === 'Bug';
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateTask(newTitle.trim(), newType, newEstimate);
    setNewTitle('');
    setShowCreateModal(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Header & New Task Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Azure Work Items</h2>
          <p className="text-xs text-slate-400">Manage tasks, update state & sync effort</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, #ID, or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['All', 'Doing', 'To Do', 'Done', 'Bugs'] as const).map((tab) => {
          const isActive = activeFilter === tab;
          const count =
            tab === 'All'
              ? workItems.length
              : tab === 'Bugs'
              ? workItems.filter((w) => w.type === 'Bug').length
              : workItems.filter((w) => w.state === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800/80 p-6">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300">No work items found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const progress = item.originalEstimate > 0
              ? Math.min(100, (item.completedWork / item.originalEstimate) * 100)
              : 0;

            return (
              <div
                key={item.id}
                onClick={() => onOpenWorkItem(item)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-3xl p-4 transition-all cursor-pointer shadow-sm group"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">#{item.id}</span>
                    <span className="text-slate-600">·</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        item.type === 'Bug'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                          : item.type === 'User Story'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                          : 'bg-sky-950/80 text-sky-300 border border-sky-800/50'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  {/* State Pill Switcher */}
                  <select
                    value={item.state}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdateState(item.id, e.target.value as WorkItemState)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border bg-slate-950 cursor-pointer focus:outline-none ${
                      item.state === 'Done'
                        ? 'text-emerald-400 border-emerald-800/70'
                        : item.state === 'Doing'
                        ? 'text-sky-400 border-sky-800/70'
                        : item.state === 'Blocked'
                        ? 'text-rose-400 border-rose-800/70'
                        : 'text-slate-400 border-slate-700'
                    }`}
                  >
                    <option value="To Do">To Do</option>
                    <option value="Doing">Doing</option>
                    <option value="Done">Done</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-white leading-snug line-clamp-2 mb-3">
                  {item.title}
                </h3>

                {/* Azure Effort Progress */}
                <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Completed Work: <strong className="text-emerald-400">{item.completedWork}h</strong></span>
                    <span className="text-slate-400">Remaining: <strong className="text-sky-400">{item.remainingWork}h</strong></span>
                    <span className="text-slate-500">Est: {item.originalEstimate}h</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>{item.iteration}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuickLog(item.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 rounded-xl border border-sky-800/60 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Log Hours</span>
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create New Task Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Create Azure Work Item</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth2 Refresh Token Grant"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as WorkItemType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                    <option value="User Story">User Story</option>
                    <option value="Feature">Feature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Original Estimate (h)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={newEstimate}
                    onChange={(e) => setNewEstimate(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow"
                >
                  Create Work Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
