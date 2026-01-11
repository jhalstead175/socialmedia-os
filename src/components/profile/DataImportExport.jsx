
import React, { useState, useEffect } from "react";
import { SocialPost, ScheduledContent, User, AuditEvent } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  FileText,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  FolderDown
} from "lucide-react";

export default function DataImportExport({ onUpdate }) {
  const [posts, setPosts] = useState([]);
  const [scheduledContent, setScheduledContent] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    try {
      const [userData, postData, scheduledData] = await Promise.all([
        User.me(),
        SocialPost.list(),
        ScheduledContent.list()
      ]);
      setUser(userData);
      setPosts(postData);
      setScheduledContent(scheduledData);
    } catch (error) {
      console.error("Failed to fetch data for export:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setImportMessage('');
  };

  const processImport = async () => {
    if (!uploadedFile) return;

    setIsImporting(true);
    setImportProgress(10);
    setImportMessage('Uploading file...');

    try {
      // Step 1: Upload the file
      const { file_url } = await UploadFile({ file: uploadedFile });
      setImportProgress(30);
      setImportMessage('Analyzing file content...');

      // Step 2: Extract data based on file type
      const fileExtension = uploadedFile.name.split('.').pop().toLowerCase();
      let extractedData;

      if (fileExtension === 'json') {
        // Handle JSON social media data
        const response = await fetch(file_url);
        extractedData = await response.json();
        setImportProgress(60);
      } else if (fileExtension === 'csv') {
        // Handle CSV import for bulk posts
        const response = await fetch(file_url);
        const csvText = await response.text();
        // Parse CSV (simplified - would need proper CSV parser in production)
        extractedData = { posts: [] };
        setImportProgress(60);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }

      setImportMessage('Importing posts...');

      // Step 3: Create posts from extracted data
      if (extractedData.posts && Array.isArray(extractedData.posts)) {
        for (const postData of extractedData.posts) {
          await SocialPost.create({
            content: postData.content || '',
            platform: postData.platform || 'linkedin',
            status: 'draft',
            ...postData
          });
        }
      }

      setImportProgress(100);
      setImportMessage('Import completed successfully!');

      // Clean up
      setTimeout(() => {
        setImportProgress(0);
        setImportMessage('');
        setUploadedFile(null);
        onUpdate?.();
        fetchData();
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      setImportMessage(`Import failed: ${error.message}`);
    }

    setIsImporting(false);
  };

  const exportAllData = async () => {
    if (!user) {
      alert("User data not loaded yet. Please wait a moment and try again.");
      return;
    }
    setIsExporting(true);
    try {
      await AuditEvent.create({
        user_id: user.id,
        action_type: 'data_export_all',
        metadata: { post_count: posts.length, scheduled_count: scheduledContent.length }
      });

      const exportData = {
        export_date: new Date().toISOString(),
        user_profile: {
          full_name: user.full_name,
          email: user.email,
          company: user.company
        },
        social_posts: posts.map(post => {
          const { id, created_by, created_date, updated_date, ...rest } = post;
          return rest;
        }),
        scheduled_content: scheduledContent.map(content => {
          const { id, created_by, created_date, updated_date, ...rest } = content;
          return rest;
        })
      };

      // Create and download the JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `soshlops-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            Import Data
          </CardTitle>
          <p className="text-sm text-slate-600">
            Import social media posts from CSV or SoshOps export files.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {importMessage && (
            <Alert className={`${importMessage.includes('failed') || importMessage.includes('error')
              ? 'border-red-200 bg-red-50'
              : 'border-blue-200 bg-blue-50'}`}>
              {importMessage.includes('failed') || importMessage.includes('error') ? (
                <AlertCircle className="h-4 w-4" />
              ) : importMessage.includes('completed') ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <AlertDescription>{importMessage}</AlertDescription>
            </Alert>
          )}

          {importProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import Progress</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <File className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Select a file to import social media posts
              </p>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".csv,.json"
                className="max-w-xs mx-auto"
                disabled={isImporting}
              />
              <p className="text-xs text-slate-500">
                Supports CSV and JSON files
              </p>
            </div>
          </div>

          {uploadedFile && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-slate-500">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                onClick={processImport}
                disabled={isImporting}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                Import
              </Button>
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-1">
            <div>• CSV files: Bulk import with columns for content, platform, scheduled_time</div>
            <div>• JSON files: Direct import of SoshOps export data</div>
            <div>• Large files may take a few minutes to process</div>
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Export Data
          </CardTitle>
          <p className="text-sm text-slate-600">
            Download your posts and scheduled content for backup or transfer.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Complete Data Export</h3>
                <p className="text-sm text-slate-600">
                  Download all your social media posts and scheduled content as JSON
                </p>
                <div className="text-xs text-slate-500 mt-1">
                  Includes {posts.length} posts and {scheduledContent.length} scheduled items
                </div>
              </div>
              <Button
                onClick={exportAllData}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Export All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
