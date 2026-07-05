import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center p-4">
      {/* Optional: Add animated background bubbles here */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]" />
      </div>
      
      <div className="w-full max-w-md z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
