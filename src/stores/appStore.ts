import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { CV, JobDescription, MatchResult } from '@/lib/api'

// File type with ID for tracking
export interface FileWithId extends File {
  id: string
}

// Application state interface
export interface AppState {
  // UI State
  currentTab: 'upload' | 'database' | 'results'
  isLoading: boolean
  error: string | null
  
  // Data State
  cvs: CV[]
  jobDescriptions: JobDescription[]
  matchResults: MatchResult[]
  
  // Upload State
  uploadedFiles: FileWithId[]
  jobDescriptionText: string
  jobDescriptionFile: File | null
  uploadProgress: Record<string, number>
  uploadStatus: Record<string, 'uploading' | 'success' | 'error'>
  
  // Analysis State
  isAnalyzing: boolean
  analysisProgress: number
  analysisStep: string
  currentAnalysisId: string | null
  
  // Actions
  setCurrentTab: (tab: AppState['currentTab']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Data Actions
  setCVs: (cvs: CV[]) => void
  addCV: (cv: CV) => void
  removeCV: (id: string) => void
  setJobDescriptions: (jds: JobDescription[]) => void
  addJobDescription: (jd: JobDescription) => void
  removeJobDescription: (id: string) => void
  setMatchResults: (results: MatchResult[]) => void
  
  // Upload Actions
  setUploadedFiles: (files: FileWithId[]) => void
  addUploadedFile: (file: FileWithId) => void
  removeUploadedFile: (id: string) => void
  setJobDescriptionText: (text: string) => void
  setJobDescriptionFile: (file: File | null) => void
  updateUploadProgress: (id: string, progress: number) => void
  updateUploadStatus: (id: string, status: 'uploading' | 'success' | 'error') => void
  
  // Analysis Actions
  setAnalyzing: (analyzing: boolean) => void
  setAnalysisProgress: (progress: number) => void
  setAnalysisStep: (step: string) => void
  setCurrentAnalysisId: (id: string | null) => void
  
  // Utility Actions
  resetUploadState: () => void
  resetAnalysisState: () => void
  clearAll: () => void
}

// Create store with persistence
const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial UI State
        currentTab: 'upload',
        isLoading: false,
        error: null,
        
        // Initial Data State
        cvs: [],
        jobDescriptions: [],
        matchResults: [],
        
        // Initial Upload State
        uploadedFiles: [],
        jobDescriptionText: '',
        jobDescriptionFile: null,
        uploadProgress: {},
        uploadStatus: {},
        
        // Initial Analysis State
        isAnalyzing: false,
        analysisProgress: 0,
        analysisStep: '',
        currentAnalysisId: null,
        
        // UI Actions
        setCurrentTab: (tab) => set({ currentTab: tab }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        
        // Data Actions
        setCVs: (cvs) => set({ cvs }),
        addCV: (cv) => set((state) => ({ cvs: [...state.cvs, cv] })),
        removeCV: (id) => set((state) => ({ 
          cvs: state.cvs.filter(cv => cv.id !== id) 
        })),
        
        setJobDescriptions: (jds) => set({ jobDescriptions: jds }),
        addJobDescription: (jd) => set((state) => ({ 
          jobDescriptions: [...state.jobDescriptions, jd] 
        })),
        removeJobDescription: (id) => set((state) => ({ 
          jobDescriptions: state.jobDescriptions.filter(jd => jd.id !== id) 
        })),
        
        setMatchResults: (results) => set({ matchResults: results }),
        
        // Upload Actions
        setUploadedFiles: (files) => set({ uploadedFiles: files }),
        addUploadedFile: (file) => set((state) => ({ 
          uploadedFiles: [...state.uploadedFiles, file] 
        })),
        removeUploadedFile: (id) => set((state) => {
          const newUploadProgress = { ...state.uploadProgress }
          const newUploadStatus = { ...state.uploadStatus }
          delete newUploadProgress[id]
          delete newUploadStatus[id]
          
          return {
            uploadedFiles: state.uploadedFiles.filter(file => file.id !== id),
            uploadProgress: newUploadProgress,
            uploadStatus: newUploadStatus
          }
        }),
        
        setJobDescriptionText: (text) => set({ jobDescriptionText: text }),
        setJobDescriptionFile: (file) => set({ jobDescriptionFile: file }),
        
        updateUploadProgress: (id, progress) => set((state) => ({
          uploadProgress: { ...state.uploadProgress, [id]: progress }
        })),
        
        updateUploadStatus: (id, status) => set((state) => ({
          uploadStatus: { ...state.uploadStatus, [id]: status }
        })),
        
        // Analysis Actions
        setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
        setAnalysisStep: (step) => set({ analysisStep: step }),
        setCurrentAnalysisId: (id) => set({ currentAnalysisId: id }),
        
        // Utility Actions
        resetUploadState: () => set({
          uploadedFiles: [],
          jobDescriptionText: '',
          jobDescriptionFile: null,
          uploadProgress: {},
          uploadStatus: {},
        }),
        
        resetAnalysisState: () => set({
          isAnalyzing: false,
          analysisProgress: 0,
          analysisStep: '',
          currentAnalysisId: null,
        }),
        
        clearAll: () => set({
          currentTab: 'upload',
          isLoading: false,
          error: null,
          cvs: [],
          jobDescriptions: [],
          matchResults: [],
          uploadedFiles: [],
          jobDescriptionText: '',
          jobDescriptionFile: null,
          uploadProgress: {},
          uploadStatus: {},
          isAnalyzing: false,
          analysisProgress: 0,
          analysisStep: '',
          currentAnalysisId: null,
        }),
      }),
      {
        name: 'cv-analyzer-storage',
        partialize: (state) => ({
          cvs: state.cvs,
          jobDescriptions: state.jobDescriptions,
          matchResults: state.matchResults,
        }),
      }
    )
  )
)

export default useAppStore