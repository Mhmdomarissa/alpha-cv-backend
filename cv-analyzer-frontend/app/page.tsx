'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAppStore } from '@/stores/appStore';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { DatabaseView } from '@/components/DatabaseView';
import { ResultsView } from '@/components/ResultsView';
import { TestApiButton } from '@/components/TestApiButton';
import { apiMethods, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  CloudArrowUpIcon, 
  ServerIcon, 
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function AppContent() {
  const {
    currentTab,
    setCurrentTab,
    isLoading,
    setLoading,
    uploadedFiles,
    setUploadedFiles,
    setMatchResults,
    setIsAnalyzing,
    isAnalyzing,
    setAnalysisProgress,
    setAnalysisStep,
    analysisProgress,
    analysisStep,
  } = useAppStore();

  const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Check system status on mount
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      const status = await apiMethods.getSystemStatus();
      setSystemStatus(status);
      toast.success('Connected to backend successfully');
    } catch (error) {
      console.error('Failed to check system status:', error);
      toast.error('Failed to connect to backend. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCVFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    console.log('CV files selected:', files);
  };

  const handleJDFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedJDFile(files[0]);
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJobDescriptionText(content);
      };
      reader.readAsText(files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!jobDescriptionText.trim() && !selectedJDFile) {
      toast.error('Please provide a job description');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one CV');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisStep('Preparing files...');

      // Upload CVs
      const uploadPromises = uploadedFiles.map(async (file, index) => {
        setAnalysisStep(`Uploading CV ${index + 1}/${uploadedFiles.length}`);
        setAnalysisProgress((index / uploadedFiles.length) * 50);
        return await apiMethods.uploadCV(file);
      });

      const uploadedCVs = await Promise.all(uploadPromises);
      console.log('Uploaded CVs:', uploadedCVs);

      // Create or upload JD
      setAnalysisStep('Processing job description...');
      setAnalysisProgress(60);
      
      let jd;
      if (selectedJDFile) {
        jd = await apiMethods.uploadJD(selectedJDFile);
      } else {
        jd = await apiMethods.createJD({
          title: 'Job Description',
          content: jobDescriptionText,
          requirements: [],
        });
      }

      console.log('Job Description:', jd);

      // Start analysis
      setAnalysisStep('Analyzing CVs with AI...');
      setAnalysisProgress(80);

      const analysisResult = await apiMethods.analyzeAndMatch({
        job_description: jd.content || jobDescriptionText,
        cv_texts: uploadedCVs.map(cv => cv.extracted_text || cv.content),
      });

      console.log('Analysis Result:', analysisResult);

      // Store results in the global store
      setMatchResults(analysisResult.results);

      setAnalysisProgress(100);
      setAnalysisStep('Analysis complete!');
      
      toast.success(`Analysis complete! Processed ${analysisResult.results.length} matches.`);
      
      // Switch to results tab
      setTimeout(() => {
        setCurrentTab('results');
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        setAnalysisStep('');
      }, 1000);

    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(getErrorMessage(error));
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStep('');
    }
  };

  const navItems = [
    { id: 'upload', label: 'Upload & Analyze', icon: CloudArrowUpIcon },
    { id: 'database', label: 'Database', icon: ServerIcon },
    { id: 'results', label: 'Results', icon: ChartBarIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <DocumentMagnifyingGlassIcon className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-secondary-900">CV Analyzer Platform</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      currentTab === item.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status */}
        {systemStatus && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-secondary-600">System Status:</span>
              {Object.entries(systemStatus.services || {}).map(([service, status]) => (
                <span
                  key={service}
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    status ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
                  )}
                >
                  {service}: {status ? 'Online' : 'Offline'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {currentTab === 'upload' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                  <CardDescription>
                    Paste the job description or upload a file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    className="input-base min-h-[200px] resize-none"
                    placeholder="Paste job description here..."
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    disabled={!!selectedJDFile}
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-secondary-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-secondary-500">Or</span>
                    </div>
                  </div>

                  <FileUpload
                    onFilesSelected={handleJDFileSelected}
                    multiple={false}
                    label="Upload Job Description File"
                    maxFiles={1}
                  />
                </CardContent>
              </Card>

              {/* CV Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload CVs</CardTitle>
                  <CardDescription>
                    Upload multiple CV files for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handleCVFilesSelected}
                    label="Upload CV Files"
                    maxFiles={50}
                  />

                  <div className="mt-6">
                    <Button
                      onClick={startAnalysis}
                      fullWidth
                      size="lg"
                      loading={isAnalyzing}
                      disabled={(!jobDescriptionText.trim() && !selectedJDFile) || uploadedFiles.length === 0}
                      leftIcon={!isAnalyzing ? <DocumentMagnifyingGlassIcon className="h-5 w-5" /> : undefined}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                    </Button>

                    {isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4"
                      >
                        <div className="bg-primary-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-primary-900">
                              {analysisStep}
                            </span>
                            <span className="text-sm text-primary-700">
                              {Math.round(analysisProgress)}%
                            </span>
                          </div>
                          <div className="w-full bg-primary-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${analysisProgress}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentTab === 'database' && <DatabaseView />}

          {currentTab === 'results' && <ResultsView />}

          {currentTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure application settings and test API connectivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">API Configuration</h3>
                    <div className="p-4 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-secondary-600 mb-2">
                        Backend URL: <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL || 'http://13.61.179.54:8000'}</span>
                      </p>
                      <p className="text-sm text-secondary-600">
                        Status: <span className={systemStatus ? 'text-success-600' : 'text-error-600'}>
                          {systemStatus ? 'Connected' : 'Disconnected'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Test Backend Connection</h3>
                    <TestApiButton />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

// Import cn utility
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
