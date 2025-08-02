'use client';

import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChartBarIcon, CheckCircleIcon, XCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { truncateText } from '@/lib/utils';

export function ResultsPage() {
  const { analysisResults, setCurrentTab } = useAppStore();

  if (!analysisResults) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card variant="bordered">
          <CardContent className="py-16 text-center">
            <ChartBarIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 mb-4">
              No analysis results available
            </p>
            <p className="text-sm text-secondary-500 mb-6">
              Upload CVs and run analysis to see results here
            </p>
            <Button onClick={() => setCurrentTab('upload')}>
              Go to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { job_description, candidates, summary } = analysisResults;
  const successfulCandidates = candidates.filter(c => c.status === 'success');
  const failedCandidates = candidates.filter(c => c.status === 'error');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 mb-4">
          Analysis Results
        </h2>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-success-600" />
            <span className="text-secondary-600">
              <span className="font-medium text-secondary-900">{summary?.successful || 0}</span> Successful
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-error-600" />
            <span className="text-secondary-600">
              <span className="font-medium text-secondary-900">{summary?.failed || 0}</span> Failed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DocumentDuplicateIcon className="h-5 w-5 text-primary-600" />
            <span className="text-secondary-600">
              <span className="font-medium text-secondary-900">{summary?.total_files || 0}</span> Total
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Description */}
        <div className="lg:col-span-1">
          <Card variant="bordered" className="h-full">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                  {truncateText(job_description, 500)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processed Candidates */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Processed Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              {successfulCandidates.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-secondary-700">
                    Successfully Processed ({successfulCandidates.length})
                  </h4>
                  <div className="space-y-3">
                    {successfulCandidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-success-50 rounded-lg border border-success-200"
                      >
                        <CheckCircleIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-secondary-900">
                            {candidate.candidate_info?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-secondary-600">
                            {candidate.candidate_info?.job_title || 'No title'}
                          </p>
                          <p className="text-xs text-secondary-500 mt-1">
                            {candidate.filename}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {failedCandidates.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-secondary-700">
                    Failed to Process ({failedCandidates.length})
                  </h4>
                  <div className="space-y-3">
                    {failedCandidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-error-50 rounded-lg border border-error-200"
                      >
                        <XCircleIcon className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-secondary-900">
                            {candidate.filename}
                          </p>
                          <p className="text-sm text-error-600">
                            {candidate.message || 'Processing failed'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentTab('search')}
        >
          Search Candidates
        </Button>
        <Button
          onClick={() => setCurrentTab('upload')}
        >
          Analyze More CVs
        </Button>
      </div>
    </div>
  );
}