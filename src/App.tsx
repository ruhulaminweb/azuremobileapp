/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  WorkItem,
  TimeLogEntry,
  AzureConfig,
  UserSettings,
  NavTab,
  WorkItemState,
  WorkItemType,
  ActivityType,
} from './types';
import { AzureDevOpsService } from './services/azureDevOps';
import { INITIAL_SPRINT_CAPACITY } from './data/mockData';
import { HeaderBar } from './components/HeaderBar';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { QuickLogModal } from './components/QuickLogModal';
import { WorkItemDetailModal } from './components/WorkItemDetailModal';
import { FlutterExporterModal } from './components/FlutterExporterModal';
import { HomeScreen } from './screens/HomeScreen';
import { TasksScreen } from './screens/TasksScreen';
import { LogScreen } from './screens/LogScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { Bell, X } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<AzureConfig>(() => AzureDevOpsService.loadConfig());
  const [settings, setSettings] = useState<UserSettings>(() => AzureDevOpsService.loadSettings());
  const [workItems, setWorkItems] = useState<WorkItem[]>(() => AzureDevOpsService.loadWorkItems());
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>(() => AzureDevOpsService.loadTimeLogs());
  const [sprintCapacity, setSprintCapacity] = useState(INITIAL_SPRINT_CAPACITY);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Modals state
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogWorkItemId, setQuickLogWorkItemId] = useState<number | undefined>(undefined);
  const [quickLogDate, setQuickLogDate] = useState<string | undefined>(undefined);

  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);

  // Simulated push notification toast
  const [notificationToast, setNotificationToast] = useState<{ title: string; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Compute compliance lists
  const weekCompliance = AzureDevOpsService.getWeekCompliance(new Date(), timeLogs, settings);
  const missingDays = AzureDevOpsService.findMissingDays(timeLogs, settings, 14);

  // Active tasks count for bottom nav badge
  const activeTasksCount = workItems.filter((w) => w.state === 'Doing').length;

  const handleOpenQuickLog = (workItemId?: number, date?: string) => {
    setQuickLogWorkItemId(workItemId);
    setQuickLogDate(date);
    setIsQuickLogOpen(true);
  };

  const handleSaveLog = (
    workItemId: number,
    hours: number,
    activity: ActivityType,
    comment: string,
    date: string
  ) => {
    const targetItem = workItems.find((w) => w.id === workItemId);
    const newLog: TimeLogEntry = {
      id: `log-${Date.now()}`,
      workItemId,
      workItemTitle: targetItem ? targetItem.title : `Task #${workItemId}`,
      workItemType: targetItem ? targetItem.type : 'Task',
      date,
      hours,
      activity,
      comment,
      syncedToAzure: true,
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...timeLogs];
    setTimeLogs(updatedLogs);
    AzureDevOpsService.saveTimeLogs(updatedLogs);

    // Update cumulative completedWork and remainingWork on Azure Work Item
    const updatedWorkItems = workItems.map((item) => {
      if (item.id === workItemId) {
        const newCompleted = item.completedWork + hours;
        const newRemaining = Math.max(0, item.remainingWork - hours);
        return {
          ...item,
          completedWork: newCompleted,
          remainingWork: newRemaining,
          changedDate: new Date().toISOString(),
        };
      }
      return item;
    });

    setWorkItems(updatedWorkItems);
    AzureDevOpsService.saveWorkItems(updatedWorkItems);

    // Update sprint logged total
    setSprintCapacity((prev) => ({
      ...prev,
      loggedHoursInSprint: prev.loggedHoursInSprint + hours,
    }));
  };

  const handleUpdateState = (id: number, newState: WorkItemState) => {
    const updated = workItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          state: newState,
          remainingWork: newState === 'Done' ? 0 : item.remainingWork,
          changedDate: new Date().toISOString(),
        };
      }
      return item;
    });
    setWorkItems(updated);
    AzureDevOpsService.saveWorkItems(updated);
  };

  const handleCreateTask = (title: string, type: WorkItemType, estimate: number) => {
    const newId = 10500 + workItems.length + 1;
    const newItem: WorkItem = {
      id: newId,
      title,
      type,
      state: 'To Do',
      assignedTo: {
        name: config.userName || 'Alex Morgan',
        email: config.userEmail || 'alex.morgan@contoso.com',
      },
      iteration: 'Sprint 24',
      areaPath: `${config.project || 'Fintech-Core'}\\NewWork`,
      originalEstimate: estimate,
      completedWork: 0,
      remainingWork: estimate,
      priority: 2,
      tags: ['AzureOps', type],
      description: 'Created from AzureOps Mobile companion.',
      createdDate: new Date().toISOString(),
      changedDate: new Date().toISOString(),
    };

    const updated = [newItem, ...workItems];
    setWorkItems(updated);
    AzureDevOpsService.saveWorkItems(updated);
  };

  const handleDeleteLog = (id: string) => {
    const updated = timeLogs.filter((l) => l.id !== id);
    setTimeLogs(updated);
    AzureDevOpsService.saveTimeLogs(updated);
  };

  const handleBackfillDay = (date: string, hours: number) => {
    const firstTask = workItems[0];
    handleSaveLog(
      firstTask.id,
      hours,
      'Development',
      `Timesheet backfill to satisfy daily target`,
      date
    );
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setConfig((prev) => ({
        ...prev,
        lastSyncTime: 'Just now',
      }));
      setNotificationToast({
        title: 'Azure DevOps Synced',
        message: 'Successfully refreshed work items and capacity from cloud server.',
      });
      setTimeout(() => setNotificationToast(null), 4000);
    }, 900);
  };

  const handleTriggerNotificationSim = (title: string, message: string) => {
    setNotificationToast({ title, message });
    setTimeout(() => setNotificationToast(null), 5000);
  };

  const handleResetData = () => {
    AzureDevOpsService.resetToDemo();
    setConfig(AzureDevOpsService.loadConfig());
    setSettings(AzureDevOpsService.loadSettings());
    setWorkItems(AzureDevOpsService.loadWorkItems());
    setTimeLogs(AzureDevOpsService.loadTimeLogs());
    setSprintCapacity(INITIAL_SPRINT_CAPACITY);
    setNotificationToast({
      title: 'Data Reset',
      message: 'Restored default enterprise demo dataset.',
    });
    setTimeout(() => setNotificationToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Global Header Bar */}
      <HeaderBar
        config={config}
        isMobileFrame={isMobileFrame}
        onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenExporter={() => setIsExporterOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Push Notification Simulator Toast */}
      {notificationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-sky-500/50 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 text-slate-100">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 truncate">
                  {notificationToast.title}
                </span>
                <span className="text-[10px] text-slate-400">now</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                {notificationToast.message}
              </p>
            </div>
            <button
              onClick={() => setNotificationToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container / Mobile Simulator Frame */}
      <div className="flex-1 flex flex-col justify-center">
        <MobileFrame
          isFrameEnabled={isMobileFrame}
          bottomBar={
            <BottomNavBar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              activeTasksCount={activeTasksCount}
              missingHoursCount={missingDays.length}
            />
          }
        >
          {activeTab === 'home' && (
            <HomeScreen
              workItems={workItems}
              timeLogs={timeLogs}
              settings={settings}
              sprintCapacity={sprintCapacity}
              weekCompliance={weekCompliance}
              missingDays={missingDays}
              onOpenQuickLog={handleOpenQuickLog}
              onOpenWorkItem={setSelectedWorkItem}
              onNavigateToTasks={() => setActiveTab('tasks')}
              onNavigateToLog={() => setActiveTab('log')}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksScreen
              workItems={workItems}
              onOpenWorkItem={setSelectedWorkItem}
              onOpenQuickLog={handleOpenQuickLog}
              onUpdateState={handleUpdateState}
              onCreateTask={handleCreateTask}
            />
          )}

          {activeTab === 'log' && (
            <LogScreen
              timeLogs={timeLogs}
              workItems={workItems}
              settings={settings}
              missingDays={missingDays}
              onOpenQuickLog={handleOpenQuickLog}
              onDeleteLog={handleDeleteLog}
              onBackfillDay={handleBackfillDay}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsScreen
              timeLogs={timeLogs}
              workItems={workItems}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              config={config}
              settings={settings}
              onSaveConfig={(cfg) => {
                setConfig(cfg);
                AzureDevOpsService.saveConfig(cfg);
              }}
              onSaveSettings={(st) => {
                setSettings(st);
                AzureDevOpsService.saveSettings(st);
              }}
              onOpenExporter={() => setIsExporterOpen(true)}
              onResetData={handleResetData}
              onTriggerNotificationSim={handleTriggerNotificationSim}
            />
          )}
        </MobileFrame>
      </div>

      {/* Quick Time Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        workItems={workItems}
        preselectedWorkItemId={quickLogWorkItemId}
        initialDate={quickLogDate}
        onSaveLog={handleSaveLog}
      />

      {/* Work Item Detail Modal */}
      <WorkItemDetailModal
        item={selectedWorkItem}
        onClose={() => setSelectedWorkItem(null)}
        onUpdateState={handleUpdateState}
        onOpenQuickLog={handleOpenQuickLog}
        timeLogs={timeLogs}
      />

      {/* Exportable Flutter Codebase Modal */}
      <FlutterExporterModal
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
      />
    </div>
  );
}
