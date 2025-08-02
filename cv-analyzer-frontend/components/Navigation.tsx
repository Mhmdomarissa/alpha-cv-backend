'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { 
  CloudArrowUpIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const tabs = [
  { id: 'upload', label: 'Upload', icon: CloudArrowUpIcon },
  { id: 'search', label: 'Search', icon: MagnifyingGlassIcon },
  { id: 'candidates', label: 'Candidates', icon: UserGroupIcon },
  { id: 'results', label: 'Results', icon: ChartBarIcon },
] as const;

export function Navigation() {
  const { currentTab, setCurrentTab } = useAppStore();

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-secondary-900">CV Analyzer</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={cn(
                    'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}