import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Database, School } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('Settings saved successfully');
    }, 800);
  };

  return (
    <PageWrapper title="Settings">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'school', label: 'School Profile', icon: School },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'database', label: 'Backup & Restore', icon: Database },
          ].map((item, idx) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${idx === 0 ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">School Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">School Name</label>
                <input type="text" defaultValue="Suncity School" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registration No.</label>
                <input type="text" defaultValue="SC-2025-001" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Principal Name</label>
                <input type="text" defaultValue="Dr. A. Sharma" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                <input type="email" defaultValue="admin@suncity.edu" className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <textarea defaultValue="123 Education Lane, Knowledge City" className="input-field h-24" />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default SettingsPage;
