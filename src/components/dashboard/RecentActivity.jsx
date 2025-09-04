import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileText, Video, Clock, ExternalLink, Activity } from "lucide-react";

export default function RecentActivity({ resumes, sessions, isLoading }) {
  const recentItems = [
    ...resumes.map(resume => ({
      type: 'resume',
      title: resume.title,
      subtitle: `ATS Score: ${resume.ats_score || 'Pending'}%`,
      date: resume.updated_date,
      icon: FileText,
      status: resume.ats_score ? 'completed' : 'draft'
    })),
    ...sessions.map(session => ({
      type: 'session',
      title: `${session.session_type} Interview`,
      subtitle: `${session.questions_answered} questions • ${session.overall_score || 0}% score`,
      date: session.created_date,
      icon: Video,
      status: 'completed'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Activity
          </CardTitle>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No recent activity yet</p>
            <p className="text-sm text-slate-400 mt-1">Start by creating a résumé or practicing an interview</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentItems.map((item, index) => (
              <div key={index} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                <div className={`p-2.5 rounded-lg ${
                  item.type === 'resume' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
                  <p className="text-sm text-slate-600 truncate">{item.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      {format(new Date(item.date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary"
                    className={item.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                    }
                  >
                    {item.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}