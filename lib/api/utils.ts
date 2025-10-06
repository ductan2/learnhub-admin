export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const getContentApiBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '')
  if (backendUrl) {
    return `${backendUrl}/api/v1/content`
  }
  return '/api/v1/content'
}

export type ContentResource = 'topics' | 'levels' | 'tags'

export const buildContentUrl = (resource: ContentResource, search?: string) => {
  const baseUrl = getContentApiBaseUrl().replace(/\/$/, '')
  const url = `${baseUrl}/${resource}`
  if (search) {
    return `${url}?search=${encodeURIComponent(search)}`
  }
  return url
}

export const buildContentItemUrl = (resource: ContentResource, id: string) => {
  const baseUrl = getContentApiBaseUrl().replace(/\/$/, '')
  return `${baseUrl}/${resource}/${id}`
}

export const extractResourceArray = <T>(payload: unknown, resource: ContentResource): T => {
  if (Array.isArray(payload)) {
    return payload as T
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const possibleKeys: Array<string> = [resource, 'data', 'items', 'results', 'content']

    for (const key of possibleKeys) {
      const value = record[key]

      if (Array.isArray(value)) {
        return value as T
      }

      if (value && typeof value === 'object') {
        const nestedRecord = value as Record<string, unknown>

        for (const nestedKey of possibleKeys) {
          const nestedValue = nestedRecord[nestedKey]

          if (Array.isArray(nestedValue)) {
            return nestedValue as T
          }
        }
      }
    }
  }

  return payload as T
}

export const fetchContentResource = async <T>(resource: ContentResource, search?: string): Promise<T> => {
  const response = await fetch(buildContentUrl(resource, search), {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${resource}`)
  }

  const payload = await response.json()
  return extractResourceArray<T>(payload, resource)
}

export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
