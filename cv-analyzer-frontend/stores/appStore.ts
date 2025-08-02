import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CV, JobDescription, MatchResult } from '@/lib/api';

interface AppState {
  // UI State
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  currentTab: 'upload' | 'database' | 'results' | 'settings';
  sidebarOpen: boolean;
  
  // Data State
  cvs: CV[];
  jobDescriptions: JobDescription[];
  matchResults: MatchResult[];
  selectedCV: CV | null;
  selectedJD: JobDescription | null;
  
  // Upload State
  uploadedFiles: File[];
  uploadProgress: Record<string, number>;
  uploadStatus: Record<string, 'pending' | 'uploading' | 'success' | 'error'>;
  
  // Analysis State
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisStep: string;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setCurrentTab: (tab: AppState['currentTab']) => void;
  toggleSidebar: () => void;
  
  // CV Actions
  setCVs: (cvs: CV[]) => void;
  addCV: (cv: CV) => void;
  removeCV: (cvId: string) => void;
  setSelectedCV: (cv: CV | null) => void;
  
  // JD Actions
  setJobDescriptions: (jds: JobDescription[]) => void;
  addJobDescription: (jd: JobDescription) => void;
  removeJobDescription: (jdId: string) => void;
  setSelectedJD: (jd: JobDescription | null) => void;
  
  // Match Results Actions
  setMatchResults: (results: MatchResult[]) => void;
  addMatchResult: (result: MatchResult) => void;
  clearMatchResults: () => void;
  
  // Upload Actions
  setUploadedFiles: (files: File[]) => void;
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (fileName: string) => void;
  updateUploadProgress: (fileName: string, progress: number) => void;
  updateUploadStatus: (fileName: string, status: AppState['uploadStatus'][string]) => void;
  clearUploads: () => void;
  
  // Analysis Actions
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setAnalysisStep: (step: string) => void;
  resetAnalysis: () => void;
  
  // Utility Actions
  reset: () => void;
}

const initialState = {
  isLoading: false,
  error: null,
  successMessage: null,
  currentTab: 'upload' as const,
  sidebarOpen: true,
  cvs: [],
  jobDescriptions: [],
  matchResults: [],
  selectedCV: null,
  selectedJD: null,
  uploadedFiles: [],
  uploadProgress: {},
  uploadStatus: {},
  isAnalyzing: false,
  analysisProgress: 0,
  analysisStep: '',
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // UI Actions
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSuccessMessage: (message) => set({ successMessage: message }),
        setCurrentTab: (tab) => set({ currentTab: tab }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        // CV Actions
        setCVs: (cvs) => set({ cvs }),
        addCV: (cv) => set((state) => ({ cvs: [...state.cvs, cv] })),
        removeCV: (cvId) => set((state) => ({ 
          cvs: state.cvs.filter(cv => cv.id !== cvId),
          selectedCV: state.selectedCV?.id === cvId ? null : state.selectedCV
        })),
        setSelectedCV: (cv) => set({ selectedCV: cv }),
        
        // JD Actions
        setJobDescriptions: (jds) => set({ jobDescriptions: jds }),
        addJobDescription: (jd) => set((state) => ({ 
          jobDescriptions: [...state.jobDescriptions, jd] 
        })),
        removeJobDescription: (jdId) => set((state) => ({ 
          jobDescriptions: state.jobDescriptions.filter(jd => jd.id !== jdId),
          selectedJD: state.selectedJD?.id === jdId ? null : state.selectedJD
        })),
        setSelectedJD: (jd) => set({ selectedJD: jd }),
        
        // Match Results Actions
        setMatchResults: (results) => set({ matchResults: results }),
        addMatchResult: (result) => set((state) => ({ 
          matchResults: [...state.matchResults, result] 
        })),
        clearMatchResults: () => set({ matchResults: [] }),
        
        // Upload Actions
        setUploadedFiles: (files) => set({ uploadedFiles: files }),
        addUploadedFile: (file) => set((state) => ({ 
          uploadedFiles: [...state.uploadedFiles, file],
          uploadStatus: { ...state.uploadStatus, [file.name]: 'pending' },
          uploadProgress: { ...state.uploadProgress, [file.name]: 0 }
        })),
        removeUploadedFile: (fileName) => set((state) => {
          const newFiles = state.uploadedFiles.filter(f => f.name !== fileName);
          const newProgress = { ...state.uploadProgress };
          const newStatus = { ...state.uploadStatus };
          delete newProgress[fileName];
          delete newStatus[fileName];
          return { 
            uploadedFiles: newFiles,
            uploadProgress: newProgress,
            uploadStatus: newStatus
          };
        }),
        updateUploadProgress: (fileName, progress) => set((state) => ({ 
          uploadProgress: { ...state.uploadProgress, [fileName]: progress } 
        })),
        updateUploadStatus: (fileName, status) => set((state) => ({ 
          uploadStatus: { ...state.uploadStatus, [fileName]: status } 
        })),
        clearUploads: () => set({ 
          uploadedFiles: [], 
          uploadProgress: {}, 
          uploadStatus: {} 
        }),
        
        // Analysis Actions
        setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
        setAnalysisStep: (step) => set({ analysisStep: step }),
        resetAnalysis: () => set({ 
          isAnalyzing: false, 
          analysisProgress: 0, 
          analysisStep: '' 
        }),
        
        // Utility Actions
        reset: () => set(initialState),
      }),
      {
        name: 'cv-analyzer-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          currentTab: state.currentTab,
          sidebarOpen: state.sidebarOpen,
          // Don't persist temporary data like uploads, analysis state, etc.
        }),
      }
    )
  )
);