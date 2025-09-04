
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Eye } from "lucide-react";
import TemplatePreview from "../templates/TemplatePreview";

function ResumePreview({ resume }) {
  const { template_id = 'executive-modern', ats_score } = resume;

  const handleExportPdf = () => {
    // This triggers the browser's print functionality, which is styled to save as PDF
    window.print();
  };

  return (
    <Card className="border-0 shadow-lg sticky top-6 resume-preview-container">
      <CardHeader className="p-6 border-b border-slate-100 non-printable">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Live Preview
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
        {ats_score && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-slate-600">ATS Score:</span>
            <Badge 
              className={
                ats_score >= 80 ? 'bg-green-100 text-green-800' :
                ats_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }
            >
              {ats_score}%
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <TemplatePreview 
            template={template_id}
            resume={resume}
            scale={0.4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default React.memo(ResumePreview);
