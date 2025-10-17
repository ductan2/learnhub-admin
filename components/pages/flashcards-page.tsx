"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Layers, Plus, RefreshCw, Search, BookOpen, CreditCard, FileText, Pencil, Trash2, Loader2 } from "lucide-react"

import { api } from "@/lib/api/exports"
import type { GraphqlListResult } from "@/lib/api/modules/content"
import type { Flashcard, FlashcardSet, CreateFlashcardSetDto } from "@/types/flashcard"
import { useToast } from "@/hooks/use-toast"
import { useSearchPagination } from "@/hooks/use-search-pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FlashcardSetFormDialog } from "@/components/flashcards/flashcard-set-form-dialog"
import { FlashcardFormDialog } from "@/components/flashcards/flashcard-form-dialog"
import { FlashcardSetCard } from "@/components/flashcards/flashcard-set-card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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

const ITEMS_PER_PAGE = 9
const CARDS_PAGE_SIZE = 100

const createEmptySetsState = (): GraphqlListResult<FlashcardSet> => ({
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: ITEMS_PER_PAGE,
})

const createEmptyCardsState = (): GraphqlListResult<Flashcard> => ({
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: CARDS_PAGE_SIZE,
})

export function FlashcardsPage() {
  const { toast } = useToast()
  const { searchQuery, currentPage, updateSearchQuery, updatePage } = useSearchPagination()

  const [setsData, setSetsData] = useState<GraphqlListResult<FlashcardSet>>(createEmptySetsState)
  const [isLoadingSets, setIsLoadingSets] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [cardsData, setCardsData] = useState<GraphqlListResult<Flashcard>>(createEmptyCardsState)
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [showAddCardDialog, setShowAddCardDialog] = useState(false)
  const [showEditSetDialog, setShowEditSetDialog] = useState(false)
  const [showEditCardDialog, setShowEditCardDialog] = useState(false)
  const [cardBeingEdited, setCardBeingEdited] = useState<Flashcard | null>(null)
  const [showDeleteSetDialog, setShowDeleteSetDialog] = useState(false)
  const [isDeletingSet, setIsDeletingSet] = useState(false)
  const [cardPendingDeletion, setCardPendingDeletion] = useState<Flashcard | null>(null)
  const [showDeleteCardDialog, setShowDeleteCardDialog] = useState(false)
  const [isDeletingCard, setIsDeletingCard] = useState(false)

  const loadSets = useCallback(
    async (search?: string, page = 1) => {
      setIsLoadingSets(true)
      try {
        const normalizedSearch = search?.trim()
        const response = await api.flashcards.getSets({
          search: normalizedSearch && normalizedSearch.length > 0 ? normalizedSearch : undefined,
          page,
          pageSize: ITEMS_PER_PAGE,
        })
        setSetsData(response)
      } catch (error) {
        console.error("Failed to load flashcard sets", error)
        toast({
          title: "Unable to load flashcard sets",
          description: "We couldn't retrieve your flashcard sets. Please try again shortly.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSets(false)
      }
    },
    [toast],
  )

  const loadCards = useCallback(
    async (setId: string) => {
      setIsLoadingCards(true)
      try {
        const response = await api.flashcards.getCards({ setId, pageSize: CARDS_PAGE_SIZE })
        setCardsData(response)
        setSelectedSet((previous) => {
          if (!previous || previous.id !== setId) {
            return previous
          }

          return { ...previous, cardCount: response.totalCount }
        })
      } finally {
        setIsLoadingCards(false)
      }
    },
    [],
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      void loadSets(searchQuery, currentPage)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [currentPage, loadSets, searchQuery])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(setsData.totalCount / ITEMS_PER_PAGE)),
    [setsData.totalCount],
  )

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages])

  useEffect(() => {
    if (isLoadingSets) return

    if (currentPage > totalPages) {
      updatePage(totalPages)
    }
  }, [currentPage, isLoadingSets, totalPages, updatePage])

  const { startItem, endItem } = useMemo(() => {
    if (setsData.totalCount === 0) {
      return { startItem: 0, endItem: 0 }
    }

    const startIndex = (setsData.page - 1) * setsData.pageSize + 1
    const endIndex = Math.min(setsData.page * setsData.pageSize, setsData.totalCount)

    return { startItem: startIndex, endItem: endIndex }
  }, [setsData.page, setsData.pageSize, setsData.totalCount])

  const handleOpenSet = useCallback(
    (flashcardSet: FlashcardSet) => {
      setShowEditSetDialog(false)
      setShowEditCardDialog(false)
      setShowAddCardDialog(false)
      setCardBeingEdited(null)
      setShowDeleteSetDialog(false)
      setShowDeleteCardDialog(false)
      setCardPendingDeletion(null)
      setIsDeletingCard(false)
      setIsDeletingSet(false)
      setSelectedSet(flashcardSet)
      setIsDetailOpen(true)

      void (async () => {
        try {
          await loadCards(flashcardSet.id)
        } catch (error) {
          console.error("Failed to load flashcards for set", error)
          toast({
            title: "Unable to load flashcards",
            description: "We couldn't load the cards for this set. Please try again.",
            variant: "destructive",
          })
        }
      })()
    },
    [loadCards, toast],
  )

  const handleCreateSet = useCallback(
    async (values: CreateFlashcardSetDto) => {
      try {
        const created = await api.flashcards.createSet(values)
        toast({
          title: "Flashcard set created",
          description: `"${created.title}" is ready to use.`,
        })
        await loadSets(searchQuery, currentPage)
        handleOpenSet(created)
      } catch (error) {
        console.error("Failed to create flashcard set", error)
        throw error
      }
    },
    [currentPage, handleOpenSet, loadSets, searchQuery, toast],
  )

  const handleUpdateSet = useCallback(
    async (values: CreateFlashcardSetDto) => {
      if (!selectedSet) {
        return
      }

      try {
        const updated = await api.flashcards.updateSet(selectedSet.id, {
          title: values.title,
          description: values.description ?? null,
          topicId: values.topicId ?? null,
          levelId: values.levelId ?? null,
        })

        setSetsData((previous) => ({
          ...previous,
          items: previous.items.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  ...updated,
                  topic: updated.topic ?? item.topic,
                  level: updated.level ?? item.level,
                  cardCount: updated.cardCount ?? item.cardCount,
                }
              : item,
          ),
        }))

        setSelectedSet((previous) => {
          if (!previous || previous.id !== updated.id) {
            return previous
          }

          return {
            ...previous,
            ...updated,
            topic: updated.topic ?? previous.topic,
            level: updated.level ?? previous.level,
          }
        })

        toast({
          title: "Flashcard set updated",
          description: `Updates to "${updated.title}" have been saved.`,
        })

        void loadSets(searchQuery, currentPage)
      } catch (error) {
        console.error("Failed to update flashcard set", error)
        throw error
      }
    },
    [currentPage, loadSets, searchQuery, selectedSet, toast],
  )

  const handleDeleteSet = useCallback(async () => {
    if (!selectedSet) {
      return
    }

    const setId = selectedSet.id
    const setTitle = selectedSet.title

    try {
      setIsDeletingSet(true)
      const deleted = await api.flashcards.deleteSet(setId)
      if (!deleted) {
        throw new Error("Delete flashcard set returned false")
      }

      toast({
        title: "Flashcard set deleted",
        description: `"${setTitle}" has been removed.`,
      })

      setShowDeleteSetDialog(false)
      setShowEditSetDialog(false)
      setShowEditCardDialog(false)
      setShowAddCardDialog(false)
      setCardBeingEdited(null)
      setCardPendingDeletion(null)
      setShowDeleteCardDialog(false)
      setSelectedSet(null)
      setCardsData(createEmptyCardsState())
      setIsDetailOpen(false)

      await loadSets(searchQuery, currentPage)
    } catch (error) {
      console.error("Failed to delete flashcard set", error)
      toast({
        title: "Unable to delete flashcard set",
        description: "We couldn't delete this set. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingSet(false)
    }
  }, [currentPage, loadSets, searchQuery, selectedSet, toast])

  const handleAddCard = useCallback(
    async (values: { frontText: string; backText: string; hints?: string[] }) => {
      if (!selectedSet) {
        return
      }

      try {
        await api.flashcards.addCard({
          setId: selectedSet.id,
          frontText: values.frontText,
          backText: values.backText,
          hints: values.hints,
        })
        toast({
          title: "Flashcard added",
          description: "The card has been added to the set.",
        })
      } catch (error) {
        console.error("Failed to add flashcard", error)
        throw error
      }

      try {
        await loadCards(selectedSet.id)
      } catch (error) {
        console.error("Failed to refresh flashcards after adding card", error)
        toast({
          title: "Flashcards not refreshed",
          description: "The new card was saved, but we couldn't refresh the list. Please reopen the set.",
          variant: "destructive",
        })
      }

      void loadSets(searchQuery, currentPage)
    },
    [currentPage, loadCards, loadSets, searchQuery, selectedSet, toast],
  )

  const handleUpdateCard = useCallback(
    async (values: { frontText: string; backText: string; hints?: string[] }) => {
      if (!cardBeingEdited) {
        return
      }

      try {
        const updated = await api.flashcards.updateCard(cardBeingEdited.id, {
          frontText: values.frontText,
          backText: values.backText,
          hints: values.hints ?? [],
        })

        setCardsData((previous) => ({
          ...previous,
          items: previous.items.map((item) => (item.id === updated.id ? updated : item)),
        }))

        toast({
          title: "Flashcard updated",
          description: "Your changes to this flashcard have been saved.",
        })

        void loadSets(searchQuery, currentPage)
      } catch (error) {
        console.error("Failed to update flashcard", error)
        throw error
      }
    },
    [cardBeingEdited, currentPage, loadSets, searchQuery, toast],
  )

  const handleDeleteCard = useCallback(async () => {
    if (!selectedSet || !cardPendingDeletion) {
      return
    }

    try {
      setIsDeletingCard(true)
      const deleted = await api.flashcards.deleteCard(cardPendingDeletion.id)
      if (!deleted) {
        throw new Error("Delete flashcard returned false")
      }

      toast({
        title: "Flashcard deleted",
        description: "The flashcard has been removed from this set.",
      })

      setShowDeleteCardDialog(false)
      setCardPendingDeletion(null)

      await loadCards(selectedSet.id)
      void loadSets(searchQuery, currentPage)
    } catch (error) {
      console.error("Failed to delete flashcard", error)
      toast({
        title: "Unable to delete flashcard",
        description: "We couldn't delete this flashcard. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingCard(false)
    }
  }, [cardPendingDeletion, currentPage, loadCards, loadSets, searchQuery, selectedSet, toast])

  const handleEditCardClick = useCallback((card: Flashcard) => {
    setCardBeingEdited(card)
    setShowEditCardDialog(true)
  }, [])

  const handleEditCardDialogChange = useCallback((open: boolean) => {
    setShowEditCardDialog(open)
    if (!open) {
      setCardBeingEdited(null)
    }
  }, [])

  const handleRequestDeleteCard = useCallback((card: Flashcard) => {
    setCardPendingDeletion(card)
    setShowDeleteCardDialog(true)
  }, [])

  const handleDeleteCardDialogChange = useCallback((open: boolean) => {
    setShowDeleteCardDialog(open)
    if (!open) {
      setCardPendingDeletion(null)
      setIsDeletingCard(false)
    }
  }, [])

  const handleSheetChange = useCallback(
    (open: boolean) => {
      setIsDetailOpen(open)
      if (!open) {
        setShowAddCardDialog(false)
        setShowEditSetDialog(false)
        setShowEditCardDialog(false)
        setCardBeingEdited(null)
        setShowDeleteSetDialog(false)
        setShowDeleteCardDialog(false)
        setCardPendingDeletion(null)
        setIsDeletingCard(false)
        setIsDeletingSet(false)
        setSelectedSet(null)
        setCardsData(createEmptyCardsState())
      } else if (open && selectedSet) {
        void loadCards(selectedSet.id)
      }
    },
    [loadCards, selectedSet],
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Create and organise flashcard sets to support spaced repetition and quick knowledge checks.
          </p>
          <div className="text-xs text-muted-foreground">
            Showing {setsData.totalCount} flashcard set{setsData.totalCount === 1 ? "" : "s"} (
            {startItem}
            {startItem > 0 ? `–${endItem}` : " of 0"})
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <div className="relative flex-1 min-w-[240px] md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search flashcard sets..."
              value={searchQuery}
              onChange={(event) => updateSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => void loadSets(searchQuery, currentPage)}
            disabled={isLoadingSets}
            className="whitespace-nowrap"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoadingSets ? "Refreshing" : "Refresh"}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            New set
          </Button>
        </div>
      </div>

      {isLoadingSets ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4 rounded-lg border border-border/60 p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : setsData.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {setsData.items.map((flashcardSet) => (
            <FlashcardSetCard key={flashcardSet.id} flashcardSet={flashcardSet} onOpen={handleOpenSet} />
          ))}
        </div>
      ) : (
        <Empty className="border border-dashed border-border/70">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>No flashcard sets yet</EmptyTitle>
            <EmptyDescription>
              Create your first flashcard set to begin building spaced-repetition resources for learners.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create flashcard set
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {totalPages > 1 ? (
        <Pagination className="justify-end">
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
              />
            </PaginationItem>
            {pageNumbers.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === currentPage}
                  onClick={(event) => {
                    event.preventDefault()
                    updatePage(pageNumber)
                  }}
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
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <FlashcardSetFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(values) => handleCreateSet(values)}
      />

      <FlashcardSetFormDialog
        open={showEditSetDialog && Boolean(selectedSet)}
        mode="edit"
        initialValues={
          selectedSet
            ? {
                title: selectedSet.title,
                description: selectedSet.description ?? null,
                topicId: selectedSet.topicId ?? null,
                levelId: selectedSet.levelId ?? null,
              }
            : undefined
        }
        onOpenChange={setShowEditSetDialog}
        onSubmit={(values) => handleUpdateSet(values)}
      />

      <FlashcardFormDialog
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
        onSubmit={(values) => handleAddCard(values)}
      />

      <FlashcardFormDialog
        open={showEditCardDialog && Boolean(cardBeingEdited)}
        mode="edit"
        initialValues={
          cardBeingEdited
            ? {
                frontText: cardBeingEdited.frontText,
                backText: cardBeingEdited.backText,
                hints: cardBeingEdited.hints,
              }
            : undefined
        }
        onOpenChange={handleEditCardDialogChange}
        onSubmit={(values) => handleUpdateCard(values)}
      />

      <AlertDialog open={showDeleteSetDialog && Boolean(selectedSet)} onOpenChange={setShowDeleteSetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this flashcard set?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All flashcards in "{selectedSet?.title ?? "this set"}" will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSet}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDeleteSet()} disabled={isDeletingSet}>
              {isDeletingSet ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete set
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteCardDialog && Boolean(cardPendingDeletion)}
        onOpenChange={handleDeleteCardDialogChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this flashcard?</AlertDialogTitle>
            <AlertDialogDescription>
              This card will be removed from "{selectedSet?.title ?? "this set"}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCard}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDeleteCard()} disabled={isDeletingCard}>
              {isDeletingCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isDetailOpen} onOpenChange={handleSheetChange}>
        <SheetContent side="right" className="sm:max-w-2xl">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <SheetTitle className="text-left">{selectedSet?.title ?? "Flashcard set"}</SheetTitle>
                  <SheetDescription className="text-left">
                    {selectedSet?.description
                      ? selectedSet.description
                      : "Review the cards inside this set and add new content."}
                  </SheetDescription>
                </div>
              </div>
              {selectedSet ? (
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowEditSetDialog(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit set
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteSetDialog(true)}
                    disabled={isDeletingSet}
                  >
                    {isDeletingSet ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete set
                  </Button>
                </div>
              ) : null}
            </div>
          </SheetHeader>

          {selectedSet ? (
            <div className="flex h-full flex-col gap-6 px-4 pb-6">
              <div className="space-y-4 rounded-lg border border-border/60 p-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Topic: {selectedSet.topic?.name || "—"}</span>
                  <span className="before:mx-2 before:text-muted-foreground before:content-['•']">
                    Level: {selectedSet.level?.name || "—"}
                  </span>
                  <span className="before:mx-2 before:text-muted-foreground before:content-['•']">
                    Created {new Date(selectedSet.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedSet.tags.length > 0 ? (
                    selectedSet.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="border-dashed">
                        #{tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags associated</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Individual Cards</h3>
                      <p className="text-sm text-muted-foreground">
                        {cardsData.totalCount} card{cardsData.totalCount === 1 ? "" : "s"} in this set.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setShowAddCardDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add card
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex-1 overflow-hidden">
                {isLoadingCards ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-3 rounded-lg border border-border/60 p-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ))}
                  </div>
                ) : cardsData.items.length > 0 ? (
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      {cardsData.items.map((card, index) => (
                        <div key={card.id} className="space-y-4 rounded-lg border border-green-200 bg-green-50/30 p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <FileText className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-medium text-green-800">Card {index + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Order: {card.ord}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditCardClick(card)}
                                aria-label="Edit flashcard"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRequestDeleteCard(card)}
                                aria-label="Delete flashcard"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <p className="text-xs font-semibold uppercase text-blue-600">Front Side</p>
                              </div>
                              <div className="rounded-md border border-blue-200 bg-blue-50/50 p-3">
                                <p className="text-sm whitespace-pre-line">{card.frontText}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                <p className="text-xs font-semibold uppercase text-purple-600">Back Side</p>
                              </div>
                              <div className="rounded-md border border-purple-200 bg-purple-50/50 p-3">
                                <p className="text-sm whitespace-pre-line">{card.backText}</p>
                              </div>
                            </div>
                          </div>

                          {card.hints && card.hints.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                <p className="text-xs font-semibold uppercase text-orange-600">Learning Hints</p>
                              </div>
                              <div className="rounded-md border border-orange-200 bg-orange-50/50 p-3">
                                <ul className="space-y-1 text-sm">
                                  {card.hints.map((hint, hintIndex) => (
                                    <li key={`${card.id}-hint-${hintIndex}`} className="flex items-start gap-2">
                                      <span className="text-orange-500 mt-1">•</span>
                                      <span>{hint}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-green-300 bg-green-50/30 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CreditCard className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-green-800">No flashcards yet</p>
                      <p className="text-sm text-green-600 max-w-xs">
                        Start building your flashcard collection by adding individual cards to this set.
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setShowAddCardDialog(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first card
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
