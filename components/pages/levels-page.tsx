"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ListOrdered, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { api } from "@/lib/api/exports"
import type { Level } from "@/types/common"
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
import { LevelFormDialog } from "@/components/levels/level-form-dialog"
import { useSearchPagination } from "@/hooks/use-search-pagination"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { toast } = useToast()
  const { searchQuery, currentPage, updateSearchQuery, updatePage } = useSearchPagination()
  const ITEMS_PER_PAGE = 10

  const loadLevels = useCallback(async (search?: string) => {
    setIsLoading(true)
    try {
      const data = await api.levels.getAll(search)
      setLevels(data)
    } catch (error) {
      console.error("Failed to load levels", error)
      toast({
        title: "Unable to load levels",
        description: "We couldn't reach the content service. Showing cached data if available.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const handler = setTimeout(() => {
      loadLevels(searchQuery.trim())
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [loadLevels, searchQuery])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(levels.length / ITEMS_PER_PAGE)), [levels.length])
  const paginatedLevels = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return levels.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, levels])
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages])
  const { startItem, endItem } = useMemo(() => {
    if (levels.length === 0) {
      return { startItem: 0, endItem: 0 }
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, levels.length)

    return { startItem: startIndex, endItem: endIndex }
  }, [currentPage, levels.length])

  useEffect(() => {
    if (isLoading) return

    if (currentPage > totalPages) {
      updatePage(totalPages)
    }
  }, [currentPage, isLoading, totalPages, updatePage])

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedLevel(null)
    }
    setShowFormDialog(open)
  }

  const handleCreateLevel = () => {
    setSelectedLevel(null)
    setShowFormDialog(true)
  }

  const handleEditLevel = (level: Level) => {
    setSelectedLevel(level)
    setShowFormDialog(true)
  }

  const handleLevelMutationSuccess = (mutatedLevel: Level) => {
    setLevels((previous) => {
      const exists = previous.some((item) => item.id === mutatedLevel.id)
      const updated = exists
        ? previous.map((item) => (item.id === mutatedLevel.id ? mutatedLevel : item))
        : [...previous, mutatedLevel]
      return updated
    })
  }

  const handleDeleteLevel = async () => {
    if (!levelToDelete) return

    const targetLevel = levelToDelete
    try {
      setIsProcessing(true)
      await api.levels.delete(targetLevel.id)
      toast({
        title: "Level deleted",
        description: `\"${targetLevel.name}\" has been removed from the hierarchy.`,
      })
      setLevels((previous) => previous.filter((item) => item.id !== targetLevel.id))
    } catch (error) {
      console.error("Failed to delete level", error)
      toast({
        title: "Unable to delete level",
        description: "An error occurred while removing the level. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setLevelToDelete(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Define learner progression and difficulty for courses, lessons and quizzes.
          </p>
          <div className="text-xs text-muted-foreground">
            Showing {levels.length} levels
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[240px] md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search levels..."
              value={searchQuery}
              onChange={(event) => updateSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => loadLevels(searchQuery.trim())}
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing" : "Refresh"}
          </Button>
          <Button onClick={handleCreateLevel} className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            New level
          </Button>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">Level hierarchy</CardTitle>
          <Badge variant="outline">{levels.length} total</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : levels.length === 0 ? (
            <div className="p-6">
              <Empty className="border border-dashed border-border/60">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListOrdered className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>No levels found</EmptyTitle>
                  <EmptyDescription>
                    Try adjusting your search query or refresh to fetch the latest levels from your content service.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => loadLevels(searchQuery.trim())} variant="secondary" disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload levels
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Identifier</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLevels.map((level) => (
                    <TableRow key={level.id} className="hover:bg-accent/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {level.code}
                          </div>
                          <Badge variant="secondary" className="md:hidden">
                            #{level.id}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">
                        {level.code}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditLevel(level)}
                            aria-label={`Edit ${level.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLevelToDelete(level)}
                            aria-label={`Delete ${level.name}`}
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
                  Showing {startItem}-{endItem} of {levels.length} levels
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
      <LevelFormDialog
        open={showFormDialog}
        onOpenChange={handleDialogChange}
        level={selectedLevel ?? undefined}
        onSuccess={handleLevelMutationSuccess}
      />
      <AlertDialog
        open={Boolean(levelToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setLevelToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{levelToDelete?.name}"? Content linked to this level will
              remain but will no longer have a level assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLevel}
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
