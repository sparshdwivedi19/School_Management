import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Users, UserSquare2, CheckSquare, 
  FileText, GraduationCap, Banknote, FileSpreadsheet, 
  Settings, LogOut, FileBadge, Bell, BrainCircuit
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'principal', 'teacher', 'operator', 'student'] },
    
    // Core Modules
    { name: 'Students', icon: Users, path: '/students', roles: ['admin', 'principal', 'operator', 'teacher'] },
    { name: 'Teachers', icon: UserSquare2, path: '/teachers', roles: ['admin', 'principal'] },
    { name: 'Attendance', icon: CheckSquare, path: '/attendance', roles: ['admin', 'principal', 'teacher', 'operator'] },
    { name: 'Exams & Marks', icon: FileText, path: '/exams', roles: ['admin', 'principal', 'teacher', 'operator'] },
    
    // Student Portal specific
    { name: 'My Attendance', icon: CheckSquare, path: '/my-attendance', roles: ['student'] },
    { name: 'My Results', icon: FileText, path: '/my-results', roles: ['student'] },
    
    // Finance
    { name: 'Fee Management', icon: Banknote, path: '/fees', roles: ['admin', 'principal', 'operator'] },
    { name: 'Expenses', icon: FileText, path: '/expenses', roles: ['admin', 'principal'] },
    { name: 'Salary', icon: UserSquare2, path: '/salary', roles: ['admin', 'principal'] },
    { name: 'Financials', icon: FileSpreadsheet, path: '/finance', roles: ['admin', 'principal'] },
    { name: 'RTE', icon: GraduationCap, path: '/rte', roles: ['admin', 'principal', 'operator'] },
    
    // Compliance & Reports
    { name: 'Documents', icon: FileBadge, path: '/documents', roles: ['admin', 'principal', 'operator'] },
    { name: 'Reports', icon: FileSpreadsheet, path: '/reports', roles: ['admin', 'principal'] },
    
    // AI & System
    { name: 'AI Insights', icon: BrainCircuit, path: '/ai', roles: ['admin', 'principal', 'student'] },
    { name: 'Notifications', icon: Bell, path: '/notifications', roles: ['admin', 'principal', 'teacher', 'operator', 'student'] },
    { name: 'Users', icon: Users, path: '/users', roles: ['admin'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] },
  ];

  const allowedMenus = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64 glass dark:border-r dark:border-slate-800
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold mr-3">
            S
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">Suncity ERP</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {allowedMenus.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 rounded-lg transition-colors group
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
