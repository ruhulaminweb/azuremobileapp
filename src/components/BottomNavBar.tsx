import React from 'react';
import { NavTab } from '../types';
import { Home, CheckSquare, Clock, BarChart3, Settings } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeTasksCount: number;
  missingHoursCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  activeTasksCount,
  missingHoursCount,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'tasks' as NavTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
    },
    {
      id: 'log' as NavTab,
      label: 'Log',
      icon: Clock,
      badge: missingHoursCount > 0 ? `${missingHoursCount}!` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all rounded-xl ${
              isActive
                ? 'text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 text-sky-400' : 'text-slate-400'
                }`}
              />
              {tab.badge && (
                <span
                  className={`absolute -top-1.5 -right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    tab.badgeColor || 'bg-sky-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-sky-300 font-semibold' : 'text-slate-400'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
