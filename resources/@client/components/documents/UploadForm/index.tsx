import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UploadForm: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-8">
      <div 
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all",
          dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50",
          files.length > 0 && "border-green-500 bg-green-50/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <>
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
              <Upload className="h-8 w-8" />
            </div>
            <p className="mb-2 text-lg font-semibold text-slate-900">
              Drag and drop your files here
            </p>
            <p className="text-sm text-slate-500">
              Maximum file size: 50MB. Supported types: PDF, DOCX, XLSX, PNG, JPG.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => document.getElementById('file-upload')?.click()}>
              Browse Files
            </Button>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              multiple 
              onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
            />
          </>
        ) : (
          <div className="w-full space-y-4">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-green-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-green-100 p-2 text-green-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFiles([])} className="text-slate-400 hover:text-red-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                Clear and start over
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Input label="Document Title" placeholder="Enter document Title" required />
        <Select 
          label="Document Type" 
          options={[
            { label: 'Policy', value: 'policy' },
            { label: 'Invoice', value: 'invoice' },
            { label: 'Contract', value: 'contract' },
            { label: 'Report', value: 'report' },
          ]} 
          required 
        />
        <Select 
          label="Department" 
          options={[
            { label: 'Human Resources', value: 'hr' },
            { label: 'Finance', value: 'finance' },
            { label: 'IT Department', value: 'it' },
            { label: 'Marketing', value: 'marketing' },
          ]} 
          required 
        />
        <Select 
          label="Category" 
          options={[
            { label: 'Engineering', value: 'eng' },
            { label: 'Legal', value: 'legal' },
            { label: 'Operations', value: 'ops' },
          ]} 
          required 
        />
        <div className="lg:col-span-2">
          <Input label="Tags" placeholder="Add tags separated by comma (e.g. Q1, Annual, Confidential)" />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <textarea 
            className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-800 dark:bg-slate-950"
            placeholder="Provide a brief summary of the document contents..."
          />
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-6">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-700">Options</h4>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
            <span className="text-sm text-slate-700">Enable Version Control (Track changes and maintain history)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
            <span className="text-sm text-slate-700">Send for Approval (Forward to department manager for review)</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="outline">Save Draft</Button>
        <Button variant="primary">Submit for Approval</Button>
      </div>
    </div>
  );
};

export default UploadForm;
export { UploadForm };
