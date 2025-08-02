import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// API Base URL - Backend is running on port 8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.179.54:8000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to true if you need to send cookies
});

// Request interceptor for auth and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      console.error('❌ API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            // You can redirect to login here if needed
          }
          break;
        case 403:
          console.error('Forbidden: You do not have permission to access this resource');
          break;
        case 404:
          console.error('Not Found: The requested resource does not exist');
          break;
        case 500:
          console.error('Server Error: Something went wrong on the server');
          break;
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No Response:', {
        message: 'The server did not respond. Please check your connection.',
        request: error.request,
      });
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface HealthStatus {
  status: string;
  database?: string;
  vector_db?: string;
  timestamp?: string;
}

export interface SystemStatus {
  status: string;
  services: {
    api: boolean;
    database: boolean;
    vector_store: boolean;
    ai_service: boolean;
  };
  version: string;
}

export interface CV {
  id: string;
  filename: string;
  content: string;
  extracted_text?: string;
  parsed_data?: any;
  upload_date: string;
  file_size?: number;
  file_type?: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  content: string;
  requirements?: string[];
  created_date: string;
}

export interface MatchResult {
  cv_id: string;
  cv_filename: string;
  job_id: string;
  job_title: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  analysis_date: string;
}

export interface AnalysisRequest {
  job_description: string;
  cv_texts: string[];
}

export interface AnalysisResponse {
  results: MatchResult[];
  total_analyzed: number;
  analysis_time: number;
}

// API Methods
export const apiMethods = {
  // Health and Status
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await apiClient.get<HealthStatus>('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await apiClient.get<SystemStatus>('/api/upload/system-status');
      return response.data;
    } catch (error) {
      console.error('System status check failed:', error);
      throw error;
    }
  },

  // CV Operations
  async uploadCV(file: File): Promise<CV> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<CV>('/api/jobs/upload-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('CV upload failed:', error);
      throw error;
    }
  },

  async listCVs(): Promise<{ cvs: CV[] }> {
    try {
      const response = await apiClient.get<{ cvs: CV[] }>('/api/jobs/list-cvs');
      return response.data;
    } catch (error) {
      console.error('Failed to list CVs:', error);
      throw error;
    }
  },

  async deleteCV(cvId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/api/jobs/cv/${cvId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete CV:', error);
      throw error;
    }
  },

  // Job Description Operations
  async uploadJD(file: File): Promise<JobDescription> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post<JobDescription>('/api/jobs/upload-jd', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('JD upload failed:', error);
      throw error;
    }
  },

  async createJD(jobDescription: Partial<JobDescription>): Promise<JobDescription> {
    try {
      const response = await apiClient.post<JobDescription>('/api/jobs/create-jd', jobDescription);
      return response.data;
    } catch (error) {
      console.error('Failed to create JD:', error);
      throw error;
    }
  },

  async listJDs(): Promise<{ job_descriptions: JobDescription[] }> {
    try {
      const response = await apiClient.get<{ job_descriptions: JobDescription[] }>('/api/jobs/list-jds');
      return response.data;
    } catch (error) {
      console.error('Failed to list JDs:', error);
      throw error;
    }
  },

  async deleteJD(jdId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/api/jobs/jd/${jdId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete JD:', error);
      throw error;
    }
  },

  // Analysis Operations
  async analyzeAndMatch(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // The backend expects cv_texts as an array, but each CV should be properly formatted
      const formattedRequest = {
        job_description: request.job_description,
        cv_texts: request.cv_texts.map(text => text.trim()).filter(text => text.length > 0)
      };
      
      console.log('Sending analysis request:', {
        job_description_length: formattedRequest.job_description.length,
        cv_count: formattedRequest.cv_texts.length
      });
      
      const response = await apiClient.post<AnalysisResponse>('/api/jobs/analyze', formattedRequest);
      return response.data;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  },

  async getMatchResults(jobId?: string, cvId?: string): Promise<{ results: MatchResult[] }> {
    try {
      const params = new URLSearchParams();
      if (jobId) params.append('job_id', jobId);
      if (cvId) params.append('cv_id', cvId);
      
      const response = await apiClient.get<{ results: MatchResult[] }>('/api/jobs/matches', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get match results:', error);
      throw error;
    }
  },

  // Utility function for handling file downloads
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },
};

// Export the axios instance for custom requests
export { apiClient };

// Helper function to handle API errors
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}