import React from 'react';
import { Upload, FileBadge, ShieldAlert, CheckCircle, Search } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const MOCK_DOCS = [
  { id: 1, name: 'School Affiliation Certificate', type: 'CBSE', expiry: '2027-03-31', status: 'Valid' },
  { id: 2, name: 'Fire Safety NOC', type: 'Safety', expiry: '2025-08-15', status: 'Expiring Soon' },
  { id: 3, name: 'Building Fitness Certificate', type: 'Infrastructure', expiry: '2024-12-31', status: 'Expired' },
  { id: 4, name: 'Society Registration', type: 'Legal', expiry: '2030-01-01', status: 'Valid' },
];

const statusStyles = {
  'Valid': 'bg-green-100 text-green-700 border-green-200',
  'Expiring Soon': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Expired': 'bg-red-100 text-red-700 border-red-200',
};

const DocumentVault = () => {
  return (
    <PageWrapper title="Document Vault & Compliance">
      
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search documents..." className="input-field pl-9 py-2 text-sm w-full" />
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DOCS.map(doc => (
          <div key={doc.id} className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform border border-slate-200/50 dark:border-slate-700/50 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <FileBadge className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[doc.status]}`}>
                {doc.status}
              </span>
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{doc.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{doc.type}</p>
            
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
              <span className="text-slate-500">Expires:</span>
              <span className={`font-semibold ${doc.status === 'Expired' ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                {new Date(doc.expiry).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>

    </PageWrapper>
  );
};

export default DocumentVault;
