import React, { useState } from 'react';
import { FLUTTER_PROJECT_FILES, generateFlutterProjectZip, downloadBlob } from '../services/flutterCodeGenerator';
import { X, Download, Copy, Check, FileCode, Folder, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

interface FlutterExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterExporterModal: React.FC<FlutterExporterModalProps> = ({ isOpen, onClose }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('lib/main.dart');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFile = FLUTTER_PROJECT_FILES.find((f) => f.path === selectedFilePath) || FLUTTER_PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateFlutterProjectZip();
      downloadBlob(blob, 'azureops_flutter_mobile.zip');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Exportable Flutter Mobile Project</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Android & iOS Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete multi-platform codebase connecting to Azure DevOps with Personal Access Tokens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 rounded-lg shadow-md shadow-cyan-400/20 transition-all disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <span>Downloaded!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Packaging Zip...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Project (.zip)</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Sidebar Files + Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-slate-950">
          {/* File Explorer Tree */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 p-3 overflow-y-auto bg-slate-900/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-sky-400" />
              <span>Project Structure ({FLUTTER_PROJECT_FILES.length} Files)</span>
            </div>
            <div className="space-y-0.5">
              {FLUTTER_PROJECT_FILES.map((file) => {
                const isSelected = file.path === selectedFilePath;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono-code transition-colors text-left ${
                      isSelected
                        ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Run Box */}
            <div className="mt-4 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Run</span>
              </div>
              <p className="text-slate-400">1. Extract zip to folder</p>
              <p className="font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">flutter pub get</p>
              <p className="font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">flutter run</p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
            {/* Viewer Bar */}
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/30 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono-code">
                <span className="text-sky-400 font-semibold">{activeFile.path}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-500 uppercase">{activeFile.category}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <pre className="flex-1 p-4 overflow-auto text-xs font-mono-code text-slate-300 leading-relaxed bg-[#0b0f19]">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
