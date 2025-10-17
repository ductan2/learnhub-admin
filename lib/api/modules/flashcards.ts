import { apolloClient } from '@/lib/graphql/client'
import {
  GET_FLASHCARD_SET,
  GET_FLASHCARD_SETS,
  GET_FLASHCARDS,
  CREATE_FLASHCARD_SET,
  ADD_FLASHCARD,
} from '@/lib/graphql/queries'
import type {
  FlashcardSet as GraphqlFlashcardSet,
  Flashcard as GraphqlFlashcard,
  FlashcardSetList,
  FlashcardCollection,
  FlashcardSetResponse,
  FlashcardSetsResponse,
  FlashcardsResponse,
  GetFlashcardSetVariables,
  GetFlashcardSetsVariables,
  GetFlashcardsVariables,
  CreateFlashcardSetVariables,
  AddFlashcardVariables,
  CreateFlashcardSetResponse,
  AddFlashcardResponse,
  FlashcardSetFilterInput,
  FlashcardSetOrderInput,
  FlashcardFilterInput,
  FlashcardOrderInput,
} from '@/content_schema'
import {
  OrderDirection,
  FlashcardSetOrderField,
  FlashcardOrderField,
} from '@/content_schema'
import type { FlashcardSet, Flashcard, CreateFlashcardSetDto, AddFlashcardDto } from '@/types/flashcard'
import type { GraphqlListResult } from './content'

const mapTag = (tag: GraphqlFlashcardSet['tags'][number]): FlashcardSet['tags'][number] => ({
  id: tag.id,
  slug: tag.slug,
  name: tag.name,
})

const mapFlashcard = (card: GraphqlFlashcard): Flashcard => ({
  id: card.id,
  setId: card.setId,
  frontText: card.frontText,
  backText: card.backText,
  frontMediaId: card.frontMediaId ?? undefined,
  backMediaId: card.backMediaId ?? undefined,
  ord: card.ord ?? 0,
  hints: card.hints && card.hints.length > 0 ? [...card.hints] : undefined,
  createdAt: card.createdAt,
})

const mapFlashcardSet = (set: GraphqlFlashcardSet): FlashcardSet => ({
  id: set.id,
  title: set.title,
  description: set.description ?? undefined,
  topicId: set.topicId ?? undefined,
  topic: set.topic ?? undefined,
  levelId: set.levelId ?? undefined,
  level: set.level ?? undefined,
  createdAt: set.createdAt,
  createdBy: set.createdBy ?? undefined,
  tags: Array.isArray(set.tags) ? set.tags.map(mapTag) : [],
  cards: undefined,
  cardCount: Array.isArray(set.cards) ? set.cards.length : 0,
})

const buildFlashcardSetList = (list: FlashcardSetList | null | undefined): GraphqlListResult<FlashcardSet> => {
  const items = list?.items ?? []
  return {
    items: items.map(mapFlashcardSet),
    totalCount: list?.totalCount ?? items.length,
    page: list?.page ?? 1,
    pageSize: list?.pageSize ?? items.length,
  }
}

const buildFlashcardCollection = (collection: FlashcardCollection | null | undefined): GraphqlListResult<Flashcard> => {
  const items = collection?.items ?? []
  return {
    items: items.map(mapFlashcard),
    totalCount: collection?.totalCount ?? items.length,
    page: collection?.page ?? 1,
    pageSize: collection?.pageSize ?? items.length,
  }
}

const buildCreateFlashcardSetInput = (
  data: CreateFlashcardSetDto,
): CreateFlashcardSetVariables['input'] => ({
  title: data.title.trim(),
  description: data.description?.trim() || undefined,
  topicId: data.topicId || undefined,
  levelId: data.levelId || undefined,
})

const buildAddFlashcardInput = (data: AddFlashcardDto): AddFlashcardVariables['input'] => ({
  setId: data.setId,
  frontText: data.frontText.trim(),
  backText: data.backText.trim(),
  frontMediaId: data.frontMediaId || undefined,
  backMediaId: data.backMediaId || undefined,
  hints: data.hints && data.hints.length > 0 ? data.hints : undefined,
})

type GetFlashcardSetsParams = {
  search?: string
  topicId?: string
  levelId?: string
  page?: number
  pageSize?: number
  orderBy?: FlashcardSetOrderInput
}

type GetFlashcardsParams = {
  setId: string
  hasMedia?: boolean
  page?: number
  pageSize?: number
  orderBy?: FlashcardOrderInput
}

