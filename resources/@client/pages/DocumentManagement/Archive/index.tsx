import React from 'react';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Search, 
  FileText, 
  Calendar,
  Cloud,
  Database,
  Clock,
  ArrowRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';

interface ArchivedDoc {
  id: string;
  name: string;
  date: string;
  dept: string;
  size: string;
  reason: string;
}

const ArchivePage: React.FC = () => {
  const archivedDocs: ArchivedDoc[] = [
    { id: 'ARC-001', name: 'Legacy Marketing Kit 2021.zip', date: 'Oct 01, 2023', dept: 'Marketing', size: '156 MB', reason: 'Outdated Branding' },
    { id: 'ARC-002', name: 'Old HR Policy v1.pdf', date: 'Sep 15, 2023', dept: 'Human Resources', size: '2.4 MB', reason: 'Superseded' },
    { id: 'ARC-003', name: 'FY 2022 Tax Records.pdf', date: 'Aug 10, 2023', dept: 'Finance', size: '4.8 MB', reason: 'Closed Year' },
  ];

  const columns = [
    {
      header: 'Document Name',
      accessorKey: 'name',
      cell: (item: ArchivedDoc) => (
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-slate-400" />
          <div className="flex flex-col">
            <span className="font-medium text-slate-700">{item.name}</span>
            <span className="text-xs text-slate-500">{item.id}</span>
          </div>
        </div>
      )
    },
    { header: 'Archived Date', accessorKey: 'date' },
    { header: 'Department', accessorKey: 'dept' },
    { header: 'Size', accessorKey: 'size' },
    { 
      header: 'Reason', 
      accessorKey: 'reason',
      cell: (item: any) => (
        <span className="text-xs text-slate-500 italic">"{item.reason}"</span>
      )
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
             <Archive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Document Archive</h1>
            <p className="text-slate-500">Access and restore outdated or long-term storage documents.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" icon={Database}>Backup Settings</Button>
          <Button variant="primary" size="sm" icon={Cloud}>Cloud Sync</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Storage Health" icon={Cloud}>
           <div className="mt-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Archive Size</span>
                <span className="font-bold text-slate-900">42.8 GB</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-slate-400">Next scheduled cleanup in 12 days.</p>
           </div>
        </Card>

        <Card title="Backup Schedule" icon={Calendar}>
           <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Daily Incremental</span>
                 </div>
                 <span className="text-slate-500">02:00 AM</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Weekly Full</span>
                 </div>
                 <span className="text-slate-500">Every Sunday</span>
              </div>
           </div>
        </Card>

        <Card title="Quick Search" className="bg-slate-50 border-slate-200">
           <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search archive..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm" />
           </div>
        </Card>
      </div>

      <Table 
        data={archivedDocs} 
        columns={columns} 
        actions={(item) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" icon={RotateCcw} className="h-8">Restore</Button>
            <Button variant="ghost" size="sm" icon={Trash2} className="h-8 w-8 p-0 text-red-400 hover:text-red-600" />
          </div>
        )}
      />
    </div>
  );
};

export default ArchivePage;
export { ArchivePage };
