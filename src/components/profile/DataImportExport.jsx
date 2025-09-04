
import React, { useState, useEffect } from "react";
import { Resume, User, InterviewSession, AuditEvent } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
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
  const [resumes, setResumes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    try {
      const [userData, resumeData, sessionData] = await Promise.all([
        User.me(),
        Resume.list(),
        InterviewSession.list()
      ]);
      setUser(userData);
      setResumes(resumeData);
      setSessions(sessionData);
    } catch (error) {
      console.error("Failed to fetch user data for export:", error);
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
        // Handle JSON resume data
        const response = await fetch(file_url);
        extractedData = await response.json();
        setImportProgress(60);
      } else if (['pdf', 'docx', 'doc'].includes(fileExtension)) {
        // Extract resume data from documents
        const result = await ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              personal_info: {
                type: "object",
                properties: {
                  full_name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  location: { type: "string" },
                  summary: { type: "string" }
                }
              },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company: { type: "string" },
                    position: { type: "string" },
                    start_date: { type: "string" },
                    end_date: { type: "string" },
                    achievements: { type: "array", items: { type: "string" } }
                  }
                }
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    institution: { type: "string" },
                    degree: { type: "string" },
                    graduation_year: { type: "string" }
                  }
                }
              },
              skills: { type: "array", items: { type: "string" } }
            }
          }
        });

        if (result.status === 'success') {
          extractedData = result.output;
          setImportProgress(80);
        } else {
          throw new Error(result.details || 'Failed to extract data');
        }
      } else {
        throw new Error('Unsupported file format');
      }

      setImportMessage('Creating résumé...');

      // Step 3: Create new resume from extracted data
      const newResume = await Resume.create({
        title: `Imported from ${uploadedFile.name}`,
        template_id: 'executive-modern',
        personal_info: extractedData.personal_info || {},
        experience: extractedData.experience || [],
        education: extractedData.education || [],
        skills: extractedData.skills || [],
        certifications: extractedData.certifications || [],
        version: 1,
        is_active: true
      });

      setImportProgress(100);
      setImportMessage('Import completed successfully!');

      // Clean up
      setTimeout(() => {
        setImportProgress(0);
        setImportMessage('');
        setUploadedFile(null);
        onUpdate(); // Use the passed onUpdate function
        fetchData(); // Refetch data after import
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
      // Use the AuditEvent entity from the SDK
      await AuditEvent.create({
        user_id: user.id,
        action_type: 'data_export_all',
        metadata: { resume_count: resumes.length, session_count: sessions.length }
      });
      const exportData = {
        export_date: new Date().toISOString(),
        user_profile: {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          linkedin: user.linkedin,
          bio: user.bio,
          current_title: user.current_title,
          company: user.company,
          industry: user.industry,
          years_experience: user.years_experience
        },
        resumes: resumes.map(resume => {
          const { id, created_by, created_date, updated_date, ...rest } = resume;
          return rest;
        }),
        interview_sessions: sessions.map(session => {
          const { id, created_by, created_date, updated_date, ...rest } = session;
          return rest;
        })
      };

      // Create and download the JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `rezemai-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
    setIsExporting(false);
  };

  const exportResumePDF = async (resume) => {
    // This would trigger the print/PDF export for a specific resume
    // For now, we'll just show the resume in a new tab formatted for PDF
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>${resume.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #1A2F4B; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${resume.personal_info?.full_name || 'Resume'}</h1>
            <p>${resume.personal_info?.email || ''}</p>
          </div>
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <p>${resume.personal_info?.summary || ''}</p>
          </div>
          <!-- Additional sections would be rendered here -->
        </body>
      </html>
    `);
    newWindow.document.close();
    setTimeout(() => newWindow.print(), 500);
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
            Import résumé data from existing documents or REZEMAI export files.
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
                Select a file to import résumé data
              </p>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.json"
                className="max-w-xs mx-auto"
                disabled={isImporting}
              />
              <p className="text-xs text-slate-500">
                Supports PDF, DOC, DOCX, and JSON files
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
            <div>• PDF/DOC files: AI will extract résumé information</div>
            <div>• JSON files: Direct import of REZEMAI export data</div>
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
            Download your résumés and session data for backup or transfer.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export All Data */}
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Complete Data Export</h3>
                <p className="text-sm text-slate-600">
                  Download all your résumés and interview sessions as JSON
                </p>
                <div className="text-xs text-slate-500 mt-1">
                  Includes {resumes.length} résumés and {sessions.length} interview sessions
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

          {/* Individual Resume Exports */}
          {resumes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Individual Résumé Exports</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{resume.title}</div>
                      <div className="text-xs text-slate-500">
                        Updated {new Date(resume.updated_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportResumePDF(resume)}
                    >
                      <FolderDown className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
