import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileFrameProps {
  isFrameEnabled: boolean;
  children: React.ReactNode;
  bottomBar: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  isFrameEnabled,
  children,
  bottomBar,
}) => {
  const [timeString, setTimeString] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isFrameEnabled) {
    // Wide / Responsive Dashboard Mode
    return (
      <div className="w-full max-w-5xl mx-auto min-h-[calc(100vh-65px)] flex flex-col bg-slate-950 border-x border-slate-800/80 shadow-2xl relative">
        <main className="flex-1 pb-20 overflow-y-auto">
          {children}
        </main>
        <div className="fixed bottom-0 left-0 right-0 max-w-5xl mx-auto">
          {bottomBar}
        </div>
      </div>
    );
  }

  // Mobile Device Shell Mode
  return (
    <div className="flex justify-center items-center py-4 px-2 min-h-[calc(100vh-70px)]">
      <div className="relative w-full max-w-[410px] h-[844px] bg-slate-950 rounded-[48px] p-3 shadow-2xl shadow-sky-950/40 border-[7px] border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
        {/* Device Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-sky-900/60" />
        </div>

        {/* Mobile Top Status Bar */}
        <div className="w-full h-8 pt-1.5 px-6 flex items-center justify-between text-slate-300 text-[11px] font-semibold tracking-tight z-40 select-none bg-slate-950/80">
          <span>{timeString}</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-950 text-slate-100 flex flex-col">
          {children}
        </div>

        {/* Sticky Mobile Bottom Navigation Bar */}
        <div className="w-full shrink-0">
          {bottomBar}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full h-4 bg-slate-950 flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-600/70 rounded-full" />
        </div>
      </div>
    </div>
  );
};
