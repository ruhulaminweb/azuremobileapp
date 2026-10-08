import React from 'react';
import { AzureConfig } from '../types';
import { Cloud, Smartphone, Monitor, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

interface HeaderBarProps {
  config: AzureConfig;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenExporter: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  config,
  isMobileFrame,
  onToggleFrame,
  onOpenExporter,
  onSync,
  isSyncing,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Connection State */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-lg">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-tight text-sm md:text-base">AzureOps Mobile</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                {config.demoMode ? 'Live Azure Ready' : 'Connected'}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{config.org || 'contoso-cloud'}</span>
              <span>/</span>
              <span className="text-slate-300 font-medium">{config.project || 'Fintech-Core-App'}</span>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Sync Azure Data */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            title="Sync with Azure DevOps"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Toggle View: Mobile Frame vs Wide Canvas */}
          <button
            onClick={onToggleFrame}
            title={isMobileFrame ? "Switch to Wide Dashboard View" : "Switch to Mobile Device Frame"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition-colors"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Wide View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Mobile Frame</span>
              </>
            )}
          </button>

          {/* Export Flutter Project (Highlight action requested in prompt) */}
          <button
            onClick={onOpenExporter}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-lg shadow-sm shadow-sky-500/25 transition-all border border-sky-400/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Flutter Code (.zip)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
