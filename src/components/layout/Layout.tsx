'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import useAppStore from '@/stores/appStore'
import {
  CloudArrowUpIcon,
  CircleStackIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import toast, { Toaster } from 'react-hot-toast'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentTab, setCurrentTab, cvs, jobDescriptions, matchResults } = useAppStore()

  const tabs = [
    {
      id: 'upload' as const,
      label: 'Upload & Analyze',
      icon: CloudArrowUpIcon,
      description: 'Upload CVs and job descriptions'
    },
    {
      id: 'database' as const,
      label: 'Database',
      icon: CircleStackIcon,
      description: 'View stored documents',
      badge: cvs.length + jobDescriptions.length
    },
    {
      id: 'results' as const,
      label: 'Results',
      icon: ChartBarIcon,
      description: 'Analysis results',
      badge: matchResults.length
    }
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-secondary-900">
                CV Analyzer Platform
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary-600"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = currentTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={cn(
                    'relative flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={cn(
                      'ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full',
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-secondary-100 text-secondary-700'
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-secondary-600">
            <p>© 2024 CV Analyzer Platform. All rights reserved.</p>
            <p>Powered by AI & Machine Learning</p>
          </div>
        </div>
      </footer>

      {/* Toast Container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  )
}

export default Layout