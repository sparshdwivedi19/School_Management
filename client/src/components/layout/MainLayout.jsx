import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar toggleSidebar={() => setIsMobileOpen(true)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative">
          {/* Subtle background decoration */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-400/5 blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
