import React from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileBox,
  Eye,
  Download,
  Edit,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';

interface Document {
  id: string;
  name: string;
  folder: string;
  department: string;
  type: 'pdf' | 'doc' | 'xls' | 'img';
  version: string;
  uploadedBy: string;
  date: string;
  status: 'published' | 'pending' | 'draft' | 'archived';
}

const getIcon = (type: string) => {
  const baseClass = "h-5 w-5 p-1 rounded-md mb-1";
  switch (type.toLowerCase()) {
    case 'pdf': return <FileText className={`${baseClass} bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400`} />;
    case 'word': return <FileBox className={`${baseClass} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`} />;
    case 'excel': return <FileSpreadsheet className={`${baseClass} bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400`} />;
    case 'other': return <FileImage className={`${baseClass} bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400`} />;
    default: return <FileText className={`${baseClass} bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500`} />;
  }
};

const getStatusBadge = (status: string) => {
  const styles = {
    approved: 'bg-green-100/50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-1 ring-green-500/10 dark:ring-green-500/20',
    pending: 'bg-orange-100/50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500/10 dark:ring-orange-500/20',
    draft: 'bg-slate-100/50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 ring-1 ring-slate-500/10 dark:ring-slate-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status as keyof typeof styles]}`}>
      {status === 'pending' ? 'Pending Approval' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const DocumentTable: React.FC<{ data: Document[] }> = ({ data }) => {
  const columns = [
    {
      header: 'Document Name',
      accessorKey: 'name',
      sortable: true,
      cell: (doc: any) => (
        <div className="flex items-center gap-3">
          {getIcon(doc.type)}
          <div className="flex flex-col">
            <span className="font-bold text-[13px] text-slate-900 dark:text-slate-100 leading-none">{doc.name}</span>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-tight">{doc.id}</span>
          </div>
        </div>
      ),
    },
    { header: 'Category', accessorKey: 'category', cell: (doc: any) => <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">{doc.category}</span> },
    { header: 'Department', accessorKey: 'department', cell: (doc: any) => <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">{doc.department}</span> },
    { header: 'Type', accessorKey: 'type', cell: (doc: any) => <span className="text-[13px] font-bold text-slate-400 uppercase">{doc.type}</span> },
    { header: 'Version', accessorKey: 'version', cell: (doc: any) => <span className="text-[12px] font-bold text-slate-500">{doc.version}</span> },
    { header: 'Uploaded By', accessorKey: 'uploadedBy', cell: (doc: any) => <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{doc.uploadedBy}</span> },
    { header: 'Date', accessorKey: 'date', sortable: true, cell: (doc: any) => <span className="text-[13px] font-semibold text-slate-500">{doc.date}</span> },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (doc: any) => getStatusBadge(doc.status)
    },
  ];

  return (
    <Table
      data={data}
      columns={columns}
      // className="border-none"
      actions={(doc) => (
        <div className="flex items-center justify-end gap-2 text-slate-400">
          <Button variant="ghost" size="sm" icon={Eye} className="h-8 w-8 p-0 rounded-lg hover:text-blue-600" />
          <Button variant="ghost" size="sm" icon={Download} className="h-8 w-8 p-0 rounded-lg hover:text-blue-600" />
          <Button variant="ghost" size="sm" icon={Edit} className="h-8 w-8 p-0 rounded-lg hover:text-blue-600" />
        </div>
      )}
    />
  );
};

export default DocumentTable;
export { DocumentTable };
