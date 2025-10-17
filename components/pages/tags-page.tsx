"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Hash, Pencil, Plus, RefreshCw, Search, Tag as TagIcon, Trash2 } from "lucide-react"

import { api } from "@/lib/api/exports"
import type { GraphqlListResult } from "@/lib/api/modules/content"
import type { Tag } from "@/types/common"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
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
import { TagFormDialog } from "@/components/tags/tag-form-dialog"
import { useSearchPagination } from "@/hooks/use-search-pagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function TagsPage() {
  const ITEMS_PER_PAGE = 10
  const [tagsData, setTagsData] = useState<GraphqlListResult<Tag>>(() => ({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: ITEMS_PER_PAGE,
  }))
  const [isLoading, setIsLoading] = useState(true)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { toast } = useToast()
  const { searchQuery, currentPage, updateSearchQuery, updatePage } = useSearchPagination()

  const loadTags = useCallback(async (search?: string, page = 1) => {
    setIsLoading(true)
    try {
      const normalizedSearch = search?.trim()
      const response = await api.tags.getAll({ search: normalizedSearch, page, pageSize: ITEMS_PER_PAGE })
      const sorted = [...response.items].sort((a, b) => a.name.localeCompare(b.name))
      setTagsData({ ...response, items: sorted })
    } catch (error) {
      console.error("Failed to load tags", error)
      toast({
        title: "Unable to load tags",
        description: "We couldn't reach the content service. Showing cached data if available.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [ITEMS_PER_PAGE, toast])

  useEffect(() => {
    const handler = setTimeout(() => {
      void loadTags(searchQuery.trim(), currentPage)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [currentPage, loadTags, searchQuery])

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedTag(null)
    }
    setShowFormDialog(open)
  }

  const handleCreateTag = () => {
    setSelectedTag(null)
    setShowFormDialog(true)
  }

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag)
    setShowFormDialog(true)
  }

  const handleTagMutationSuccess = (_mutatedTag: Tag) => {
    void loadTags(searchQuery.trim(), currentPage)
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(tagsData.totalCount / ITEMS_PER_PAGE)),
    [ITEMS_PER_PAGE, tagsData.totalCount],
  )
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages])
  const { startItem, endItem } = useMemo(() => {
    if (tagsData.totalCount === 0) {
      return { startItem: 0, endItem: 0 }
    }

    const startIndex = (tagsData.page - 1) * tagsData.pageSize + 1
    const endIndex = Math.min(tagsData.page * tagsData.pageSize, tagsData.totalCount)

    return { startItem: startIndex, endItem: endIndex }
  }, [tagsData.page, tagsData.pageSize, tagsData.totalCount])

  useEffect(() => {
    if (isLoading) return

    if (currentPage > totalPages) {
      updatePage(totalPages)
    }
  }, [currentPage, isLoading, totalPages, updatePage])

  const handleDeleteTag = async () => {
    if (!tagToDelete) return

    const targetTag = tagToDelete
    try {
      setIsProcessing(true)
      await api.tags.delete(targetTag.id)
      toast({
        title: "Tag deleted",
        description: `\"${targetTag.name}\" has been removed from your directory.`,
      })
      await loadTags(searchQuery.trim(), currentPage)
    } catch (error) {
      console.error("Failed to delete tag", error)
      toast({
        title: "Unable to delete tag",
        description: "An error occurred while deleting the tag. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setTagToDelete(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Use tags to add flexible metadata to courses, lessons and quizzes for discovery and automation.
          </p>
          <div className="text-xs text-muted-foreground">
            Showing {tagsData.totalCount} tags
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[240px] md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(event) => updateSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => void loadTags(searchQuery.trim(), currentPage)}
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing" : "Refresh"}
          </Button>
          <Button onClick={handleCreateTag} className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            New tag
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TagIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Tags returned</CardTitle>
                <p className="text-sm text-muted-foreground">Currently available from your content service.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{tagsData.items.length}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Unique slugs</CardTitle>
                <p className="text-sm text-muted-foreground">Optimised for SEO friendly URLs and filtering.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{new Set(tagsData.items.map((tag) => tag.slug)).size}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Matches</CardTitle>
                <p className="text-sm text-muted-foreground">Tags visible with the current search filter.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{tagsData.totalCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">Tag directory</CardTitle>
          <Badge variant="outline">{tagsData.items.length} visible</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : tagsData.items.length === 0 ? (
            <div className="p-6">
              <Empty className="border border-dashed border-border/60">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TagIcon className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>No tags found</EmptyTitle>
                  <EmptyDescription>
                    Try adjusting your search query or refresh to fetch the latest tags from your content service.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    onClick={() => void loadTags(searchQuery.trim(), currentPage)}
                    variant="secondary"
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload tags
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[200px]">Slug</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tagsData.items.map((tag) => (
                    <TableRow key={tag.id} className="hover:bg-accent/40">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Badge variant="secondary" className="h-6 w-6 shrink-0 items-center justify-center rounded-full p-0">
                          <TagIcon className="h-3 w-3" />
                        </Badge>
                        {tag.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{tag.slug}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTag(tag)}
                            aria-label={`Edit ${tag.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTagToDelete(tag)}
                            aria-label={`Delete ${tag.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col gap-4 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startItem}-{endItem} of {tagsData.totalCount} tags
                </p>
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            if (currentPage > 1) {
                              updatePage(currentPage - 1)
                            }
                          }}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                      {pageNumbers.map((pageNumber) => (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(event) => {
                              event.preventDefault()
                              updatePage(pageNumber)
                            }}
                            isActive={pageNumber === currentPage}
                            size="default"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(event) => {
                            event.preventDefault()
                            if (currentPage < totalPages) {
                              updatePage(currentPage + 1)
                            }
                          }}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <TagFormDialog
        open={showFormDialog}
        onOpenChange={handleDialogChange}
        tag={selectedTag ?? undefined}
        onSuccess={handleTagMutationSuccess}
        existingSlugs={tagsData.items.map((tag) => tag.slug)}
      />
      <AlertDialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setTagToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove "{tagToDelete?.name}" and unassign it from any content. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
