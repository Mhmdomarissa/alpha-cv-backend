'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { apiMethods } from '@/lib/api';
import toast from 'react-hot-toast';

export function TestApiButton() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testApi = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test health endpoint
      console.log('Testing /health endpoint...');
      const health = await apiMethods.checkHealth();
      testResults.health = health;
      console.log('Health:', health);

      // Test system status
      console.log('Testing /api/upload/system-status endpoint...');
      const systemStatus = await apiMethods.getSystemStatus();
      testResults.systemStatus = systemStatus;
      console.log('System Status:', systemStatus);

      // Test list CVs
      console.log('Testing /api/jobs/list-cvs endpoint...');
      const cvs = await apiMethods.listCVs();
      testResults.cvs = cvs;
      console.log('CVs:', cvs);

      // Test list JDs
      console.log('Testing /api/jobs/list-jds endpoint...');
      const jds = await apiMethods.listJDs();
      testResults.jds = jds;
      console.log('JDs:', jds);

      setResults(testResults);
      toast.success('All API tests passed!');
    } catch (error: any) {
      console.error('API test failed:', error);
      toast.error(`API test failed: ${error.message}`);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={testApi} loading={loading} variant="primary">
        Test Backend API
      </Button>
      
      {results && (
        <div className="mt-4 p-4 bg-secondary-100 rounded-lg">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}