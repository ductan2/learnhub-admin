"use client"

import { Download, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { MediaAsset } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface AssetPreviewDialogProps {
  asset: MediaAsset | null
  open: boolean
  onClose: () => void
}

export function AssetPreviewDialog({ asset, open, onClose }: AssetPreviewDialogProps) {
  const { toast } = useToast()

  if (!asset) return null

  const isImage = asset.mime_type.startsWith("image/")
  const isVideo = asset.mime_type.startsWith("video/")
  const isAudio = asset.mime_type.startsWith("audio/")

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{asset.filename}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-muted rounded-lg overflow-hidden">
              {isImage && (
                <img
                  src={asset.url || "/placeholder.svg"}
                  alt={asset.filename}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              )}
              {isVideo && (
                <video controls className="w-full h-auto max-h-[500px]">
                  <source src={asset.url} type={asset.mime_type} />
                </video>
              )}
              {isAudio && (
                <div className="p-12 flex items-center justify-center">
                  <audio controls className="w-full">
                    <source src={asset.url} type={asset.mime_type} />
                  </audio>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-3">File Details</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="font-medium">{formatFileSize(asset.size_bytes)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium">{asset.mime_type}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Uploaded</dt>
                  <dd className="font-medium">{formatDate(asset.uploaded_at)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Uploaded by</dt>
                  <dd className="font-medium">{asset.uploaded_by}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => copyToClipboard(asset.storage_key, "Storage key")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Storage Key
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => copyToClipboard(asset.url, "URL")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
