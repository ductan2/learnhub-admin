import type { Folder, MediaAsset, MediaFilters, CreateFolderDto } from '@/lib/types'
import { delay } from '@/lib/api/utils'
import { mockFolders, mockMediaAssets } from '@/lib/mock-data'
import { apolloClient } from '@/lib/graphql/client'
import { GET_MEDIA_ASSETS, UPLOAD_MEDIA } from '@/lib/graphql/queries'

type UploadMediaGraphqlResponse = {
  uploadMedia: MediaAsset
}

export const media = {
  getFolders: async (): Promise<Folder[]> => {
    await delay()
    return mockFolders
  },

  getAssets: async (filters?: MediaFilters): Promise<MediaAsset[]> => {
    await delay()
    let assets = [...mockMediaAssets]

    if (filters?.folder_id !== undefined) {
      assets = assets.filter((a) => a.folder_id === filters.folder_id)
    }
    if (filters?.mime_type) {
      assets = assets.filter((a) => a.mime_type.startsWith(filters.mime_type!))
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      assets = assets.filter((a) => a.filename.toLowerCase().includes(search))
    }

    return assets
  },

  createFolder: async (data: CreateFolderDto): Promise<Folder> => {
    await delay()
    const newFolder: Folder = {
      id: String(mockFolders.length + 1),
      name: data.name,
      parent_id: data.parent_id,
      created_at: new Date().toISOString(),
      created_by: 'admin',
      file_count: 0,
      total_size: 0,
    }
    mockFolders.push(newFolder)
    return newFolder
  },

  deleteAsset: async (id: string): Promise<void> => {
    await delay()
    const index = mockMediaAssets.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Asset not found')
    mockMediaAssets.splice(index, 1)
  },

  deleteFolder: async (id: string): Promise<void> => {
    await delay()
    const index = mockFolders.findIndex((f) => f.id === id)
    if (index === -1) throw new Error('Folder not found')
    mockFolders.splice(index, 1)
  },

  upload: async (
    file: File,
    kind: 'IMAGE' | 'AUDIO',
    folderId?: string | null,
  ): Promise<MediaAsset> => {
    try {
      const { data } = await apolloClient.mutate<UploadMediaGraphqlResponse>({
        mutation: UPLOAD_MEDIA,
        variables: {
          input: {
            file,
            kind,
            mimeType: file.type,
            filename: file.name,
            folderId: folderId ?? undefined,
          },
        },
        refetchQueries: [{ query: GET_MEDIA_ASSETS }],
      })

      if (!data?.uploadMedia) {
        throw new Error('Missing uploadMedia field in response')
      }

      return data.uploadMedia
    } catch (error) {
      console.error('Failed to upload media via GraphQL:', error)
      throw new Error('Failed to upload media')
    }
  },
}
