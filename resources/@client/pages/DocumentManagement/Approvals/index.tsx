import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  User, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';

interface ApprovalItem {
  id: string;
  name: string;
  user: string;
  manager: string;
  date: string;
  status: string;
}

const ApprovalsPage: React.FC = () => {
  const pendingApprovals: ApprovalItem[] = [
    { id: 'APP-001', name: 'New Employee Contract.pdf', user: 'Sarah Jenkins', manager: 'John Doe', date: 'Oct 12, 2024', status: 'Pending Manager' },
    { id: 'APP-002', name: 'Q4 Budget Variance.xls', user: 'Michael Chen', manager: 'David Wilson', date: 'Oct 11, 2024', status: 'Pending Finance' },
    { id: 'APP-003', name: 'Security Audit Report.pdf', user: 'Emma Wilson', manager: 'John Doe', date: 'Oct 10, 2024', status: 'Pending Admin' },
    { id: 'APP-004', name: 'IT Infrastructure Schema.pdf', user: 'Robert Fox', manager: 'David Wilson', date: 'Oct 09, 2024', status: 'Pending Manager' },
  ];

  const columns = [
    {
      header: 'Document',
      accessorKey: 'name',
      cell: (item: ApprovalItem) => (
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-200">{item.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.id}</span>
          </div>
        </div>
      )
    },
    { header: 'Submitted By', accessorKey: 'user' },
    { 
      header: 'Approval Status', 
      accessorKey: 'status',
      cell: (item: ApprovalItem) => (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">
          <Clock className="mr-1 h-3 w-3" />
          {item.status}
        </span>
      )
    },
    { header: 'Assigned Manager', accessorKey: 'manager' },
    { header: 'Date', accessorKey: 'date' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Approvals</h1>
          <p className="text-slate-500 dark:text-slate-400">Review and approve documents submitted by your team.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">Approval History</Button>
          <Button variant="primary" size="sm">Delegate Tasks</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar / Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Approval Stats">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Pending Actions</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Approved Today</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Rejected Today</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">02</span>
              </div>
              <div className="h-px bg-slate-100 w-full" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Total Completion</span>
                <span className="text-sm font-bold text-blue-600">94%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '94%' }} />
              </div>
            </div>
          </Card>

          <Card title="Quick Actions" className="bg-slate-50 dark:bg-slate-900/50">
             <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-xs font-semibold py-2 h-auto" icon={CheckCircle}>Approve All Selection</Button>
                <Button variant="ghost" className="w-full justify-start text-xs font-semibold py-2 h-auto" icon={MessageSquare}>Request More Info</Button>
                <Button variant="ghost" className="w-full justify-start text-xs font-semibold py-2 h-auto text-red-500 hover:bg-red-50 hover:text-red-700" icon={XCircle}>Reject All Selection</Button>
             </div>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Table 
            data={pendingApprovals} 
            columns={columns} 
            actions={(item) => (
              <div className="flex items-center justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700" 
                  icon={CheckCircle}
                >
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
                  icon={XCircle}
                >
                  Reject
                </Button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
export { ApprovalsPage };