export const flashcards = {
  getSets: async (params: GetFlashcardSetsParams = {}): Promise<GraphqlListResult<FlashcardSet>> => {
    try {
      const variables: GetFlashcardSetsVariables = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 12,
        orderBy:
          params.orderBy ?? ({
            field: FlashcardSetOrderField.CREATED_AT,
            direction: OrderDirection.DESC,
          } satisfies FlashcardSetOrderInput),
      }

      const filter: FlashcardSetFilterInput = {}
      const trimmedSearch = params.search?.trim()
      if (trimmedSearch) {
        filter.search = trimmedSearch
      }
      if (params.topicId) {
        filter.topicId = params.topicId
      }
      if (params.levelId) {
        filter.levelId = params.levelId
      }

      if (Object.keys(filter).length > 0) {
        variables.filter = filter
      }

      const { data } = await apolloClient.query<FlashcardSetsResponse, GetFlashcardSetsVariables>({
        query: GET_FLASHCARD_SETS,
        variables,
        fetchPolicy: 'network-only',
      })

      return buildFlashcardSetList(data?.flashcardSets)
    } catch (error) {
      console.error('Failed to fetch flashcard sets via GraphQL:', error)
      throw new Error('Failed to fetch flashcard sets')
    }
  },

  getById: async (id: string): Promise<FlashcardSet> => {
    try {
      const variables: GetFlashcardSetVariables = { id }
      const { data } = await apolloClient.query<FlashcardSetResponse, GetFlashcardSetVariables>({
        query: GET_FLASHCARD_SET,
        variables,
        fetchPolicy: 'network-only',
      })

      if (!data?.flashcardSet) {
        throw new Error('Flashcard set not found')
      }

      return mapFlashcardSet(data.flashcardSet)
    } catch (error) {
      console.error('Failed to fetch flashcard set via GraphQL:', error)
      throw new Error('Failed to fetch flashcard set')
    }
  },

  getCards: async (params: GetFlashcardsParams): Promise<GraphqlListResult<Flashcard>> => {
    try {
      const { setId } = params
      if (!setId) {
        throw new Error('setId is required to fetch flashcards')
      }

      const filter: FlashcardFilterInput = {}
      if (typeof params.hasMedia === 'boolean') {
        filter.hasMedia = params.hasMedia
      }

      const variables: GetFlashcardsVariables = {
        setId,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
        orderBy:
          params.orderBy ?? ({
            field: FlashcardOrderField.ORD,
            direction: OrderDirection.ASC,
          } satisfies FlashcardOrderInput),
      }

      if (Object.keys(filter).length > 0) {
        variables.filter = filter
      }

      const { data } = await apolloClient.query<FlashcardsResponse, GetFlashcardsVariables>({
        query: GET_FLASHCARDS,
        variables,
        fetchPolicy: 'network-only',
      })

      return buildFlashcardCollection(data?.flashcards)
    } catch (error) {
      console.error('Failed to fetch flashcards via GraphQL:', error)
      throw new Error('Failed to fetch flashcards')
    }
  },

  createSet: async (data: CreateFlashcardSetDto): Promise<FlashcardSet> => {
    try {
      const payload: CreateFlashcardSetVariables = {
        input: buildCreateFlashcardSetInput(data),
      }

      const { data: response } = await apolloClient.mutate<
        CreateFlashcardSetResponse,
        CreateFlashcardSetVariables
      >({
        mutation: CREATE_FLASHCARD_SET,
        variables: payload,
      })

      if (!response?.createFlashcardSet) {
        throw new Error('Failed to create flashcard set')
      }

      return mapFlashcardSet(response.createFlashcardSet)
    } catch (error) {
      console.error('Failed to create flashcard set via GraphQL:', error)
      throw new Error('Failed to create flashcard set')
    }
  },

  addCard: async (data: AddFlashcardDto): Promise<Flashcard> => {
    try {
      const payload: AddFlashcardVariables = {
        input: buildAddFlashcardInput(data),
      }

      const { data: response } = await apolloClient.mutate<AddFlashcardResponse, AddFlashcardVariables>({
        mutation: ADD_FLASHCARD,
        variables: payload,
      })

      if (!response?.addFlashcard) {
        throw new Error('Failed to add flashcard')
      }

      return mapFlashcard(response.addFlashcard)
    } catch (error) {
      console.error('Failed to add flashcard via GraphQL:', error)
      throw new Error('Failed to add flashcard')
    }
  },
}

export type FlashcardsApi = typeof flashcards
