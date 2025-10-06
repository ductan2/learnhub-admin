import { gql } from '@apollo/client'

// Topic queries and mutations
export const GET_TOPICS = gql`
  query GetTopics($search: String) {
    topics(search: $search) {
      id
      slug
      name
      createdAt
    }
  }
`

export const CREATE_TOPIC = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      slug
      name
      createdAt
    }
  }
`

export const UPDATE_TOPIC = gql`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput!) {
    updateTopic(id: $id, input: $input) {
      id
      slug
      name
      createdAt
    }
  }
`

export const DELETE_TOPIC = gql`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`

// Level queries and mutations
export const GET_LEVELS = gql`
  query GetLevels($search: String) {
    levels(search: $search) {
      id
      code
      name
    }
  }
`

export const CREATE_LEVEL = gql`
  mutation CreateLevel($input: CreateLevelInput!) {
    createLevel(input: $input) {
      id
      code
      name
    }
  }
`

export const UPDATE_LEVEL = gql`
  mutation UpdateLevel($id: ID!, $input: UpdateLevelInput!) {
    updateLevel(id: $id, input: $input) {
      id
      code
      name
    }
  }
`

export const DELETE_LEVEL = gql`
  mutation DeleteLevel($id: ID!) {
    deleteLevel(id: $id)
  }
`

// Tag queries and mutations
export const GET_TAGS = gql`
  query GetTags($search: String) {
    tags(search: $search) {
      id
      slug
      name
    }
  }
`

export const CREATE_TAG = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      slug
      name
    }
  }
`

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: ID!, $input: UpdateTagInput!) {
    updateTag(id: $id, input: $input) {
      id
      slug
      name
    }
  }
`

export const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`

// Media queries and mutations
export const GET_MEDIA_ASSETS = gql`
  query GetMediaAssets(
    $filter: MediaAssetFilterInput
    $order: MediaAssetOrderInput
    $page: Int
    $pageSize: Int
  ) {
    mediaAssets(filter: $filter, order: $order, page: $page, pageSize: $pageSize) {
      items {
        id
        storageKey
        kind
        mimeType
        folderId
        originalName
        thumbnailURL
        bytes
        durationMs
        sha256
        createdAt
        uploadedBy
        downloadURL
      }
      totalCount
      page
      pageSize
    }
  }
`

export const UPLOAD_MEDIA = gql`
  mutation UploadMedia($input: UploadMediaInput!) {
    uploadMedia(input: $input) {
      id
      storageKey
      kind
      mimeType
      folderId
      originalName
      thumbnailURL
      bytes
      durationMs
      sha256
      createdAt
      uploadedBy
      downloadURL
    }
  }
`

export const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id)
  }
`
