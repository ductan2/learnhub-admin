"use client"

import { useState, useEffect } from "react"
import { Upload, Grid3x3, List, Search, Trash2, FolderInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderTree } from "@/components/media/folder-tree"
import { AssetGrid } from "@/components/media/asset-grid"
import { UploadZone } from "@/components/media/upload-zone"
import { AssetPreviewDialog } from "@/components/media/asset-preview-dialog"
import { CreateFolderDialog } from "@/components/media/create-folder-dialog"
import { api } from "@/lib/api/exports"
import type { Folder, MediaAsset } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function MediaLibraryPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string>("all")
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null)
  const [createFolderDialog, setCreateFolderDialog] = useState<{
    open: boolean
    parentId: string | null
  }>({ open: false, parentId: null })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "folder" | "asset"
    id: string
  } | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadFolders()
    loadAssets()
  }, [])

  useEffect(() => {
    filterAssets()
  }, [assets, selectedFolderId, searchQuery, mimeTypeFilter])

  const loadFolders = async () => {
    try {
      const data = await api.media.getFolders()
      setFolders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive",
      })
    }
  }

  const loadAssets = async () => {
    try {
      const data = await api.media.getAssets()
      setAssets(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive",
      })
    }
  }

  const filterAssets = () => {
    let filtered = [...assets]

    if (selectedFolderId !== null) {
      filtered = filtered.filter((a) => a.folder_id === selectedFolderId)
    }

    if (searchQuery) {
      filtered = filtered.filter((a) => a.filename.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (mimeTypeFilter !== "all") {
      filtered = filtered.filter((a) => a.mime_type.startsWith(mimeTypeFilter))
    }

    setFilteredAssets(filtered)
  }

  const handleCreateFolder = async (name: string) => {
    try {
      await api.media.createFolder({
        name,
        parent_id: createFolderDialog.parentId,
      })
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
      loadFolders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await api.media.deleteFolder(folderId)
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      })
      loadFolders()
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await api.media.deleteAsset(assetId)
      toast({
        title: "Success",
        description: "File deleted successfully",
      })
      loadAssets()
      setSelectedAssets((prev) => {
        const next = new Set(prev)
        next.delete(assetId)
        return next
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async (files: File[]) => {
    const uploads = files.map((file) => ({
      file,
      kind: file.type.startsWith("image/")
        ? "IMAGE"
        : file.type.startsWith("audio/")
          ? "AUDIO"
          : null,
    }))

    const unsupportedCount = uploads.filter((upload) => upload.kind === null).length

    if (unsupportedCount > 0) {
      toast({
        title: "Unsupported files skipped",
        description: `${unsupportedCount} file(s) must be images or audio to upload`,
        variant: "destructive",
      })
    }

    const supportedUploads = uploads.filter(
      (upload): upload is { file: File; kind: "IMAGE" | "AUDIO" } => upload.kind !== null,
    )

    if (supportedUploads.length === 0) {
      return
    }

    try {
      await Promise.all(
        supportedUploads.map(({ file, kind }) =>
          api.media.upload(file, kind, selectedFolderId ?? undefined),
        ),
      )

      toast({
        title: "Success",
        description: `${supportedUploads.length} file(s) uploaded successfully`,
      })
      setShowUploadZone(false)
      await loadAssets()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
      return
    }
  }

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedAssets).map((id) => api.media.deleteAsset(id))
    try {
      await Promise.all(promises)
      toast({
        title: "Success",
        description: `${selectedAssets.size} file(s) deleted successfully`,
      })
      setSelectedAssets(new Set())
      loadAssets()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some files",
        variant: "destructive",
      })
    }
  }

  const currentFolder = selectedFolderId ? folders.find((f) => f.id === selectedFolderId) : null

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
        <FolderTree
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={(parentId) => setCreateFolderDialog({ open: true, parentId })}
          onDeleteFolder={(id) => setDeleteDialog({ open: true, type: "folder", id })}
          onRenameFolder={(id) => {
            toast({
              title: "Coming soon",
              description: "Rename functionality will be added",
            })
          }}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-background p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{currentFolder ? currentFolder.name : "All Files"}</h2>
              {currentFolder && (
                <span className="text-sm text-muted-foreground">({currentFolder.file_count || 0} files)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedAssets.size > 0 && (
                <>
                  <Button variant="outline" size="sm">
                    <FolderInput className="h-4 w-4 mr-2" />
                    Move
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedAssets.size})
                  </Button>
                </>
              )}

              <Button onClick={() => setShowUploadZone(!showUploadZone)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={mimeTypeFilter} onValueChange={setMimeTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid3x3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showUploadZone && (
            <div className="mb-6">
              <UploadZone onUpload={handleUpload} currentFolderId={selectedFolderId} />
            </div>
          )}

          <AssetGrid
            assets={filteredAssets}
            selectedAssets={selectedAssets}
            onToggleSelect={(id) => {
              setSelectedAssets((prev) => {
                const next = new Set(prev)
                if (next.has(id)) {
                  next.delete(id)
                } else {
                  next.add(id)
                }
                return next
              })
            }}
            onSelectAll={() => setSelectedAssets(new Set(filteredAssets.map((a) => a.id)))}
            onDeselectAll={() => setSelectedAssets(new Set())}
            onDeleteAsset={(id) => setDeleteDialog({ open: true, type: "asset", id })}
            onPreviewAsset={setPreviewAsset}
          />
        </div>
      </div>

      <AssetPreviewDialog asset={previewAsset} open={!!previewAsset} onClose={() => setPreviewAsset(null)} />

      <CreateFolderDialog
        open={createFolderDialog.open}
        onClose={() => setCreateFolderDialog({ open: false, parentId: null })}
        onConfirm={handleCreateFolder}
        parentFolderName={
          createFolderDialog.parentId ? folders.find((f) => f.id === createFolderDialog.parentId)?.name : undefined
        }
      />

      <AlertDialog open={deleteDialog?.open} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteDialog?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog?.type === "folder") {
                  handleDeleteFolder(deleteDialog.id)
                } else if (deleteDialog?.type === "asset") {
                  handleDeleteAsset(deleteDialog.id)
                }
                setDeleteDialog(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
