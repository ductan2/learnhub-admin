"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, Grid3x3, List, Search, Trash2, FolderInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderTree } from "@/components/media/folder-tree"
import { AssetGrid } from "@/components/media/asset-grid"
import { AssetPreviewDialog } from "@/components/media/asset-preview-dialog"
import { CreateFolderDialog } from "@/components/media/create-folder-dialog"
import { UploadDialog } from "@/components/media/upload-dialog"
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string>("all")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
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

  const loadFolders = useCallback(async () => {
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
  }, [toast])

  const loadAssets = useCallback(async () => {
    try {
      const kindFilter =
        mimeTypeFilter === "image"
          ? "IMAGE"
          : mimeTypeFilter === "audio"
            ? "AUDIO"
            : undefined

      const data = await api.media.getAssets({
        folderId: selectedFolderId ?? undefined,
        search: searchQuery || undefined,
        kind: kindFilter,
      })

      const filteredAssets =
        mimeTypeFilter === "video"
          ? data.filter((asset) => asset.mimeType.startsWith("video/"))
          : data

      setAssets(filteredAssets)
      setSelectedAssets((prev) => {
        const next = new Set<string>()
        filteredAssets.forEach((asset) => {
          if (prev.has(asset.id)) {
            next.add(asset.id)
          }
        })
        return next
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive",
      })
    }
  }, [mimeTypeFilter, searchQuery, selectedFolderId, toast])

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  useEffect(() => {
    loadAssets()
  }, [loadAssets])

  const handleCreateFolder = async (name: string) => {
    try {
      await api.media.createFolder({
        name,
        parentId: createFolderDialog.parentId,
      })
      toast({
        title: "Success",
        description: "Folder created successfully",
        variant: "success",
      })
      await loadFolders()
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
        variant: "success",
      })
      await loadFolders()
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
      } else {
        await loadAssets()
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
        variant: "success",
      })
      await loadAssets()
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
    // Only handle the first file
    const file = files[0]
    if (!file) {
      return
    }

    const kind = file.type.startsWith("image/")
      ? "IMAGE"
      : file.type.startsWith("audio/")
        ? "AUDIO"
        : null

    if (kind === null) {
      toast({
        title: "Unsupported file type",
        description: "File must be an image or audio to upload",
        variant: "destructive",
      })
      return
    }
    if (selectedFolderId === null) {
      console.log("No folder selected")
      toast({
        title: "No folder selected",
        description: "Please select a folder to upload the file to",
        variant: "destructive",
      })
      return
    }

    try {
      await api.media.upload(file, kind, selectedFolderId ?? undefined)

      toast({
        title: "Success",
        description: "File uploaded successfully",
        variant: "success",
      })
      setShowUploadDialog(false)
      await loadAssets()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to upload file",
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
        variant: "success",
      })
      setSelectedAssets(new Set())
      await loadAssets()
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
          onRefresh={loadFolders}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-background p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{currentFolder ? currentFolder.name : "All Files"}</h2>
              {currentFolder && (
                <span className="text-sm text-muted-foreground">({currentFolder.mediaCount || 0} files)</span>
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

              <Button onClick={() => setShowUploadDialog(true)}>
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

          <AssetGrid
            assets={assets}
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
            onSelectAll={() => setSelectedAssets(new Set(assets.map((a) => a.id)))}
            onDeselectAll={() => setSelectedAssets(new Set())}
            onDeleteAsset={(id) => setDeleteDialog({ open: true, type: "asset", id })}
            onPreviewAsset={setPreviewAsset}
          />
        </div>
      </div>

      <AssetPreviewDialog asset={previewAsset} open={!!previewAsset} onClose={() => setPreviewAsset(null)} />

      <UploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={handleUpload}
        currentFolderId={selectedFolderId}
      />

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
