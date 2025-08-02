'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiMethods } from '@/lib/api';
import { getTimeAgo, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import { UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function CandidatesPage() {
  const {
    candidates,
    isFetchingCandidates,
    setCandidates,
    setIsFetchingCandidates,
  } = useAppStore();

  const fetchCandidates = async () => {
    setIsFetchingCandidates(true);
    
    try {
      const response = await apiMethods.getCandidates(100);
      setCandidates(response.candidates);
      toast.success(`Loaded ${response.count} candidates`);
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      toast.error(
        error.response?.data?.detail || error.message || 'Failed to load candidates'
      );
    } finally {
      setIsFetchingCandidates(false);
    }
  };

  useEffect(() => {
    // Fetch candidates on mount if not already loaded
    if (candidates.length === 0 && !isFetchingCandidates) {
      fetchCandidates();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">
            All Candidates
          </h2>
          <p className="text-lg text-secondary-600">
            Browse all candidates in the database
          </p>
        </div>
        
        <Button
          onClick={fetchCandidates}
          loading={isFetchingCandidates}
          leftIcon={!isFetchingCandidates ? <ArrowPathIcon className="h-4 w-4" /> : undefined}
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {/* Candidates Grid */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <Card key={candidate.id} variant="bordered" className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-semibold">
                      {getInitials(candidate.full_name)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary-900 truncate">
                      {candidate.full_name}
                    </h3>
                    <p className="text-sm text-secondary-600 truncate mb-3">
                      {candidate.job_title}
                    </p>
                    
                    <div className="space-y-1 text-xs text-secondary-500">
                      <p className="truncate">
                        File: {candidate.filename}
                      </p>
                      <p>
                        {candidate.words_count} words • {candidate.lines_count} lines
                      </p>
                      <p>
                        Added {getTimeAgo(candidate.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-16 text-center">
            <UserGroupIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 mb-4">
              {isFetchingCandidates
                ? 'Loading candidates...'
                : 'No candidates found in the database'}
            </p>
            {!isFetchingCandidates && (
              <p className="text-sm text-secondary-500">
                Upload CVs to start building your candidate database
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {candidates.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-secondary-600">
            Showing <span className="font-medium">{candidates.length}</span> candidates
          </p>
        </div>
      )}
    </div>
  );
}