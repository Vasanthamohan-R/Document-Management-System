import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List, 
  Download, 
  Share2, 
  Trash2,
  ChevronDown,
  FileText
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DocumentTable from '@/components/documents/DocumentTable';
import FolderTree from '@/components/documents/FolderTree';

const DocumentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const mockDocuments: any[] = [
    { id: '1.8 MB', name: 'Q4 Financial Report 2025.pdf', category: 'Finance', department: 'Finance', type: 'PDF', version: 'v2.1', uploadedBy: 'Sarah Johnson', date: '2026-03-08', status: 'pending' },
    { id: '1.2 MB', name: 'Employee Handbook 2026.docx', category: 'HR', department: 'Human Resources', type: 'Word', version: 'v3.0', uploadedBy: 'Michael Chen', date: '2026-03-05', status: 'approved' },
    { id: '856 KB', name: 'Sales Data Q1 2026.xlsx', category: 'Finance', department: 'Sales', type: 'Excel', version: 'v1.5', uploadedBy: 'Emily Davis', date: '2026-03-10', status: 'approved' },
    { id: '3.2 MB', name: 'Legal Compliance Guidelines.pdf', category: 'Legal', department: 'Legal', type: 'PDF', version: 'v1.0', uploadedBy: 'Robert Wilson', date: '2026-03-07', status: 'approved' },
    { id: '1.2 MB', name: 'Project Alpha Proposal.docx', category: 'Projects', department: 'Projects', type: 'Word', version: 'v4.2', uploadedBy: 'Jennifer Lee', date: '2026-03-09', status: 'pending' },
    { id: '15.7 MB', name: 'Marketing Campaign Assets.zip', category: 'Marketing', department: 'Marketing', type: 'Other', version: 'v1.0', uploadedBy: 'David Brown', date: '2026-03-06', status: 'approved' },
    { id: '945 KB', name: 'IT Security Policy.pdf', category: 'IT', department: 'IT', type: 'PDF', version: 'v2.3', uploadedBy: 'Lisa Anderson', date: '2026-03-04', status: 'approved' },
    { id: '672 KB', name: 'Budget Forecast 2026.xlsx', category: 'Finance', department: 'Finance', type: 'Excel', version: 'v1.8', uploadedBy: 'Sarah Johnson', date: '2026-03-03', status: 'draft' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Documents</h1>
          <p className="text-slate-400 font-medium mt-1">Manage and browse all your documents</p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by filename, tag, metadata..." 
              className="h-12 w-full rounded-2xl border-none bg-white dark:bg-slate-900 pl-12 pr-4 text-sm font-medium outline-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all focus:ring-blue-500/50"
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Select 
              className="h-12 min-w-[160px] rounded-2xl bg-white dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800"
              options={[{ label: 'All Departments', value: 'all' }]}
            />
            <Select 
              className="h-12 min-w-[140px] rounded-2xl bg-white dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800"
              options={[{ label: 'All Types', value: 'all' }]}
            />
            <Select 
              className="h-12 min-w-[140px] rounded-2xl bg-white dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800"
              options={[{ label: 'All Status', value: 'all' }]}
            />
          </div>
        </div>
      </div>

      {/* Documents Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-none p-8 ring-1 ring-slate-100 dark:ring-slate-800">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">All Documents (8)</h2>
          <div className="flex rounded-xl bg-slate-50 dark:bg-slate-950 p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <DocumentTable data={mockDocuments} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockDocuments.map((doc) => (
              <div key={doc.id} className="group cursor-pointer bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6 border-none ring-1 ring-transparent hover:ring-blue-100 dark:hover:ring-blue-900/30 transition-all">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm group-hover:shadow-md transition-all">
                    <FileText className={cn("h-10 w-10", doc.type === 'PDF' ? "text-red-500" : "text-blue-500")} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate max-w-[160px]">
                      {doc.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{doc.date} • {doc.version}</p>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="sm" icon={Download} className="h-9 w-9 p-0 rounded-xl" />
                     <Button variant="ghost" size="sm" icon={Share2} className="h-9 w-9 p-0 rounded-xl" />
                     <Button variant="ghost" size="sm" icon={Trash2} className="h-9 w-9 p-0 rounded-xl text-red-400 hover:text-red-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
export { DocumentsPage };

// Helper function for class merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
