import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, BarChart, RotateCw, Download } from 'lucide-react';
import { format } from "date-fns";

export default function SessionSummary({ session, onRestart }) {
  if (!session) return null;

  const getAverageScore = (key) => {
    // This is a placeholder as detailed scores are not in the main session object.
    // In a real app, this data would be calculated or stored.
    return session.overall_score;
  }

  return (
    <Card className="shadow-2xl border-navy/10 animate-fade-in">
      <CardHeader className="text-center p-8 bg-navy/5">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8"/>
        </div>
        <CardTitle className="text-3xl font-bold text-navy">Session Complete!</CardTitle>
        <CardDescription>
          Practice session from {format(new Date(session.created_date), 'MMMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div>
            <h3 className="text-xl font-semibold text-navy mb-4">Overall Performance</h3>
            <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-gold">{session.overall_score}%</div>
                <div className="flex-1">
                    <p className="text-slate-600 mb-1">You performed well. Keep practicing to build even more confidence.</p>
                    <Progress value={session.overall_score} className="h-3 [&>div]:bg-gold" />
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-navy mb-4">Question Breakdown</h3>
            <div className="space-y-4">
                {(session.questions_data || []).map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <p className="flex-1 text-slate-800 truncate pr-4">Q{i+1}: {q.question}</p>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-navy">{q.individual_score}%</span>
                           <div className={`w-3 h-3 rounded-full ${q.individual_score >= 80 ? 'bg-green-500' : q.individual_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-neutral-gray">
          <Button variant="outline" onClick={onRestart}>
            <RotateCw className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
          <Button className="bg-navy hover:bg-navy/90">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}