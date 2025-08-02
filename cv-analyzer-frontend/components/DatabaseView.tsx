'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiMethods, CV, JobDescription } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate, truncateText } from '@/lib/utils';
import { DocumentIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export function DatabaseView() {
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);

  // Query for CVs
  const { data: cvsData, isLoading: loadingCVs, refetch: refetchCVs } = useQuery({
    queryKey: ['cvs'],
    queryFn: () => apiMethods.listCVs(),
  });

  // Query for JDs
  const { data: jdsData, isLoading: loadingJDs, refetch: refetchJDs } = useQuery({
    queryKey: ['jds'],
    queryFn: () => apiMethods.listJDs(),
  });

  const handleDeleteCV = async (cvId: string) => {
    if (!confirm('Are you sure you want to delete this CV?')) return;
    
    try {
      await apiMethods.deleteCV(cvId);
      toast.success('CV deleted successfully');
      refetchCVs();
    } catch (error) {
      toast.error('Failed to delete CV');
    }
  };

  const handleDeleteJD = async (jdId: string) => {
    if (!confirm('Are you sure you want to delete this job description?')) return;
    
    try {
      await apiMethods.deleteJD(jdId);
      toast.success('Job description deleted successfully');
      refetchJDs();
    } catch (error) {
      toast.error('Failed to delete job description');
    }
  };

  const cvs = cvsData?.cvs || [];
  const jds = jdsData?.job_descriptions || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* CVs Section */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Uploaded CVs ({cvs.length})</CardTitle>
            <CardDescription>
              Manage your uploaded CV documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCVs ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner h-8 w-8" />
              </div>
            ) : cvs.length === 0 ? (
              <p className="text-center py-8 text-secondary-500">
                No CVs uploaded yet
              </p>
            ) : (
              <div className="space-y-3">
                {cvs.map((cv) => (
                  <motion.div
                    key={cv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <DocumentIcon className="h-5 w-5 text-secondary-500" />
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">
                          {cv.filename}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {formatDate(cv.upload_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCV(cv)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCV(cv.id)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* JDs Section */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Job Descriptions ({jds.length})</CardTitle>
            <CardDescription>
              Manage your job description documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingJDs ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner h-8 w-8" />
              </div>
            ) : jds.length === 0 ? (
              <p className="text-center py-8 text-secondary-500">
                No job descriptions uploaded yet
              </p>
            ) : (
              <div className="space-y-3">
                {jds.map((jd) => (
                  <motion.div
                    key={jd.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <DocumentIcon className="h-5 w-5 text-secondary-500" />
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">
                          {jd.title}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {jd.company || 'No company specified'} • {formatDate(jd.created_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedJD(jd)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJD(jd.id)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {(selectedCV || selectedJD) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-3xl max-h-[80vh] w-full overflow-hidden"
          >
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold">
                {selectedCV ? 'CV Preview' : 'Job Description Preview'}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm">
                {selectedCV ? (selectedCV.extracted_text || selectedCV.content) : selectedJD?.content}
              </pre>
            </div>
            <div className="p-6 border-t border-secondary-200">
              <Button
                onClick={() => {
                  setSelectedCV(null);
                  setSelectedJD(null);
                }}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}