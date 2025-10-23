"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api/exports"
import type { MediaAsset } from "@/types/media"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, Video as VideoIcon, Loader2, RefreshCw } from "lucide-react"

interface MediaPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  type: "image" | "video"
}

export function MediaPickerDialog({ open, onClose, onSelect, type }: MediaPickerDialogProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadAssets = useCallback(async () => {
    if (!open) return
    setIsLoading(true)
    try {
      const kind = type === "image" ? "IMAGE" : "VIDEO"
      const data = await api.media.getAssets({ kind })
      const filtered = data.filter((asset) =>
        type === "image" ? asset.mimeType.startsWith("image/") : asset.mimeType.startsWith("video/"),
      )
      setAssets(filtered)
    } catch (error) {
      console.error("Failed to load media assets", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load media assets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [open, toast, type])

  useEffect(() => {
    if (open) {
      loadAssets()
    }
  }, [open, loadAssets])

  const filteredAssets = useMemo(() => {
    if (!search.trim()) return assets
    const term = search.trim().toLowerCase()
    return assets.filter((asset) => asset.originalName.toLowerCase().includes(term))
  }, [assets, search])

  const handleSelect = (asset: MediaAsset) => {
    onSelect(asset)
    onClose()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderPreview = (asset: MediaAsset) => {
    if (type === "image") {
      return (
        <img
          src={asset.thumbnailURL || asset.downloadURL || "/placeholder.svg"}
          alt={asset.originalName}
          className="w-full h-full object-cover"
        />
      )
    }

    return (
      <video className="w-full h-full object-cover" muted>
        <source src={asset.downloadURL} />
      </video>
    )
  }

  const EmptyIcon = type === "image" ? ImageIcon : VideoIcon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select a {type === "image" ? "image" : "video"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder={`Search ${type === "image" ? "images" : "videos"}...`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="sm:max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={loadAssets} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading {type === "image" ? "images" : "videos"}...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <EmptyIcon className="h-10 w-10" />
              <p>No {type === "image" ? "images" : "videos"} found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleSelect(asset)}
                  className="group border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="aspect-video bg-muted">{renderPreview(asset)}</div>
                  <div className="p-3 text-left">
                    <p className="text-sm font-medium truncate" title={asset.originalName}>
                      {asset.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatSize(asset.bytes)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
