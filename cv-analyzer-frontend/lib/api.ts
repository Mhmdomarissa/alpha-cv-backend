import axios from 'axios';

// API Base URL - Change this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📤 Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    console.error('❌ Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
}

export interface CandidateInfo {
  full_name: string;
  job_title: string;
  full_text: string;
  lines_count?: number;
  words_count?: number;
  filename?: string;
}

export interface UploadResponse {
  job_description: string;
  candidates: Array<{
    filename: string;
    status: 'success' | 'error';
    candidate_info?: CandidateInfo;
    message?: string;
  }>;
  summary: {
    total_files: number;
    successful: number;
    failed: number;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  full_name: string;
  job_title: string;
  filename: string;
  lines_count: number;
  words_count: number;
  timestamp: number;
  text_preview: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  count: number;
}

export interface Candidate {
  id: string;
  full_name: string;
  job_title: string;
  filename: string;
  lines_count: number;
  words_count: number;
  timestamp: number;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  count: number;
}

// API Methods
export const apiMethods = {
  // Health check
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Get root info
  async getInfo(): Promise<{ message: string; version: string }> {
    const response = await apiClient.get('/');
    return response.data;
  },

  // Upload files
  async uploadFiles(files: File[], jobDescription: File): Promise<UploadResponse> {
    const formData = new FormData();
    
    // Add CV files
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Add job description
    formData.append('jd', jobDescription);

    const response = await apiClient.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Search candidates
  async searchCandidates(query: string, limit: number = 5): Promise<SearchResponse> {
    const response = await apiClient.post('/search/', { query, limit });
    return response.data;
  },

  // Get all candidates
  async getCandidates(limit: number = 100): Promise<CandidatesResponse> {
    const response = await apiClient.get('/candidates/', {
      params: { limit },
    });
    return response.data;
  },

  // Helper to create a text file from string
  createTextFile(content: string, filename: string): File {
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], filename, { type: 'text/plain' });
  },
};

export default apiClient;