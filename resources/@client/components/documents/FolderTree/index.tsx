import React, { useState } from 'react';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  Plus, 
  MoreVertical,
  Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FolderItem {
  id: string;
  name: string;
  children?: FolderItem[];
}

const folders: FolderItem[] = [
  {
    id: '1',
    name: 'Corporate Policies',
    children: [
      { id: '1-1', name: 'HR Policies' },
      { id: '1-2', name: 'Finance Policies' },
    ]
  },
  {
    id: '2',
    name: 'Finance & Audit',
    children: [
      { id: '2-1', name: 'FY 2024' },
      { id: '2-2', name: 'FY 2023' },
    ]
  },
  {
    id: '3',
    name: 'Legal Documents',
    children: [
      { id: '3-1', name: 'Contracts' },
      { id: '3-2', name: 'Agreements' },
    ]
  },
];

const FolderNode: React.FC<{ node: FolderItem; depth: number }> = ({ node, depth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "group flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-slate-100",
          isOpen && "bg-slate-50"
        )}
        style={{ paddingLeft: `${depth * 1.5}rem` }}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-blue-500">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-4" />
          )}
          {isOpen ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-400" />}
          <span className="text-sm font-medium text-slate-700">{node.name}</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-900 transition-opacity">
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>
      {isOpen && hasChildren && (
        <div className="flex flex-col">
          {node.children!.map((child) => (
            <FolderNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-4 border rounded-xl border-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Folder Tree</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Filter folders..." 
          className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-2">
        {folders.map((folder) => (
          <FolderNode key={folder.id} node={folder} depth={0} />
        ))}
      </div>
    </div>
  );
};

export default FolderTree;
export { FolderTree };
