import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import UploadForm from '@/components/documents/UploadForm';

const UploadDocumentPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/documents">
            <Button variant="ghost" size="sm" icon={ArrowLeft} className="h-10 w-10 p-0 rounded-full" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Upload New Document</h1>
            <p className="text-slate-500">Add a new document to the system with metadata and workflow options.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Upload Form */}
        <div className="lg:col-span-2">
          <Card>
            <UploadForm />
          </Card>
        </div>

        {/* Sidebar / Instructions */}
        <div className="space-y-6">
          <Card title="Upload Guidelines" icon={Info} className="bg-blue-50/20 border-blue-100">
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
                <span>Select or drag files into the upload area. You can upload multiple files at once.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                <span>Provide a clear, descriptive title and select the appropriate department.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">3</span>
                <span>Adding tags helps other users find your document through global search.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">4</span>
                <span>Enabling version control allows you to upload future updates as new versions.</span>
              </li>
            </ul>
          </Card>

          <Card title="Need Help?" className="bg-slate-50 border-slate-200">
            <p className="text-sm text-slate-500 mb-4">
              If you are unsure about the document category or classification, please contact your department administrator.
            </p>
            <Button variant="outline" className="w-full">View Documentation</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentPage;
export { UploadDocumentPage };
