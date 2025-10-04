import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Create base API client
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      // Redirect to login or refresh token
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

// Generic API error type
export interface APIError {
  message: string
  status?: number
  code?: string
}

// Transform Axios error to our API error format
export const transformAPIError = (error: unknown): APIError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      code: error.code,
    }
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }
  
  return {
    message: 'An unknown error occurred',
  }
}