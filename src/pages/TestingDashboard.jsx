import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorLogger } from "../components/monitoring/ErrorLogger";
import { PerformanceMonitor } from "../components/monitoring/PerformanceMonitor";
import { 
  Bug, 
  Zap, 
  Trash2, 
  Download, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

export default function TestingDashboard() {
  const [errors, setErrors] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = () => {
    setErrors(ErrorLogger.getStoredErrors());
    setMetrics(PerformanceMonitor.getStoredMetrics());
  };

  const clearErrors = () => {
    ErrorLogger.clearStoredErrors();
    setErrors([]);
  };

  const clearMetrics = () => {
    PerformanceMonitor.clearStoredMetrics();
    setMetrics([]);
  };

  const runBasicTests = () => {
    const tests = [
      {
        name: 'Local Storage Access',
        test: () => {
          localStorage.setItem('test', 'value');
          const value = localStorage.getItem('test');
          localStorage.removeItem('test');
          return value === 'value';
        }
      },
      {
        name: 'User Entity SDK',
        test: async () => {
          try {
            const { User } = await import('@/api/entities');
            return typeof User.me === 'function';
          } catch (e) {
            return false;
          }
        }
      },
      {
        name: 'SocialPost Entity SDK',
        test: async () => {
          try {
            const { SocialPost } = await import('@/api/entities');
            return typeof SocialPost.list === 'function';
          } catch (e) {
            return false;
          }
        }
      },
      {
        name: 'Email Integration',
        test: async () => {
          try {
            const { SendEmail } = await import('@/api/integrations');
            return typeof SendEmail === 'function';
          } catch (e) {
            return false;
          }
        }
      },
      {
        name: 'AI Integration',
        test: async () => {
          try {
            const { InvokeLLM } = await import('@/api/integrations');
            return typeof InvokeLLM === 'function';
          } catch (e) {
            return false;
          }
        }
      }
    ];

    Promise.all(tests.map(async (test) => ({
      ...test,
      passed: await test.test()
    }))).then(setTestResults);
  };

  const exportData = () => {
    const data = {
      errors,
      metrics,
      testResults,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rezemai-monitoring-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Testing & Monitoring Dashboard</h1>
          </div>
          <p className="text-slate-600">
            Monitor application health, performance, and run diagnostic tests.
          </p>
        </div>

        <Tabs defaultValue="errors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="errors">
              Error Logs ({errors.length})
            </TabsTrigger>
            <TabsTrigger value="performance">
              Performance ({metrics.length})
            </TabsTrigger>
            <TabsTrigger value="tests">
              System Tests
            </TabsTrigger>
            <TabsTrigger value="actions">
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="errors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-500" />
                  Error Logs
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearErrors}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Errors
                </Button>
              </CardHeader>
              <CardContent>
                {errors.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    No errors logged
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {errors.slice(-10).reverse().map((error, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="destructive" className="text-xs">
                            {error.type || 'ERROR'}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-red-800 mb-1">{error.message}</h4>
                        <p className="text-sm text-red-600">{error.endpoint || error.url}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Performance Metrics
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearMetrics}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Metrics
                </Button>
              </CardHeader>
              <CardContent>
                {metrics.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-2" />
                    No performance metrics yet
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {metrics.slice(-10).reverse().map((metric, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {metric.type}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(metric.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {metric.endpoint && (
                          <p className="font-semibold text-sm">{metric.endpoint}</p>
                        )}
                        {metric.duration && (
                          <p className="text-sm text-slate-600">
                            Duration: {metric.duration}ms
                            {metric.duration > 1000 && (
                              <Badge variant="destructive" className="ml-2 text-xs">Slow</Badge>
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Tests</CardTitle>
                <Button onClick={runBasicTests}>
                  Run Tests
                </Button>
              </CardHeader>
              <CardContent>
                {!testResults ? (
                  <div className="text-center py-8 text-slate-500">
                    Click "Run Tests" to check system health
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{test.name}</span>
                        <div className="flex items-center gap-2">
                          {test.passed ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Passed
                              </Badge>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              <Badge variant="destructive">Failed</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Export all monitoring data for external analysis
                  </p>
                  <Button onClick={exportData} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Monitoring Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Errors:</span>
                      <span className="font-semibold ml-2">{errors.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Metrics Logged:</span>
                      <span className="font-semibold ml-2">{metrics.length}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={loadMonitoringData} className="w-full">
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}