import React, { useState } from 'react';
import { AzureConfig, UserSettings } from '../types';
import { AzureDevOpsService } from '../services/azureDevOps';
import { Settings, Shield, Bell, Key, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react';

interface SettingsScreenProps {
  config: AzureConfig;
  settings: UserSettings;
  onSaveConfig: (config: AzureConfig) => void;
  onSaveSettings: (settings: UserSettings) => void;
  onOpenExporter: () => void;
  onResetData: () => void;
  onTriggerNotificationSim: (title: string, message: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  config,
  settings,
  onSaveConfig,
  onSaveSettings,
  onOpenExporter,
  onResetData,
  onTriggerNotificationSim,
}) => {
  const [org, setOrg] = useState(config.org);
  const [project, setProject] = useState(config.project);
  const [pat, setPat] = useState(config.pat);
  const [showPat, setShowPat] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [dailyTarget, setDailyTarget] = useState(settings.dailyTargetHours);
  const [workingDays, setWorkingDays] = useState<number[]>(settings.workingDays);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [underloggingAlert, setUnderloggingAlert] = useState(settings.underloggingAlert);

  const dayNames = [
    { num: 0, name: 'Sun' },
    { num: 1, name: 'Mon' },
    { num: 2, name: 'Tue' },
    { num: 3, name: 'Wed' },
    { num: 4, name: 'Thu' },
    { num: 5, name: 'Fri' },
    { num: 6, name: 'Sat' },
  ];

  const toggleDay = (num: number) => {
    if (workingDays.includes(num)) {
      if (workingDays.length > 1) {
        const next = workingDays.filter((d) => d !== num);
        setWorkingDays(next);
        onSaveSettings({ ...settings, workingDays: next });
      }
    } else {
      const next = [...workingDays, num].sort();
      setWorkingDays(next);
      onSaveSettings({ ...settings, workingDays: next });
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await AzureDevOpsService.testConnection(org, project, pat);
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      onSaveConfig({
        ...config,
        org,
        project,
        pat,
        connected: true,
        lastSyncTime: 'Just now',
      });
    }
  };

  const handleSaveConnection = () => {
    onSaveConfig({
      ...config,
      org,
      project,
      pat,
      connected: true,
      lastSyncTime: 'Just now',
    });
    setTestResult({
      success: true,
      message: 'Credentials updated and stored locally in encrypted browser sandbox.',
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100">Settings & Integration</h2>
        <p className="text-xs text-slate-400">Azure DevOps PAT authentication, compliance rules & Flutter export</p>
      </div>

      {/* Azure DevOps Connection Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Azure DevOps PAT Credentials
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/60">
            REST API v7.0
          </span>
        </div>

        {/* Security Notice for Consideration #1 */}
        <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed">
          <span className="font-semibold text-sky-300">Important Azure Consideration: </span>
          Create your PAT via Azure DevOps User Settings → Personal Access Tokens.
          Ensure scopes include <strong>Work Items (Read & Write)</strong> and <strong>Project (Read)</strong>.
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Organization Name / URL</label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g. contoso-cloud or https://dev.azure.com/contoso-cloud"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Team Project Name</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. Fintech-Core-App"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Personal Access Token (PAT)</label>
            <div className="relative">
              <input
                type={showPat ? 'text' : 'password'}
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                placeholder="Paste Azure DevOps PAT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowPat(!showPat)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            }`}
          >
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />}
            <span>Test Connection</span>
          </button>
          <button
            onClick={handleSaveConnection}
            className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-sm transition-all"
          >
            Save Credentials
          </button>
        </div>
      </div>

      {/* Compliance & Working Hours Setting */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Working-Hour Compliance Rules
          </h3>
        </div>

        {/* Daily Target Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-semibold">Daily Hours Target</span>
            <span className="text-sky-400 font-bold">{dailyTarget} hours / day</span>
          </div>
          <input
            type="range"
            min="6"
            max="10"
            step="0.5"
            value={dailyTarget}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setDailyTarget(val);
              onSaveSettings({ ...settings, dailyTargetHours: val });
            }}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Working Days */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-semibold">Working Days Schedule</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setWorkingDays([0, 1, 2, 3, 4]);
                  onSaveSettings({ ...settings, workingDays: [0, 1, 2, 3, 4] });
                }}
                className="text-[10px] text-sky-400 hover:underline"
              >
                Sun-Thu
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => {
                  setWorkingDays([1, 2, 3, 4, 5]);
                  onSaveSettings({ ...settings, workingDays: [1, 2, 3, 4, 5] });
                }}
                className="text-[10px] text-sky-400 hover:underline"
              >
                Mon-Fri
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((d) => {
              const isSelected = workingDays.includes(d.num);
              return (
                <button
                  key={d.num}
                  onClick={() => toggleDay(d.num)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications Simulation (Consideration #4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Mobile Notifications & Reminders
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Scheduled notifications trigger locally to alert you when daily logged hours are below the 8h target.
        </p>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
            <span className="text-xs text-slate-200">Daily 5:00 PM Timesheet Reminder</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => {
                setNotificationsEnabled(e.target.checked);
                onSaveSettings({ ...settings, notificationsEnabled: e.target.checked });
              }}
              className="accent-sky-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
            <span className="text-xs text-slate-200">Under-logging Warning Alert</span>
            <input
              type="checkbox"
              checked={underloggingAlert}
              onChange={(e) => {
                setUnderloggingAlert(e.target.checked);
                onSaveSettings({ ...settings, underloggingAlert: e.target.checked });
              }}
              className="accent-sky-500 w-4 h-4"
            />
          </label>
        </div>

        {/* Test Notification Trigger */}
        <button
          onClick={() =>
            onTriggerNotificationSim(
              'Azure DevOps Timesheet Alert',
              'You have logged 6.5h of 8.0h today. 1.5h remaining before end of day!'
            )
          }
          className="w-full py-2 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Simulate Local Push Notification</span>
        </button>
      </div>

      {/* Export Flutter Project Banner */}
      <div className="bg-gradient-to-r from-sky-900/60 to-blue-900/60 border border-sky-500/40 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sky-300">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold">Export Native Flutter Project</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Download the full production-ready Flutter (Dart) mobile app codebase configured for Android and iOS.
          Includes fl_chart, http PAT client, local notifications, and timesheet state management.
        </p>
        <button
          onClick={onOpenExporter}
          className="w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 rounded-xl shadow-lg transition-transform active:scale-95"
        >
          Open Flutter Exporter & Download Code (.zip)
        </button>
      </div>

      {/* Reset Data */}
      <div className="pt-2 text-center">
        <button
          onClick={onResetData}
          className="text-xs text-slate-500 hover:text-rose-400 underline transition-colors"
        >
          Reset to Default Enterprise Dataset
        </button>
      </div>
    </div>
  );
};
