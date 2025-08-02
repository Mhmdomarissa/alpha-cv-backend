'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { getMatchScoreColor, getMatchScoreBgColor, formatPercentage } from '@/lib/utils';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export function ResultsView() {
  const { matchResults } = useAppStore();
  const [selectedResult, setSelectedResult] = useState<number | null>(null);

  if (matchResults.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <DocumentMagnifyingGlassIcon className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            No Analysis Results Yet
          </h3>
          <p className="text-secondary-600">
            Upload CVs and a job description, then run the analysis to see matching results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedResults = [...matchResults].sort((a, b) => b.match_score - a.match_score);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>
            Analyzed {matchResults.length} CVs against the job description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-success-600">
                {matchResults.filter(r => r.match_score >= 80).length}
              </p>
              <p className="text-sm text-secondary-600">Excellent Matches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning-600">
                {matchResults.filter(r => r.match_score >= 60 && r.match_score < 80).length}
              </p>
              <p className="text-sm text-secondary-600">Good Matches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-error-600">
                {matchResults.filter(r => r.match_score < 60).length}
              </p>
              <p className="text-sm text-secondary-600">Poor Matches</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {sortedResults.map((result, index) => (
          <motion.div
            key={`${result.cv_id}-${result.job_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <div
                className={`h-2 ${
                  result.match_score >= 80
                    ? 'bg-success-500'
                    : result.match_score >= 60
                    ? 'bg-warning-500'
                    : 'bg-error-500'
                }`}
              />
              
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-secondary-900">
                      {result.cv_filename}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Matched with: {result.job_title}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getMatchScoreColor(result.match_score)}`}>
                      {formatPercentage(result.match_score)}
                    </p>
                    <p className="text-xs text-secondary-600">Match Score</p>
                  </div>
                </div>

                {/* Skills Overview */}
                <div className="grid gap-4 mb-4">
                  {/* Matched Skills */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-success-600" />
                      <p className="font-medium text-secondary-900">
                        Matched Skills ({result.matched_skills.length})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {result.matched_skills.length > 5 && (
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs">
                          +{result.matched_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {result.missing_skills.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircleIcon className="h-5 w-5 text-error-600" />
                        <p className="font-medium text-secondary-900">
                          Missing Skills ({result.missing_skills.length})
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-error-100 text-error-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {result.missing_skills.length > 5 && (
                          <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs">
                            +{result.missing_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggle Details */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedResult(selectedResult === index ? null : index)}
                  fullWidth
                >
                  {selectedResult === index ? 'Hide Details' : 'Show Details'}
                </Button>

                {/* Expanded Details */}
                {selectedResult === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-secondary-200"
                  >
                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <LightBulbIcon className="h-5 w-5 text-warning-600" />
                          <p className="font-medium text-secondary-900">
                            Recommendations
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-warning-600 mt-1">•</span>
                              <span className="text-sm text-secondary-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* All Skills Lists */}
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <p className="font-medium text-secondary-900 mb-2">
                          All Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {result.matched_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-success-50 text-success-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {result.missing_skills.length > 0 && (
                        <div>
                          <p className="font-medium text-secondary-900 mb-2">
                            All Missing Skills
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.missing_skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-error-50 text-error-700 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}