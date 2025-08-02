'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { apiMethods } from '@/lib/api';
import toast from 'react-hot-toast';
import { CloudArrowUpIcon, SparklesIcon } from '@heroicons/react/24/outline';

export function UploadPage() {
  const {
    uploadedFiles,
    jobDescriptionFile,
    jobDescriptionText,
    setUploadedFiles,
    setJobDescriptionFile,
    setJobDescriptionText,
    addUploadedFile,
    removeUploadedFile,
    setIsUploading,
    setAnalysisResults,
    setCurrentTab,
    clearUploadState,
  } = useAppStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCVFilesSelected = (files: File[]) => {
    files.forEach(file => addUploadedFile(file));
    toast.success(`Added ${files.length} CV file(s)`);
  };

  const handleJDFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setJobDescriptionFile(files[0]);
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setJobDescriptionText(e.target?.result as string || '');
      };
      reader.readAsText(files[0]);
      toast.success('Job description file added');
    }
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one CV');
      return;
    }

    if (!jobDescriptionFile && !jobDescriptionText.trim()) {
      toast.error('Please provide a job description');
      return;
    }

    setIsAnalyzing(true);
    const toastId = toast.loading('Analyzing CVs...');

    try {
      // Create job description file if text was entered
      let jdFile = jobDescriptionFile;
      if (!jdFile && jobDescriptionText.trim()) {
        jdFile = apiMethods.createTextFile(jobDescriptionText, 'job_description.txt');
      }

      if (!jdFile) {
        throw new Error('No job description file');
      }

      // Upload files and analyze
      const response = await apiMethods.uploadFiles(uploadedFiles, jdFile);
      
      setAnalysisResults(response);
      
      toast.success(
        `Analysis complete! Processed ${response.summary.successful} CVs successfully.`,
        { id: toastId }
      );

      // Switch to results tab
      setCurrentTab('results');
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(
        error.response?.data?.detail || error.message || 'Analysis failed',
        { id: toastId }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = uploadedFiles.length > 0 && (jobDescriptionFile || jobDescriptionText.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 mb-4">
          Upload CVs for Analysis
        </h2>
        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
          Upload candidate CVs and a job description to find the best matches using AI-powered semantic search
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Description Section */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Paste the job description text or upload a file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Job Description Text
              </label>
              <textarea
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-32 px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center">
              <div className="flex-1 border-t border-secondary-300"></div>
              <span className="px-3 text-sm text-secondary-500">OR</span>
              <div className="flex-1 border-t border-secondary-300"></div>
            </div>

            <FileUpload
              onFilesSelected={handleJDFileSelected}
              files={jobDescriptionFile ? [jobDescriptionFile] : []}
              onRemoveFile={() => setJobDescriptionFile(null)}
              maxFiles={1}
              label="Upload Job Description File"
              helperText="Upload a file containing the job description"
            />
          </CardContent>
        </Card>

        {/* CVs Upload Section */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Candidate CVs</CardTitle>
            <CardDescription>
              Upload multiple CV files for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFilesSelected={handleCVFilesSelected}
              files={uploadedFiles}
              onRemoveFile={removeUploadedFile}
              maxFiles={20}
              label="Upload CV Files"
              helperText="You can upload up to 20 CV files at once"
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={clearUploadState}
          disabled={isAnalyzing}
        >
          Clear All
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          loading={isAnalyzing}
          leftIcon={!isAnalyzing ? <SparklesIcon className="h-4 w-4" /> : undefined}
          size="lg"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze CVs'}
        </Button>
      </div>

      {/* Status Summary */}
      {(uploadedFiles.length > 0 || jobDescriptionFile || jobDescriptionText) && (
        <Card variant="elevated" className="mt-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-secondary-600">
                  Job Description: {' '}
                  <span className="font-medium text-secondary-900">
                    {jobDescriptionFile ? jobDescriptionFile.name : jobDescriptionText ? 'Text provided' : 'Not provided'}
                  </span>
                </p>
                <p className="text-sm text-secondary-600">
                  CVs uploaded: {' '}
                  <span className="font-medium text-secondary-900">
                    {uploadedFiles.length} file(s)
                  </span>
                </p>
              </div>
              {canAnalyze && (
                <p className="text-sm text-success-600 font-medium">
                  Ready to analyze ✓
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}