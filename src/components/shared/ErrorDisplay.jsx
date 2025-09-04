import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorDisplay({ message, onRetry }) {
  return (
    <Card className="max-w-md w-full mx-auto border-red-200 bg-red-50/50">
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-red-900">An Error Occurred</h2>
        <p className="text-red-800 mb-6">{message || "We couldn't load the requested data. Please try again."}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="destructive">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}