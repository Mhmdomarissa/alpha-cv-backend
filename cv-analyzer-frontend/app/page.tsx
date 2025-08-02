'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/stores/appStore';
import { Navigation } from '@/components/Navigation';
import { UploadPage } from '@/components/UploadPage';
import { SearchPage } from '@/components/SearchPage';
import { CandidatesPage } from '@/components/CandidatesPage';
import { ResultsPage } from '@/components/ResultsPage';

export default function Home() {
  const { currentTab } = useAppStore();

  const renderContent = () => {
    switch (currentTab) {
      case 'upload':
        return <UploadPage />;
      case 'search':
        return <SearchPage />;
      case 'candidates':
        return <CandidatesPage />;
      case 'results':
        return <ResultsPage />;
      default:
        return <UploadPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pb-16">
        {renderContent()}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
    </div>
  );
}
