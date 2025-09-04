import React, { useState } from "react";
import { Resume } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Share2, 
  Link as LinkIcon, 
  Copy, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

export default function ResumeSharing({ resumes, onUpdate }) {
  const [shareableLinks, setShareableLinks] = useState({});
  const [copyMessage, setCopyMessage] = useState('');

  const generateShareableLink = async (resumeId) => {
    try {
      // Generate a unique sharing token (in production, this would be done server-side)
      const shareToken = btoa(`resume_${resumeId}_${Date.now()}`).replace(/[+=]/g, '').substring(0, 16);
      const shareableUrl = `${window.location.origin}/shared/resume/${shareToken}`;
      
      // Update the resume with sharing information
      await Resume.update(resumeId, {
        is_shared: true,
        share_token: shareToken,
        share_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

      setShareableLinks(prev => ({
        ...prev,
        [resumeId]: shareableUrl
      }));

      onUpdate(); // Refresh the data
      return shareableUrl;
    } catch (error) {
      console.error("Error generating shareable link:", error);
    }
  };

  const copyToClipboard = (text, resumeTitle) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(`Link copied for "${resumeTitle}"!`);
    setTimeout(() => setCopyMessage(''), 3000);
  };

  const toggleSharing = async (resume) => {
    try {
      await Resume.update(resume.id, {
        is_shared: !resume.is_shared,
        share_token: resume.is_shared ? null : resume.share_token,
      });
      
      if (resume.is_shared) {
        // Remove from local state if disabling
        setShareableLinks(prev => {
          const newLinks = { ...prev };
          delete newLinks[resume.id];
          return newLinks;
        });
      }
      
      onUpdate();
    } catch (error) {
      console.error("Error toggling sharing:", error);
    }
  };

  const getShareableUrl = (resume) => {
    if (shareableLinks[resume.id]) {
      return shareableLinks[resume.id];
    }
    if (resume.share_token) {
      return `${window.location.origin}/shared/resume/${resume.share_token}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Resume Sharing
          </CardTitle>
          <p className="text-sm text-slate-600">
            Create shareable links to your résumés for recruiters and employers.
          </p>
        </CardHeader>
        <CardContent>
          {copyMessage && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{copyMessage}</AlertDescription>
            </Alert>
          )}

          {resumes.length === 0 ? (
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No résumés to share yet</p>
              <p className="text-sm text-slate-400 mt-1">Create a résumé first</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => {
                const shareUrl = getShareableUrl(resume);
                const isExpired = resume.share_expires && new Date(resume.share_expires) < new Date();
                
                return (
                  <div key={resume.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{resume.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                          <span>Updated {format(new Date(resume.updated_date), 'MMM d, yyyy')}</span>
                          {resume.ats_score && (
                            <Badge variant="secondary" className="text-xs">
                              ATS: {resume.ats_score}%
                            </Badge>
                          )}
                          <Badge 
                            variant={resume.is_shared ? "default" : "secondary"}
                            className={`text-xs ${resume.is_shared ? 'bg-green-100 text-green-800' : ''}`}
                          >
                            {resume.is_shared ? 'Shared' : 'Private'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSharing(resume)}
                          className={resume.is_shared ? 'text-red-600' : 'text-green-600'}
                        >
                          {resume.is_shared ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Stop Sharing
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Share
                            </>
                          )}
                        </Button>
                        
                        {!resume.is_shared && (
                          <Button
                            size="sm"
                            onClick={() => generateShareableLink(resume.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Create Link
                          </Button>
                        )}
                      </div>
                    </div>

                    {shareUrl && resume.is_shared && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <LinkIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Shareable Link</span>
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            value={shareUrl}
                            readOnly
                            className="text-sm bg-white"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(shareUrl, resume.title)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(shareUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {resume.share_expires && !isExpired && (
                          <div className="mt-2 text-xs text-blue-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires {format(new Date(resume.share_expires), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collaboration Feature Preview */}
      <Card className="border-0 shadow-lg border-l-4 border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Collaboration (Coming Soon)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Soon you'll be able to invite collaborators to review and provide feedback on your résumés.
          </p>
          <div className="space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Invite reviewers via email
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Track review progress
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Collect feedback and suggestions
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Version control and history
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}