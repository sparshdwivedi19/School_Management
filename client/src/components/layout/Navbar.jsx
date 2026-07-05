import React from 'react';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';

const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { settings } = useSchool();

  return (
    <header className="h-16 glass dark:bg-dark-surface/70 dark:border-b dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Academic Session Badge */}
        {settings?.academicSession && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Session:</span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
              {settings.academicSession}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 flex items-center justify-center text-white font-bold shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
