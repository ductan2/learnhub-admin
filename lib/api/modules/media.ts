import type { Folder, MediaAsset, MediaFilters, CreateFolderDto } from '@/types/media'
import { apolloClient } from '@/lib/graphql/client'
import {
  CREATE_FOLDER,
  DELETE_FOLDER,
  DELETE_MEDIA,
  GET_MEDIA_ASSETS,
  LIST_FOLDERS,
  UPLOAD_MEDIA,
} from '@/lib/graphql/queries'

const DEFAULT_PAGE_SIZE = 100

type ListFoldersGraphqlResponse = {
  folders: {
    items: Folder[]
  }
}

type MediaAssetCollectionResponse = {
  mediaAssetCollection: {
    items: MediaAsset[]
  }
}

type UploadMediaGraphqlResponse = {
  uploadMedia: MediaAsset
}

type CreateFolderGraphqlResponse = {
  createFolder: Folder
}

type DeleteFolderGraphqlResponse = {
  deleteFolder: boolean
}

type DeleteMediaGraphqlResponse = {
  deleteMedia: boolean
}

const buildMediaFilterInput = (filters?: MediaFilters) => {
  if (!filters) {
    return undefined
  }

  const input: Record<string, unknown> = {}

  if (filters.folderId !== undefined) {
    input.folderId = filters.folderId
  }

  if (filters.kind) {
    input.kind = filters.kind
  }

  if (filters.uploadedBy) {
    input.uploadedBy = filters.uploadedBy
  }

  if (filters.sha256) {
    input.sha256 = filters.sha256
  }

  if (filters.search) {
    input.search = filters.search
  }

  return Object.keys(input).length > 0 ? input : undefined
}

export const media = {
  getFolders: async (): Promise<Folder[]> => {
    try {
      const { data } = await apolloClient.query<ListFoldersGraphqlResponse>({
        query: LIST_FOLDERS,
        variables: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          orderBy: {
            field: 'NAME',
            direction: 'ASC',
          },
        },
        fetchPolicy: 'network-only',
      })

      return data?.folders?.items ?? []
    } catch (error) {
      console.error('Failed to load folders via GraphQL:', error)
      throw new Error('Failed to load folders')
    }
  },

  getAssets: async (filters?: MediaFilters): Promise<MediaAsset[]> => {
    try {
      const { data } = await apolloClient.query<MediaAssetCollectionResponse>({
        query: GET_MEDIA_ASSETS,
        variables: {
          filter: buildMediaFilterInput(filters),
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          orderBy: {
            field: 'CREATED_AT',
            direction: 'DESC',
          },
        },
        fetchPolicy: 'network-only',
      })

      return data?.mediaAssetCollection?.items ?? []
    } catch (error) {
      console.error('Failed to load media assets via GraphQL:', error)
      throw new Error('Failed to load media assets')
    }
  },

  createFolder: async (data: CreateFolderDto): Promise<Folder> => {
    try {
      const { data: response } = await apolloClient.mutate<CreateFolderGraphqlResponse>({
        mutation: CREATE_FOLDER,
        variables: {
          input: {
            name: data.name,
            parentId: data.parentId ?? null,
          },
        },
      })

      if (!response?.createFolder) {
        throw new Error('Missing createFolder field in response')
      }

      return response.createFolder
    } catch (error) {
      console.error('Failed to create folder via GraphQL:', error)
      throw new Error('Failed to create folder')
    }
  },

  deleteAsset: async (id: string): Promise<void> => {
    try {
      const { data } = await apolloClient.mutate<DeleteMediaGraphqlResponse>({
        mutation: DELETE_MEDIA,
        variables: { id },
      })

      if (!data?.deleteMedia) {
        throw new Error('Failed to delete media')
      }
    } catch (error) {
      console.error('Failed to delete media via GraphQL:', error)
      throw new Error('Failed to delete media')
    }
  },

  deleteFolder: async (id: string): Promise<void> => {
    try {
      const { data } = await apolloClient.mutate<DeleteFolderGraphqlResponse>({
        mutation: DELETE_FOLDER,
        variables: { id },
      })

      if (!data?.deleteFolder) {
        throw new Error('Failed to delete folder')
      }
    } catch (error) {
      console.error('Failed to delete folder via GraphQL:', error)
      throw new Error('Failed to delete folder')
    }
  },

  upload: async (
    file: File,
    kind: 'IMAGE' | 'AUDIO' | 'VIDEO',
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
            folderId: folderId ?? null,
          },
        },
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
