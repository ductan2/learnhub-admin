import type {
  Topic,
  Level,
  Tag,
  MediaAsset,
  MediaAssetCollection,
  MediaAssetFilter,
  MediaAssetOrder,
  CreateTopicDto,
  UpdateTopicDto,
  CreateLevelDto,
  UpdateLevelDto,
  CreateTagDto,
  UpdateTagDto
} from '@/lib/types'
import { apolloClient } from '@/lib/graphql/client'
import {
  GET_TOPICS,
  CREATE_TOPIC,
  UPDATE_TOPIC,
  DELETE_TOPIC,
  GET_LEVELS,
  CREATE_LEVEL,
  UPDATE_LEVEL,
  DELETE_LEVEL,
  GET_TAGS,
  CREATE_TAG,
  UPDATE_TAG,
  DELETE_TAG,
  GET_MEDIA_ASSETS,
  UPLOAD_MEDIA,
  DELETE_MEDIA
} from '@/lib/graphql/queries'
import { mockTopics, mockLevels, mockTags } from '@/lib/mock-data'

export const topics = {
  getAll: async (search?: string): Promise<Topic[]> => {
    try {
      const { data } = await apolloClient.query({
        query: GET_TOPICS,
        fetchPolicy: 'cache-first'
      })
      return (data as any).topics || []
    } catch (err) {
      console.error('Failed to fetch topics from GraphQL:', err)
      return mockTopics
    }
  },

  create: async (data: CreateTopicDto): Promise<Topic> => {
    try {
      const { data: result } = await apolloClient.mutate({
        mutation: CREATE_TOPIC,
        variables: { input: data },
        refetchQueries: [{ query: GET_TOPICS }]
      })
      return (result as any).createTopic
    } catch (err) {
      console.error('Failed to create topic via GraphQL:', err)
      throw new Error('Failed to create topic')
    }
  },

  update: async (id: string, data: UpdateTopicDto): Promise<Topic> => {
    try {
      const { data: result } = await apolloClient.mutate({
        mutation: UPDATE_TOPIC,
        variables: { id, input: data },
        refetchQueries: [{ query: GET_TOPICS }]
      })
      return (result as any).updateTopic
    } catch (err) {
      console.error('Failed to update topic via GraphQL:', err)
      throw new Error('Failed to update topic')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_TOPIC,
        variables: { id },
        refetchQueries: [{ query: GET_TOPICS }]
      })
    } catch (err) {
      console.error('Failed to delete topic via GraphQL:', err)
      throw new Error('Failed to delete topic')
    }
  },
}

export const levels = {
  getAll: async (search?: string): Promise<Level[]> => {
    try {
      const { data } = await apolloClient.query({
        query: GET_LEVELS,
        fetchPolicy: 'cache-first'
      })
      return (data as any).levels || []
    } catch (err) {
      console.error('Failed to fetch levels from GraphQL:', err)
      return mockLevels
    }
  },

  create: async (data: CreateLevelDto): Promise<Level> => {
    try {
      const { data: result } = await apolloClient.mutate({
        mutation: CREATE_LEVEL,
        variables: { input: data },
        refetchQueries: [{ query: GET_LEVELS }]
      })
      return (result as any).createLevel
    } catch (err) {
      console.error('Failed to create level via GraphQL:', err)
      throw new Error('Failed to create level')
    }
  },

  update: async (id: string, data: UpdateLevelDto): Promise<Level> => {
    try {
      const { data: result } = await apolloClient.mutate({
        mutation: UPDATE_LEVEL,
        variables: { id, input: data },
        refetchQueries: [{ query: GET_LEVELS }]
      })
      return (result as any).updateLevel
    } catch (err) {
      console.error('Failed to update level via GraphQL:', err)
      throw new Error('Failed to update level')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_LEVEL,
        variables: { id },
        refetchQueries: [{ query: GET_LEVELS }]
      })
    } catch (err) {
      console.error('Failed to delete level via GraphQL:', err)
      throw new Error('Failed to delete level')
    }
  },
}

export const tags = {
  getAll: async (search?: string): Promise<Tag[]> => {
    try {
      const { data } = await apolloClient.query({
        query: GET_TAGS,
        fetchPolicy: 'cache-first'
      })
      return (data as any).tags || []
    } catch (err) {
      console.error('Failed to fetch tags from GraphQL:', err)
      return mockTags
    }
  },

  create: async (data: CreateTagDto): Promise<Tag> => {
    try {
      const { data: result } = await apolloClient.mutate({
        mutation: CREATE_TAG,
        variables: { input: data },
        refetchQueries: [{ query: GET_TAGS }]
      })
      return (result as any).createTag
    } catch (err) {
      console.error('Failed to create tag via GraphQL:', err)
      throw new Error('Failed to create tag')
    }
  },

  update: async (id: string, data: UpdateTagDto): Promise<Tag> => {
    try {
      const { data: result } = await apolloClient.mutate({
        mutation: UPDATE_TAG,
        variables: { id, input: data },
        refetchQueries: [{ query: GET_TAGS }]
      })
      return (result as any).updateTag
    } catch (err) {
      console.error('Failed to update tag via GraphQL:', err)
      throw new Error('Failed to update tag')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_TAG,
        variables: { id },
        refetchQueries: [{ query: GET_TAGS }]
      })
    } catch (err) {
      console.error('Failed to delete tag via GraphQL:', err)
      throw new Error('Failed to delete tag')
    }
  },
}

export const media = {
  getAll: async (
    filter?: MediaAssetFilter,
    order?: MediaAssetOrder,
    page?: number,
    pageSize?: number
  ): Promise<MediaAssetCollection> => {
    try {
      const { data } = await apolloClient.query({
        query: GET_MEDIA_ASSETS,
        variables: { filter, order, page, pageSize },
        fetchPolicy: 'cache-first'
      })
      return (data as any).mediaAssets || { items: [], totalCount: 0, page: 1, pageSize: 10 }
    } catch (err) {
      console.error('Failed to fetch media assets from GraphQL:', err)
      return { items: [], totalCount: 0, page: 1, pageSize: 10 }
    }
  },

  upload: async (file: File, kind: 'IMAGE' | 'AUDIO', folderId?: string): Promise<MediaAsset> => {
    try {
      const { data: result } = await apolloClient.mutate({
        mutation: UPLOAD_MEDIA,
        variables: {
          input: {
            file,
            kind,
            mimeType: file.type,
            filename: file.name,
            folderId
          }
        },
        refetchQueries: [{ query: GET_MEDIA_ASSETS }]
      })
      return (result as any).uploadMedia
    } catch (err) {
      console.error('Failed to upload media via GraphQL:', err)
      throw new Error('Failed to upload media')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_MEDIA,
        variables: { id },
        refetchQueries: [{ query: GET_MEDIA_ASSETS }]
      })
    } catch (err) {
      console.error('Failed to delete media via GraphQL:', err)
      throw new Error('Failed to delete media')
    }
  },
}
