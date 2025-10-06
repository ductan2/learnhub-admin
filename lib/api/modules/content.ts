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
import type { DocumentNode } from '@apollo/client'

type GraphqlCrudModule<TItem, TCreate, TUpdate> = {
  getAll: (search?: string) => Promise<TItem[]>
  create: (data: TCreate) => Promise<TItem>
  update: (id: string, data: TUpdate) => Promise<TItem>
  delete: (id: string) => Promise<void>
}

type GraphqlCrudConfig<TItem, TCreate, TUpdate> = {
  resourceName: string
  listQuery: DocumentNode
  listField: string
  createMutation: DocumentNode
  createField: string
  updateMutation: DocumentNode
  updateField: string
  deleteMutation: DocumentNode
}

const createGraphqlCrudModule = <TItem, TCreate, TUpdate>(
  config: GraphqlCrudConfig<TItem, TCreate, TUpdate>
): GraphqlCrudModule<TItem, TCreate, TUpdate> => {
  const {
    resourceName,
    listQuery,
    listField,
    createMutation,
    createField,
    updateMutation,
    updateField,
    deleteMutation,
  } = config

  const refetchQueries = [{ query: listQuery }]

  return {
    getAll: async (search?: string) => {
      try {
        const variables = search && search.trim().length > 0 ? { search: search.trim() } : undefined
        const { data } = await apolloClient.query({
          query: listQuery,
          variables,
          fetchPolicy: 'cache-first',
        })
        const items = (data as Record<string, unknown>)[listField]

        if (!Array.isArray(items)) {
          throw new Error(`Missing ${listField} field in response`)
        }

        return items as TItem[]
      } catch (error) {
        console.error(`Failed to fetch ${resourceName}s from GraphQL:`, error)
        throw new Error(`Failed to fetch ${resourceName}s`)
      }
    },

    create: async (input: TCreate) => {
      try {
        const { data } = await apolloClient.mutate({
          mutation: createMutation,
          variables: { input },
          refetchQueries,
        })

        const createdItem = (data as Record<string, unknown>)[createField]

        if (!createdItem) {
          throw new Error(`Missing ${createField} field in response`)
        }

        return createdItem as TItem
      } catch (error) {
        console.error(`Failed to create ${resourceName} via GraphQL:`, error)
        throw new Error(`Failed to create ${resourceName}`)
      }
    },

    update: async (id: string, input: TUpdate) => {
      try {
        const { data } = await apolloClient.mutate({
          mutation: updateMutation,
          variables: { id, input },
          refetchQueries,
        })

        const updatedItem = (data as Record<string, unknown>)[updateField]

        if (!updatedItem) {
          throw new Error(`Missing ${updateField} field in response`)
        }

        return updatedItem as TItem
      } catch (error) {
        console.error(`Failed to update ${resourceName} via GraphQL:`, error)
        throw new Error(`Failed to update ${resourceName}`)
      }
    },

    delete: async (id: string) => {
      try {
        await apolloClient.mutate({
          mutation: deleteMutation,
          variables: { id },
          refetchQueries,
        })
      } catch (error) {
        console.error(`Failed to delete ${resourceName} via GraphQL:`, error)
        throw new Error(`Failed to delete ${resourceName}`)
      }
    },
  }
}

export const topics = createGraphqlCrudModule<Topic, CreateTopicDto, UpdateTopicDto>({
  resourceName: 'topic',
  listQuery: GET_TOPICS,
  listField: 'topics',
  createMutation: CREATE_TOPIC,
  createField: 'createTopic',
  updateMutation: UPDATE_TOPIC,
  updateField: 'updateTopic',
  deleteMutation: DELETE_TOPIC,
})

export const levels = createGraphqlCrudModule<Level, CreateLevelDto, UpdateLevelDto>({
  resourceName: 'level',
  listQuery: GET_LEVELS,
  listField: 'levels',
  createMutation: CREATE_LEVEL,
  createField: 'createLevel',
  updateMutation: UPDATE_LEVEL,
  updateField: 'updateLevel',
  deleteMutation: DELETE_LEVEL,
})

export const tags = createGraphqlCrudModule<Tag, CreateTagDto, UpdateTagDto>({
  resourceName: 'tag',
  listQuery: GET_TAGS,
  listField: 'tags',
  createMutation: CREATE_TAG,
  createField: 'createTag',
  updateMutation: UPDATE_TAG,
  updateField: 'updateTag',
  deleteMutation: DELETE_TAG,
})

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
