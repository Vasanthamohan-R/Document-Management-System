import React, { useState } from 'react';
import { 
  Folder, 
  ChevronRight,
  ChevronDown,
  FileText, 
  Plus, 
  MoreVertical,
  Search,
  Upload,
  LayoutGrid,
  Rows,
  Menu,
  File,
  Image as ImageIcon,
  FileArchive,
  Presentation,
  FileSpreadsheet,
  Star,
  Info,
  Share2,
  Copy,
  ArrowRightLeft,
  Download,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import folderIcon from '@/assets/images/folder.svg';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'spreadsheet' | 'archive' | 'doc' | 'image' | 'presentation';
  updatedAt: string;
  size?: string;
  members?: number;
  starred?: boolean;
  parentId?: string | null;
}

const Folders: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSort, setActiveSort] = useState('Last Opened');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const allItems: FileItem[] = [
    { id: '1', name: 'UI/UX Design', type: 'folder', updatedAt: 'Today, 08:29 AM', size: '4.5 MB', members: 1, parentId: null },
    { id: '2', name: 'UI Design', type: 'folder', updatedAt: 'Today, 11:19 AM', size: '4.5 MB', starred: true, members: 1, parentId: null },
    { id: '3', name: 'Projects', type: 'folder', updatedAt: 'Yesterday, 03:32 AM', size: '35 MB', members: 2, parentId: null },
    { id: '4', name: '2019 Projects', type: 'folder', updatedAt: '03 May, 08:29 AM', size: '1.2 GB', members: 1, parentId: null },

    // Nested in UI/UX Design (id: 1)
    { id: '1-1', name: 'Figma Mockups', type: 'folder', updatedAt: 'Today, 09:00 AM', size: '2.1 MB', parentId: '1' },
    { id: '1-2', name: 'User Research.doc', type: 'doc', updatedAt: 'Yesterday, 04:20 PM', size: '155 KB', parentId: '1' },

    // Nested in Projects (id: 3)
    { id: '3-1', name: 'Client Feedback', type: 'folder', updatedAt: 'Today, 10:15 AM', size: '540 KB', parentId: '3' },
    { id: '3-2', name: 'Budget-2026.xlsx', type: 'spreadsheet', updatedAt: '08 Mar, 11:00 AM', size: '88 KB', parentId: '3' },

    { id: '5', name: 'Update Data.xlsx', type: 'spreadsheet', updatedAt: 'Today, 10:38 PM', size: '235 KB', members: 4, parentId: null },
    { id: '6', name: 'dashlite-package-v1.2.zip', type: 'archive', updatedAt: '03 May, 08:29 AM', size: '235 KB', members: 1, parentId: null },
    { id: '7', name: 'covstats-v1.0.zip', type: 'archive', updatedAt: '01 May, 08:29 AM', size: '235 KB', members: 1, parentId: null },
    { id: '8', name: 'Price-Update.doc', type: 'doc', updatedAt: '25 Apr, 01:21 AM', size: '23 MB', members: 1, parentId: null },
    { id: '9', name: 'Quotation.doc', type: 'doc', updatedAt: '06 Apr, 11:56 PM', size: '23 MB', members: 1, parentId: null },
    { id: '10', name: 'Work-to-do.txt', type: 'doc', updatedAt: '02 Apr, 08:29 AM', size: '23 MB', members: 1, parentId: null },
    { id: '11', name: 'DashLite_Crypto_v1.psd', type: 'image', updatedAt: '25 Mar, 04:47 PM', size: '23 MB', members: 1, parentId: null },
    { id: '12', name: 'New Movie 2020.mp4', type: 'presentation', updatedAt: '19 Mar, 06:29 PM', size: '23 MB', members: 1, parentId: null },
    { id: '13', name: 'Project Access.xls', type: 'spreadsheet', updatedAt: '02 Apr, 08:29 AM', size: '23 MB', members: 1, parentId: null },
    { id: '14', name: '2019 Presentation.ppt', type: 'presentation', updatedAt: '12 Jan, 04:47 PM', size: '23 MB', members: 1, parentId: null },
  ];

  const currentItems = allItems.filter(item => item.parentId === currentFolderId);
  const currentFolders = currentItems.filter(item => item.type === 'folder');
  const currentFiles = currentItems.filter(item => item.type !== 'folder');

  const getPath = (folderId: string | null): FileItem[] => {
    const path: FileItem[] = [];
    let currentId = folderId;
    while (currentId) {
      const folder = allItems.find(i => i.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId || null;
      } else break;
    }
    return path;
  };

  const currentPath = getPath(currentFolderId);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === currentItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentItems.map(i => i.id)));
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setSelectedIds(new Set());
    } else {
      setSelectedItem(item);
      setIsDetailsOpen(true);
    }
  };

  const startDownload = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 3000);
  };

  const getIcon = (type: FileItem['type'], small = false) => {
    const size = small ? "w-6 h-6" : "w-20 h-20";
    switch (type) {
      case 'folder': return (
        <img 
          src={folderIcon} 
          alt="Folder" 
          className={size} 
        />
      );
      case 'spreadsheet': return <FileSpreadsheet className={`${size} text-emerald-500`} />;
      case 'archive': return <FileArchive className={`${size} text-slate-500`} />;
      case 'doc': return <FileText className={`${size} text-blue-400`} />;
      case 'image': return <ImageIcon className={`${size} text-purple-500`} />;
      case 'presentation': return <Presentation className={`${size} text-red-500`} />;
      default: return <File className={`${size} text-slate-400`} />;
    }
  };

  const menuActions = [
    { label: 'Details', icon: Info, color: 'text-blue-500', onClick: (item: FileItem) => { setSelectedItem(item); setIsDetailsOpen(true); setActiveMenuId(null); } },
    { label: 'Share', icon: Share2, color: 'text-blue-500' },
    { label: 'Copy', icon: Copy, color: 'text-blue-500' },
    { label: 'Move', icon: ArrowRightLeft, iconOverride: true, color: 'text-blue-500' },
    { label: 'Download', icon: Download, color: 'text-blue-500', onClick: startDownload },
    { label: 'Rename', icon: Edit2, color: 'text-blue-500' },
    { label: 'Delete', icon: Trash2, color: 'text-red-500' },
  ];

  const FileCard = ({ item }: { item: FileItem }) => (
    <div
      className={`bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-lg border p-5 group transition-all relative flex flex-col items-center cursor-pointer ${selectedIds.has(item.id) ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/30'}`}
      onClick={() => handleItemClick(item)}
    >
      <div className="w-full flex justify-between items-start mb-2">
        <input
          type="checkbox"
          checked={selectedIds.has(item.id)}
          onChange={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-1 flex justify-center py-4">
          <div className="transform group-hover:scale-110 transition-transform duration-300">
            {getIcon(item.type)}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
            className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-300 group-hover:text-slate-500 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {activeMenuId === item.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-50 dark:border-slate-800 z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-black/5">
                {menuActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); action.onClick && action.onClick(item); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:pt-3 last:pb-3"
                  >
                    <action.icon size={16} className={action.color} />
                    <span className="font-semibold">{action.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-1.5 px-2">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</h3>
          {item.starred && <Star size={13} className="text-blue-500 fill-blue-500 flex-shrink-0" />}
        </div>
        <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-tight">
          {item.updatedAt.split(',')[0]} • {item.size}
        </p>
      </div>
    </div>
  );

  const ListView = () => (
    <div className="w-full bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-900 shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
          <tr className="text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold text-[11px]">
            <th className="px-6 py-4 w-12 text-center">
              <input
                type="checkbox"
                checked={selectedIds.size === currentItems.length && currentItems.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-4 py-4">Name</th>
            <th className="px-4 py-4">Size</th>
            <th className="px-4 py-4">Last Modified</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {currentItems.map((item) => (
            <tr
              key={item.id}
              className={`group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors cursor-pointer ${selectedIds.has(item.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <td className="py-4 px-6 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-4">
                  {getIcon(item.type, true)}
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                  {item.starred && <Star size={13} className="text-blue-500 fill-blue-500" />}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                {item.size || '-'}
              </td>
              <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                {item.updatedAt}
              </td>
              <td className="py-4 px-6 text-right relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-300 group-hover:text-slate-500 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {activeMenuId === item.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                    <div className="absolute right-6 top-10 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-50 dark:border-slate-800 z-20 py-1 overflow-hidden ring-1 ring-black/5 text-left">
                      {menuActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); action.onClick && action.onClick(item); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <action.icon size={16} className={action.color} />
                          <span className="font-semibold">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-10 font-sans text-slate-900 px-4 md:px-8 relative">
      {/* Top Search Bar / Bulk Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 min-h-[44px]">
        {selectedIds.size > 0 ? (
          <div className="flex-1 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-2 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1 hover:bg-white dark:hover:bg-blue-900/40 rounded-lg text-blue-600 transition-colors"
              >
                <X size={20} />
              </button>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{selectedIds.size} Selected</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { icon: Share2, label: 'Share' },
                { icon: Copy, label: 'Copy' },
                { icon: ArrowRightLeft, label: 'Move' },
                { icon: Download, label: 'Download', onClick: startDownload },
                { icon: Trash2, label: 'Delete', color: 'text-red-500' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white dark:hover:bg-blue-900/40 ${action.color || 'text-blue-600 dark:text-blue-400'}`}
                >
                  <action.icon size={14} />
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full md:max-w-md group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search files, folders"
              className="w-full h-11 pl-11 pr-4 bg-slate-100 dark:bg-slate-900/50 border border-transparent dark:border-slate-800 rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-slate-900 focus:border-blue-100 dark:focus:border-blue-900 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-600 dark:text-slate-200 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {!selectedIds.size && (
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-slate-50 dark:bg-slate-900 border-none text-slate-700 dark:text-slate-200 font-bold px-6 h-11 rounded-xl flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Plus size={19} strokeWidth={2.5} /> Create
            </Button>
            <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-11 rounded-xl flex items-center gap-2.5 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              <Upload size={19} strokeWidth={2.5} /> Upload
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap overflow-hidden">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
          >
            Files
          </button>
          {currentPath.map((item, idx) => (
            <React.Fragment key={item.id}>
              <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
              <button
                onClick={() => setCurrentFolderId(item.id)}
                className={cn(
                  "hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[120px]",
                  idx === currentPath.length - 1 && "text-slate-900 dark:text-white font-bold"
                )}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              {activeSort} <ChevronDown size={14} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-50 z-20 py-1 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {['Last Opened', 'Name', 'Size', 'Type', 'Members'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => { setActiveSort(sort); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${activeSort === sort ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Rows size={18} />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 relative">
              <Menu size={18} />
              {selectedIds.size > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {currentItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="space-y-12">
            {currentFolders.length > 0 && (
              <section>
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-5 pl-1">Folder</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {currentFolders.map(folder => (
                    <FileCard key={folder.id} item={folder} />
                  ))}
                </div>
              </section>
            )}

            {currentFiles.length > 0 && (
              <section>
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-5 pl-1">Files</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {currentFiles.map(file => (
                    <FileCard key={file.id} item={file} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <ListView />
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 overflow-hidden">
            <img src={folderIcon} alt="Empty Folder" className="w-12 h-12 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-slate-600">This folder is empty</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">Upload files or create subfolders to get started.</p>
          <div className="flex gap-3 mt-8">
            <Button variant="outline" className="rounded-xl border-slate-200">New Subfolder</Button>
            <Button variant="primary" className="rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">Upload Files</Button>
          </div>
        </div>
      )}

      {/* Downloading Toast */}
      {isDownloading && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#1e293b] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[320px] ring-1 ring-white/10">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Download size={18} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold tracking-tight">Downloading File</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Generating the file to start download.</p>
            </div>
            <button 
              onClick={() => setIsDownloading(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}



      {/* Details Modal */}
      <Modal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        size="md"
        className="rounded-2xl"
      >
        {selectedItem && (
          <div className="space-y-8 py-2">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-slate-50 rounded-xl">
                {getIcon(selectedItem.type)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedItem.name}</h3>
                <p className="text-sm font-medium text-slate-400 mt-0.5">Project</p>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { label: 'Type', value: selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1) },
                { label: 'Size', value: selectedItem.size },
                { label: 'Location', value: 'ThemeForest > Project' },
                { label: 'Owner', value: 'Me' },
                { label: 'Modified', value: `${selectedItem.updatedAt} by Abu Bit Istiyak` },
                { label: 'Opened', value: `Apr 23, 2020 by Me` },
                { label: 'Created', value: `Feb 19, 2020` },
              ].map((row, i) => (
                <div key={i} className="flex grid grid-cols-5 items-center">
                  <span className="col-span-2 text-sm font-medium text-slate-500">{row.label}</span>
                  <span className="col-span-3 text-sm font-semibold text-slate-800">{row.value}</span>
                </div>
              ))}
              <div className="flex grid grid-cols-5 items-center">
                <span className="col-span-2 text-sm font-medium text-slate-500">Shared with</span>
                <div className="col-span-3 flex items-center -space-x-2">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${['bg-blue-400', 'bg-purple-400', 'bg-pink-400'][i]}`}>
                      {['IH', 'AB', 'SI'][i]}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    +2
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button className="text-blue-600 text-sm font-bold hover:underline">View All Activity</button>
              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-200 text-slate-700 font-bold px-6 h-10 rounded-lg">
                  Share
                </Button>
                <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-10 rounded-lg">
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Folders;
