import { gql } from '@apollo/client'

// Folder queries and mutations
export const GET_FOLDER = gql`
  query GetFolder($id: ID!) {
    folder(id: $id) {
      id
      name
      parentId
      depth
      childrenCount
      mediaCount
      createdAt
      updatedAt
      parent {
        id
        name
      }
    }
  }
`

export const GET_ROOT_FOLDERS = gql`
  query GetRootFolders {
    rootFolders {
      id
      name
      depth
      childrenCount
      mediaCount
      createdAt
      updatedAt
    }
  }
`

export const GET_FOLDER_TREE = gql`
  query GetFolderTree($id: ID!) {
    folderTree(id: $id) {
      folder {
        id
        name
        depth
        mediaCount
      }
      children {
        folder {
          id
          name
          depth
          mediaCount
        }
        children {
          folder {
            id
            name
            depth
            mediaCount
          }
        }
      }
    }
  }
`

export const GET_FOLDER_PATH = gql`
  query GetFolderPath($id: ID!) {
    folderPath(id: $id) {
      id
      name
      depth
    }
  }
`

export const LIST_FOLDERS = gql`
  query ListFolders(
    $filter: FolderFilterInput
    $page: Int
    $pageSize: Int
    $orderBy: FolderOrderInput
  ) {
    folders(filter: $filter, page: $page, pageSize: $pageSize, orderBy: $orderBy) {
      items {
        id
        name
        parentId
        depth
        childrenCount
        mediaCount
        createdAt
        updatedAt
      }
      totalCount
      page
      pageSize
    }
  }
`

export const CREATE_FOLDER = gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
      name
      parentId
      depth
      childrenCount
      mediaCount
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_FOLDER = gql`
  mutation UpdateFolder($id: ID!, $input: UpdateFolderInput!) {
    updateFolder(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`

export const DELETE_FOLDER = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`

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
    $page: Int
    $pageSize: Int
    $orderBy: MediaAssetOrderInput
  ) {
    mediaAssetCollection(
      filter: $filter
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
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
  mutation Upload($input: UploadMediaInput!) {
    uploadMedia(input: $input) {
      id
      originalName
      downloadURL
    }
  }
`

export const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id)
  }
`
