import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Award, Target } from "lucide-react";

export default function PerformanceMetrics({ resumes, sessions, isLoading }) {
  const getAtsInsights = () => {
    const scoresArray = resumes.filter(r => r.ats_score).map(r => r.ats_score);
    if (scoresArray.length === 0) return null;
    
    const avg = scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length;
    const highest = Math.max(...scoresArray);
    const trend = avg >= 75 ? 'excellent' : avg >= 60 ? 'good' : 'needs improvement';
    
    return { avg: Math.round(avg), highest, trend };
  };

  const getInterviewInsights = () => {
    const sessionScores = sessions.filter(s => s.overall_score).map(s => s.overall_score);
    if (sessionScores.length === 0) return null;
    
    const avg = sessionScores.reduce((sum, score) => sum + score, 0) / sessionScores.length;
    const clarity = sessions
      .filter(s => s.clarity_score)
      .reduce((sum, s) => sum + s.clarity_score, 0) / sessions.filter(s => s.clarity_score).length || 0;
    
    return { avg: Math.round(avg), clarity: Math.round(clarity) };
  };

  const atsInsights = getAtsInsights();
  const interviewInsights = getInterviewInsights();

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* ATS Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Target className="w-5 h-5 text-blue-600" />
            ATS Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : !atsInsights ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No ATS data available</p>
              <p className="text-sm text-slate-400 mt-1">Create a résumé to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Average Score</span>
                  <span className="text-2xl font-bold text-slate-900">{atsInsights.avg}%</span>
                </div>
                <Progress value={atsInsights.avg} className="h-3" />
                <div className="flex justify-between items-center mt-2">
                  <Badge 
                    className={
                      atsInsights.trend === 'excellent' 
                        ? 'bg-green-100 text-green-800'
                        : atsInsights.trend === 'good'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }
                  >
                    {atsInsights.trend}
                  </Badge>
                  <span className="text-sm text-slate-500">Highest: {atsInsights.highest}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">{resumes.length}</p>
                  <p className="text-xs text-slate-600">Total Résumés</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">{resumes.filter(r => r.ats_score >= 80).length}</p>
                  <p className="text-xs text-slate-600">High Scoring</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Award className="w-5 h-5 text-purple-600" />
            Interview Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : !interviewInsights ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No interview data available</p>
              <p className="text-sm text-slate-400 mt-1">Start a practice session to get insights</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Overall Performance</span>
                  <span className="text-2xl font-bold text-slate-900">{interviewInsights.avg}%</span>
                </div>
                <Progress value={interviewInsights.avg} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Speech Clarity</span>
                  <span className="text-lg font-bold text-slate-900">{interviewInsights.clarity}%</span>
                </div>
                <Progress value={interviewInsights.clarity} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">{sessions.length}</p>
                  <p className="text-xs text-slate-600">Sessions</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">
                    {sessions.reduce((sum, s) => sum + (s.questions_answered || 0), 0)}
                  </p>
                  <p className="text-xs text-slate-600">Questions</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}