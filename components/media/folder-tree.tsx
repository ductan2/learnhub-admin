"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreVertical, Trash2, Edit2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Folder as FolderType } from "@/types/media"

interface FolderTreeProps {
  folders: FolderType[]
  selectedFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
  onCreateFolder: (parentId: string | null) => void
  onDeleteFolder: (folderId: string) => void
  onRenameFolder: (folderId: string) => void
  onRefresh: () => void
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onRefresh,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]))

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const buildTree = (parentId: string | null): FolderType[] => {
    return folders
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const renderFolder = (folder: FolderType, level = 0) => {
    const children = buildTree(folder.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer group",
            isSelected && "bg-accent",
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleFolder(folder.id)} className="p-0.5 hover:bg-muted rounded">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <button onClick={() => onSelectFolder(folder.id)} className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm truncate">{folder.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">({folder.mediaCount || 0})</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateFolder(folder.id)}>
                <Plus className="h-4 w-4 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRenameFolder(folder.id)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteFolder(folder.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpanded && hasChildren && <div>{children.map((child) => renderFolder(child, level + 1))}</div>}
      </div>
    )
  }

  const rootFolders = buildTree(null)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-sm font-semibold">Folders</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCreateFolder(null)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer",
          selectedFolderId === null && "bg-accent",
        )}
        onClick={() => onSelectFolder(null)}
      >
        <Folder className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">All Files</span>
      </div>

      {rootFolders.map((folder) => renderFolder(folder))}
    </div>
  )
}
