import axios, { AxiosInstance, AxiosError } from 'axios'

// API base URL - pointing to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.179.54:8000'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('📤 Request headers:', config.headers)
    
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    })
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        // Optionally redirect to login
      }
    }
    
    return Promise.reject(error)
  }
)

// Type definitions
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: string
}

export interface HealthStatus {
  status: string
  version: string
  timestamp: string
}

export interface SystemStatus {
  status: string
  database: {
    postgres: string
    qdrant: string
  }
  services: {
    gpt: string
    embeddings: string
  }
}

export interface CV {
  id: string
  filename: string
  content: string
  extracted_text?: string
  standardized_data?: Record<string, unknown>
  upload_date: string
  file_size?: number
  file_type?: string
}

export interface JobDescription {
  id: string
  title: string
  content: string
  company?: string
  location?: string
  requirements?: string[]
  standardized_data?: Record<string, unknown>
  created_date: string
}

export interface MatchResult {
  cv_id: string
  cv_filename: string
  score: number
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  overall_assessment: string
}

export interface AnalysisRequest {
  job_description: string
  cv_texts: string[]
}

export interface AnalysisResponse {
  job_id: string
  matches: MatchResult[]
  analysis_date: string
  total_cvs_analyzed: number
}

// API Methods
export const apiMethods = {
  // Health check
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/health')
    return response.data
  },

  // System status
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await apiClient.get<SystemStatus>('/api/upload/system-status')
    return response.data
  },

  // Upload CV
  async uploadCV(file: File): Promise<CV> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post<CV>('/api/jobs/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload Job Description
  async uploadJD(file: File): Promise<JobDescription> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post<JobDescription>('/api/jobs/upload-jd', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // List all CVs
  async listCVs(): Promise<{ cvs: CV[] }> {
    const response = await apiClient.get<{ cvs: CV[] }>('/api/jobs/list-cvs')
    return response.data
  },

  // List all Job Descriptions
  async listJDs(): Promise<{ jds: JobDescription[] }> {
    const response = await apiClient.get<{ jds: JobDescription[] }>('/api/jobs/list-jds')
    return response.data
  },

  // Analyze and match CVs with Job Description
  async analyzeAndMatch(request: AnalysisRequest): Promise<AnalysisResponse> {
    // Backend expects a single string for cv_texts, so we join them
    const modifiedRequest = {
      job_description: request.job_description,
      cv_texts: request.cv_texts.join('\n\n--- NEXT CV ---\n\n')
    }
    
    const response = await apiClient.post<AnalysisResponse>(
      '/api/jobs/analyze-and-match',
      modifiedRequest
    )
    return response.data
  },

  // Delete CV
  async deleteCV(cvId: string): Promise<void> {
    await apiClient.delete(`/api/jobs/cv/${cvId}`)
  },

  // Delete Job Description
  async deleteJD(jdId: string): Promise<void> {
    await apiClient.delete(`/api/jobs/jd/${jdId}`)
  },

  // Get single CV details
  async getCVDetails(cvId: string): Promise<CV> {
    const response = await apiClient.get<CV>(`/api/jobs/cv/${cvId}`)
    return response.data
  },

  // Get single JD details
  async getJDDetails(jdId: string): Promise<JobDescription> {
    const response = await apiClient.get<JobDescription>(`/api/jobs/jd/${jdId}`)
    return response.data
  },

  // Standardize CV
  async standardizeCV(cvId: string): Promise<CV> {
    const response = await apiClient.post<CV>(`/api/jobs/standardize-cv/${cvId}`)
    return response.data
  },

  // Standardize JD
  async standardizeJD(jdId: string): Promise<JobDescription> {
    const response = await apiClient.post<JobDescription>(`/api/jobs/standardize-jd/${jdId}`)
    return response.data
  },
}

export default apiClient