import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Candidate, SearchResult } from '@/lib/api';

interface AppState {
  // UI State
  currentTab: 'upload' | 'search' | 'candidates' | 'results';
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Upload State
  uploadedFiles: File[];
  jobDescriptionFile: File | null;
  jobDescriptionText: string;
  uploadProgress: number;
  isUploading: boolean;

  // Search State
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;

  // Candidates State
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  isFetchingCandidates: boolean;

  // Analysis Results
  analysisResults: {
    job_description: string;
    candidates: Array<{
      filename: string;
      status: 'success' | 'error';
      candidate_info?: any;
      message?: string;
    }>;
    summary: {
      total_files: number;
      successful: number;
      failed: number;
    };
  } | null;

  // Actions
  setCurrentTab: (tab: AppState['currentTab']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  
  // Upload Actions
  setUploadedFiles: (files: File[]) => void;
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (index: number) => void;
  setJobDescriptionFile: (file: File | null) => void;
  setJobDescriptionText: (text: string) => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (uploading: boolean) => void;
  clearUploadState: () => void;

  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearchResults: () => void;

  // Candidates Actions
  setCandidates: (candidates: Candidate[]) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setIsFetchingCandidates: (fetching: boolean) => void;

  // Analysis Actions
  setAnalysisResults: (results: AppState['analysisResults']) => void;
  clearAnalysisResults: () => void;

  // Global Actions
  resetApp: () => void;
}

const initialState = {
  currentTab: 'upload' as const,
  isLoading: false,
  error: null,
  successMessage: null,
  uploadedFiles: [],
  jobDescriptionFile: null,
  jobDescriptionText: '',
  uploadProgress: 0,
  isUploading: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  candidates: [],
  selectedCandidate: null,
  isFetchingCandidates: false,
  analysisResults: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      ...initialState,

      // UI Actions
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setSuccessMessage: (message) => set({ successMessage: message }),

      // Upload Actions
      setUploadedFiles: (files) => set({ uploadedFiles: files }),
      addUploadedFile: (file) => set((state) => ({ 
        uploadedFiles: [...state.uploadedFiles, file] 
      })),
      removeUploadedFile: (index) => set((state) => ({
        uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index)
      })),
      setJobDescriptionFile: (file) => set({ jobDescriptionFile: file }),
      setJobDescriptionText: (text) => set({ jobDescriptionText: text }),
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      setIsUploading: (uploading) => set({ isUploading: uploading }),
      clearUploadState: () => set({
        uploadedFiles: [],
        jobDescriptionFile: null,
        jobDescriptionText: '',
        uploadProgress: 0,
        isUploading: false,
      }),

      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (searching) => set({ isSearching: searching }),
      clearSearchResults: () => set({ searchResults: [], searchQuery: '' }),

      // Candidates Actions
      setCandidates: (candidates) => set({ candidates }),
      setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
      setIsFetchingCandidates: (fetching) => set({ isFetchingCandidates: fetching }),

      // Analysis Actions
      setAnalysisResults: (results) => set({ analysisResults: results }),
      clearAnalysisResults: () => set({ analysisResults: null }),

      // Global Actions
      resetApp: () => set(initialState),
    }),
    {
      name: 'cv-analyzer-store',
    }
  )
);