"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Layers, Plus, RefreshCw, Search } from "lucide-react"

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
      setSelectedSet(flashcardSet)
      setIsDetailOpen(true)
      setShowAddCardDialog(false)

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

  const handleSheetChange = useCallback(
    (open: boolean) => {
      setIsDetailOpen(open)
      if (!open) {
        setShowAddCardDialog(false)
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

      <FlashcardFormDialog
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
        onSubmit={(values) => handleAddCard(values)}
      />

      <Sheet open={isDetailOpen} onOpenChange={handleSheetChange}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedSet?.title ?? "Flashcard set"}</SheetTitle>
            <SheetDescription>
              {selectedSet?.description
                ? selectedSet.description
                : "Review the cards inside this set and add new content."}
            </SheetDescription>
          </SheetHeader>

          {selectedSet ? (
            <div className="flex h-full flex-col gap-6 px-4 pb-6">
              <div className="space-y-4 rounded-lg border border-border/60 p-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Topic: {selectedSet.topicId ? selectedSet.topicId : "—"}</span>
                  <span className="before:mx-2 before:text-muted-foreground before:content-['•']">
                    Level: {selectedSet.levelId ? selectedSet.levelId : "—"}
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
                  <div>
                    <h3 className="text-base font-semibold">Cards</h3>
                    <p className="text-sm text-muted-foreground">
                      {cardsData.totalCount} card{cardsData.totalCount === 1 ? "" : "s"} in this set.
                    </p>
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
                        <div key={card.id} className="space-y-4 rounded-lg border border-border/60 p-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Card {index + 1}</span>
                            <span>Order: {card.ord}</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Front</p>
                            <p className="text-sm whitespace-pre-line">{card.frontText}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Back</p>
                            <p className="text-sm whitespace-pre-line">{card.backText}</p>
                          </div>
                          {card.hints && card.hints.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase text-muted-foreground">Hints</p>
                              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                {card.hints.map((hint, hintIndex) => (
                                  <li key={`${card.id}-hint-${hintIndex}`}>{hint}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 p-6 text-center">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">No cards yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first flashcard to start building this set.
                    </p>
                    <Button size="sm" onClick={() => setShowAddCardDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add card
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
