"use client"
import { ImageIcon, Video, Music, File, MoreVertical, Trash2, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { MediaAsset } from "@/types/media"
import { useToast } from "@/hooks/use-toast"

interface AssetGridProps {
  assets: MediaAsset[]
  selectedAssets: Set<string>
  onToggleSelect: (assetId: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onDeleteAsset: (assetId: string) => void
  onPreviewAsset: (asset: MediaAsset) => void
}

export function AssetGrid({
  assets,
  selectedAssets,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onDeleteAsset,
  onPreviewAsset,
}: AssetGridProps) {
  const { toast } = useToast()

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return ImageIcon
    if (mimeType.startsWith("video/")) return Video
    if (mimeType.startsWith("audio/")) return Music
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Storage key copied successfully",
    })
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No files yet</h3>
        <p className="text-sm text-muted-foreground">Upload your first file to get started</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 px-1">
        <Checkbox
          checked={selectedAssets.size === assets.length && assets.length > 0}
          onCheckedChange={(checked) => (checked ? onSelectAll() : onDeselectAll())}
        />
        <span className="text-sm text-muted-foreground">
          {selectedAssets.size > 0 ? `${selectedAssets.size} selected` : "Select all"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets.map((asset) => {
          const Icon = getFileIcon(asset.mimeType)
          const isSelected = selectedAssets.has(asset.id)
          const isImage = asset.mimeType.startsWith("image/")

          return (
            <div
              key={asset.id}
              className={cn(
                "group relative border border-border rounded-lg overflow-hidden hover:border-primary transition-colors",
                isSelected && "border-primary ring-2 ring-primary/20",
              )}
            >
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(asset.id)}
                  className="bg-background"
                />
              </div>

              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyToClipboard(asset.storageKey)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Storage Key
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(asset.downloadURL)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (asset.downloadURL && asset.downloadURL !== "#") {
                          window.open(asset.downloadURL, "_blank")
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteAsset(asset.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button onClick={() => onPreviewAsset(asset)} className="w-full">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {isImage && (asset.thumbnailURL || asset.downloadURL) ? (
                    <img
                      src={asset.thumbnailURL || asset.downloadURL || "/placeholder.svg"}
                      alt={asset.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <div className="p-3 bg-card">
                  <p className="text-sm font-medium truncate" title={asset.originalName}>
                    {asset.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(asset.bytes)}</p>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
