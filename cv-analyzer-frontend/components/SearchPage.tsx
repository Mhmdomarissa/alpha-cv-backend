'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { apiMethods } from '@/lib/api';
import { formatScore, getTimeAgo, truncateText } from '@/lib/utils';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

export function SearchPage() {
  const {
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
  } = useAppStore();

  const [limit, setLimit] = useState(10);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    const toastId = toast.loading('Searching candidates...');

    try {
      const response = await apiMethods.searchCandidates(searchQuery, limit);
      setSearchResults(response.results);
      
      toast.success(
        `Found ${response.count} matching candidate(s)`,
        { id: toastId }
      );
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(
        error.response?.data?.detail || error.message || 'Search failed',
        { id: toastId }
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 mb-4">
          Search Candidates
        </h2>
        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
          Use semantic search to find candidates matching specific skills, experience, or requirements
        </p>
      </div>

      {/* Search Form */}
      <Card variant="bordered" className="max-w-3xl mx-auto mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="e.g., Python developer with 5 years experience in machine learning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-base"
                />
              </div>
              <Button
                onClick={handleSearch}
                loading={isSearching}
                disabled={!searchQuery.trim() || isSearching}
                leftIcon={!isSearching ? <MagnifyingGlassIcon className="h-4 w-4" /> : undefined}
              >
                Search
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm text-secondary-600">
                Results limit:
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-1 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Search Results ({searchResults.length})
          </h3>
          
          <div className="grid gap-4">
            {searchResults.map((result) => (
              <Card key={result.id} variant="bordered" className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-secondary-900">
                            {result.full_name}
                          </h4>
                          <p className="text-sm text-secondary-600">
                            {result.job_title}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-secondary-700 mb-3">
                        {result.text_preview}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-secondary-500">
                        <span>File: {result.filename}</span>
                        <span>•</span>
                        <span>{result.words_count} words</span>
                        <span>•</span>
                        <span>{getTimeAgo(result.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {formatScore(result.score)}
                      </div>
                      <p className="text-xs text-secondary-500">Match Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card variant="bordered" className="max-w-3xl mx-auto">
          <CardContent className="py-12 text-center">
            <MagnifyingGlassIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600">
              No candidates found matching your search criteria.
            </p>
            <p className="text-sm text-secondary-500 mt-2">
              Try adjusting your search query or uploading more CVs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}