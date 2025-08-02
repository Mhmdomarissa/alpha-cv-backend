'use client'

import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Layout from '@/components/layout/Layout'
import UploadPage from '@/components/UploadPage'
import DatabasePage from '@/components/DatabasePage'
import ResultsPage from '@/components/ResultsPage'
import useAppStore from '@/stores/appStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const { currentTab, isLoading, setLoading } = useAppStore()

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      console.log('🚀 Initializing CV Analyzer Platform...')
      
      // Quick initialization - set mock data to avoid hanging
      setTimeout(() => {
        setLoading(false)
        console.log('✅ App initialized')
      }, 500)
    }

    initializeApp()
  }, [setLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">Initializing application...</p>
        </div>
      </div>
    )
  }

  const renderCurrentPage = () => {
    // Render all pages but show/hide them to preserve state
    return (
      <>
        <div className={currentTab === 'upload' ? 'block' : 'hidden'}>
          <UploadPage />
        </div>
        <div className={currentTab === 'database' ? 'block' : 'hidden'}>
          <DatabasePage />
        </div>
        <div className={currentTab === 'results' ? 'block' : 'hidden'}>
          <ResultsPage />
        </div>
      </>
    )
  }

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}