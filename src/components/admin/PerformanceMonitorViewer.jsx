import React, { useState, useEffect, useCallback } from 'react';
import { PerformanceLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Frown } from 'lucide-react';
import { format } from 'date-fns';
import _ from 'lodash';

export default function PerformanceMonitorViewer() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    avgDuration: 0,
    slowestActions: [],
  });

  const processData = useCallback((data) => {
    if (data.length === 0) return;

    const avgDuration = _.meanBy(data, 'duration_ms');

    const slowestActions = _.chain(data)
      .groupBy('action_name')
      .map((entries, actionName) => ({
        name: actionName,
        avg: _.meanBy(entries, 'duration_ms'),
        max: _.maxBy(entries, 'duration_ms')?.duration_ms,
        count: entries.length,
      }))
      .orderBy(['avg'], ['desc'])
      .take(5)
      .value();

    setStats({ avgDuration, slowestActions });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const perfLogs = await PerformanceLog.list('-created_date', 200);
        setLogs(perfLogs);
        processData(perfLogs);
      } catch (error) {
        console.error("Failed to load performance logs:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, [processData]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }
  
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart /> Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
            <Frown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No performance data has been logged yet.</p>
            <p className="text-sm text-slate-400 mt-1">Perform actions in the app to see metrics here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart /> Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600">Avg. Action Duration</p>
              <p className="text-3xl font-bold text-navy">{stats.avgDuration.toFixed(0)} ms</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-600">Total Actions Logged</p>
              <p className="text-3xl font-bold text-navy">{logs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slowest Actions (Avg. Duration)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.slowestActions} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="ms" />
              <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
              <Bar dataKey="avg" fill="#1A2F4B" name="Avg Duration (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Duration (ms)</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.slice(0, 10).map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action_name}</TableCell>
                  <TableCell>{log.duration_ms.toFixed(0)}</TableCell>
                  <TableCell className="text-xs text-slate-500">{log.user_id}</TableCell>
                  <TableCell>{format(new Date(log.created_date), 'PP p')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}