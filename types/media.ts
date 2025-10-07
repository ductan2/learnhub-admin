export interface Folder {
    id: string
    name: string
    parentId: string | null
    depth?: number
    childrenCount?: number
    mediaCount?: number
    createdAt?: string
    updatedAt?: string
    parent?: {
        id: string
        name: string
    } | null
}

export interface MediaAsset {
    id: string
    storageKey: string
    kind: 'IMAGE' | 'AUDIO'
    mimeType: string
    folderId?: string | null
    originalName: string
    thumbnailURL?: string | null
    bytes: number
    durationMs?: number | null
    sha256?: string
    createdAt: string
    uploadedBy?: string | null
    downloadURL: string
}

export interface MediaAssetFilter {
    folderId?: string
    kind?: 'IMAGE' | 'AUDIO'
    uploadedBy?: string
    sha256?: string
    search?: string
}

export interface MediaAssetOrder {
    field: 'CREATED_AT' | 'BYTES'
    direction: 'ASC' | 'DESC'
}

export interface MediaAssetCollection {
    items: MediaAsset[]
    totalCount: number
    page: number
    pageSize: number
}

export interface MediaFilters {
    folderId?: string | null
    kind?: 'IMAGE' | 'AUDIO'
    uploadedBy?: string
    sha256?: string
    search?: string
}

// DTO types
export interface CreateFolderDto {
    name: string
    parentId?: string | null
}
