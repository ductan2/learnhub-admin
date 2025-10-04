import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryOptions, 
  UseMutationOptions,
  QueryKey 
} from '@tanstack/react-query'
import apiClient, { APIError, transformAPIError } from './client'

// Generic GET hook
export function useApiQuery<TData = unknown>(
  queryKey: QueryKey,
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, APIError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, APIError>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await apiClient.get<TData>(endpoint)
        return response.data
      } catch (error) {
        throw transformAPIError(error)
      }
    },
    ...options,
  })
}

// Generic POST mutation hook
export function useApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, APIError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, APIError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        const response = await apiClient.post<TData>(endpoint, variables)
        return response.data
      } catch (error) {
        throw transformAPIError(error)
      }
    },
    ...options,
  })
}

// Generic PUT mutation hook
export function useApiPutMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, APIError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, APIError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        const response = await apiClient.put<TData>(endpoint, variables)
        return response.data
      } catch (error) {
        throw transformAPIError(error)
      }
    },
    ...options,
  })
}

// Generic PATCH mutation hook
export function useApiPatchMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, APIError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, APIError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        const response = await apiClient.patch<TData>(endpoint, variables)
        return response.data
      } catch (error) {
        throw transformAPIError(error)
      }
    },
    ...options,
  })
}

// Generic DELETE mutation hook
export function useApiDeleteMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, APIError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, APIError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        const response = await apiClient.delete<TData>(endpoint, { data: variables })
        return response.data
      } catch (error) {
        throw transformAPIError(error)
      }
    },
    ...options,
  })
}

// Custom hook to invalidate queries
export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateByKey: (queryKey: QueryKey) => queryClient.invalidateQueries({ queryKey }),
    invalidateByPrefix: (prefix: string) => queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === prefix 
    }),
  }
}