'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import useAppStore from '@/stores/appStore'
import { formatPercentage } from '@/lib/utils'
import {
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const ResultsPage: React.FC = () => {
  const { matchResults } = useAppStore()
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const toggleExpanded = (cvId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cvId)) {
        newSet.delete(cvId)
      } else {
        newSet.add(cvId)
      }
      return newSet
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'success'
    if (score >= 0.6) return 'warning'
    return 'error'
  }

  const exportResults = () => {
    const results = matchResults.map(result => ({
      candidate: result.cv_filename,
      score: formatPercentage(result.score),
      strengths: result.strengths.join(', '),
      gaps: result.gaps.join(', '),
      recommendations: result.recommendations.join(', '),
      assessment: result.overall_assessment
    }))

    const csv = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cv-analysis-results-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (matchResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ChartBarIcon className="h-16 w-16 text-secondary-400 mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">No Analysis Results</h2>
        <p className="text-secondary-600 text-center max-w-md">
          Start by uploading CVs and a job description, then run the AI analysis to see matching results here.
        </p>
      </div>
    )
  }

  const sortedResults = [...matchResults].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>
                Analyzed {matchResults.length} candidates
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={exportResults}
              leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
            >
              Export Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <p className="text-2xl font-bold text-success-700">
                {sortedResults.filter(r => r.score >= 0.8).length}
              </p>
              <p className="text-sm text-success-600">Excellent Matches</p>
            </div>
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <p className="text-2xl font-bold text-warning-700">
                {sortedResults.filter(r => r.score >= 0.6 && r.score < 0.8).length}
              </p>
              <p className="text-sm text-warning-600">Good Matches</p>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <p className="text-2xl font-bold text-secondary-700">
                {sortedResults.filter(r => r.score < 0.6).length}
              </p>
              <p className="text-sm text-secondary-600">Needs Review</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {sortedResults.map((result, index) => {
          const isExpanded = expandedResults.has(result.cv_id)
          const scoreVariant = getScoreColor(result.score)

          return (
            <Card key={result.cv_id} variant="bordered" className="overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-secondary-50 transition-colors"
                onClick={() => toggleExpanded(result.cv_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-secondary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-secondary-900 truncate">
                          {result.cv_filename}
                        </h3>
                        <Badge variant={index === 0 ? 'success' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-600 mt-1">
                        {result.overall_assessment}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary-900">
                        {formatPercentage(result.score, 0)}
                      </p>
                      <p className="text-xs text-secondary-500">Match Score</p>
                    </div>
                    <Progress
                      value={result.score * 100}
                      variant={scoreVariant}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-secondary-200 p-6 bg-secondary-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Strengths */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircleIcon className="h-5 w-5 text-success-600" />
                        <h4 className="text-sm font-semibold text-secondary-900">Strengths</h4>
                      </div>
                      <ul className="space-y-2">
                        {result.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-secondary-700 flex items-start">
                            <span className="text-success-600 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <XCircleIcon className="h-5 w-5 text-error-600" />
                        <h4 className="text-sm font-semibold text-secondary-900">Gaps</h4>
                      </div>
                      <ul className="space-y-2">
                        {result.gaps.map((gap, idx) => (
                          <li key={idx} className="text-sm text-secondary-700 flex items-start">
                            <span className="text-error-600 mr-2">•</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <LightBulbIcon className="h-5 w-5 text-warning-600" />
                        <h4 className="text-sm font-semibold text-secondary-900">Recommendations</h4>
                      </div>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-secondary-700 flex items-start">
                            <span className="text-warning-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <Button variant="outline" size="sm">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      View Full CV
                    </Button>
                    <Button variant="default" size="sm">
                      Schedule Interview
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default ResultsPage