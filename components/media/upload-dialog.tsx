"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ImageIcon, File, X, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadDialogProps {
  open: boolean
  onClose: () => void
  onUpload: (files: File[]) => Promise<void>
  currentFolderId: string | null
}

interface TempFileItem {
  id: string
  file: File
  previewUrl: string | null
}

export function UploadDialog({ open, onClose, onUpload, currentFolderId }: UploadDialogProps) {
  const [tempFiles, setTempFiles] = useState<TempFileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Build previews for image files
  const createTempItems = (files: File[]) => {
    const items: TempFileItem[] = files.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }))
    return items
  }

  const revokeAllPreviews = useCallback((items: TempFileItem[]) => {
    items.forEach((it) => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl)
    })
  }, [])

  useEffect(() => {
    if (!open) {
      // Cleanup when dialog closes
      revokeAllPreviews(tempFiles)
      setTempFiles([])
      setUploading(false)
      setProgress(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSelectFiles = (files: File[]) => {
    if (!files || files.length === 0) return
    const items = createTempItems(files)
    setTempFiles((prev) => [...prev, ...items])
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleSelectFiles(files)
    // reset input so the same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleAddFilesClick = () => {
    console.log('Add files clicked, input ref:', inputRef.current)
    if (inputRef.current) {
      inputRef.current.click()
    } else {
      console.error('Input ref is null')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files || [])
    handleSelectFiles(files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeTempFile = (id: string) => {
    setTempFiles((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  const clearAll = () => {
    revokeAllPreviews(tempFiles)
    setTempFiles([])
  }

  const isImage = (type: string) => type.startsWith("image/")

  const totalSize = useMemo(() => tempFiles.reduce((sum, t) => sum + t.file.size, 0), [tempFiles])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleConfirmUpload = async () => {
    if (tempFiles.length === 0) return
    setUploading(true)
    setProgress(0)

    // Simulate progress until onUpload resolves
    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 10))
    }, 150)

    try {
      await onUpload(tempFiles.map((t) => t.file))
      setProgress(100)
      // small delay to show 100%
      setTimeout(() => {
        clearInterval(interval)
        setUploading(false)
        revokeAllPreviews(tempFiles)
        setTempFiles([])
        onClose()
      }, 300)
    } catch (e) {
      clearInterval(interval)
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload files {currentFolderId ? "to selected folder" : ""}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              tempFiles.length === 0 ? "border-border" : "border-muted"
            )}
            onDrop={handleDrop}
            onDragOver={onDragOver}
          >
            <div className="flex flex-col items-center gap-3">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag and drop files here, or click to add</p>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                  onChange={onFileInputChange}
                />
                <Button variant="secondary" className="cursor-pointer" type="button" onClick={handleAddFilesClick}>
                  <Plus className="h-4 w-4 mr-2" /> Add files
                </Button>
                {tempFiles.length > 0 && (
                  <Button variant="ghost" onClick={clearAll} type="button">
                    <Trash2 className="h-4 w-4 mr-2" /> Clear all
                  </Button>
                )}
              </div>
            </div>
          </div>

          {tempFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{tempFiles.length} file(s) selected • {formatSize(totalSize)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tempFiles.map((item) => (
                  <div key={item.id} className="group relative border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="absolute top-2 right-2 z-10 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => removeTempFile(item.id)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {item.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                      ) : (
                        <File className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatSize(item.file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleConfirmUpload} disabled={tempFiles.length === 0 || uploading}>
            Upload {tempFiles.length > 0 ? `(${tempFiles.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
