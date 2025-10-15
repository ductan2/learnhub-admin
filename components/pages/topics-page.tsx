"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, RefreshCw, Search, Shapes, Trash2 } from "lucide-react"
import { api } from "@/lib/api/exports"
import type { Topic } from "@/types/common"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { TopicFormDialog } from "@/components/topics/topic-form-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { toast } = useToast()

  const loadTopics = useCallback(async (search?: string) => {
    setIsLoading(true)

    try {
      const data = await api.topics.getAll(search)
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
      setTopics(sorted)
    } catch (error) {
      console.error("Failed to load topics", error)
      toast({
        title: "Unable to load topics",
        description: "We couldn't reach the content service. Showing cached data if available.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const handler = setTimeout(() => {
      loadTopics(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [loadTopics, searchQuery])

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedTopic(null)
    }
    setShowFormDialog(open)
  }

  const handleCreateTopic = () => {
    setSelectedTopic(null)
    setShowFormDialog(true)
  }

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic)
    setShowFormDialog(true)
  }

  const handleTopicMutationSuccess = (mutatedTopic: Topic) => {
    setTopics((previous) => {
      const exists = previous.some((item) => item.id === mutatedTopic.id)
      const updated = exists
        ? previous.map((item) => (item.id === mutatedTopic.id ? mutatedTopic : item))
        : [...previous, mutatedTopic]
      return updated.sort((a, b) => a.name.localeCompare(b.name))
    })
  }

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return

    const targetTopic = topicToDelete
    try {
      setIsProcessing(true)
      await api.topics.delete(targetTopic.id)
      toast({
        title: "Topic deleted",
        description: `\"${targetTopic.name}\" has been removed from your catalogue.`,
      })
      setTopics((previous) => previous.filter((item) => item.id !== targetTopic.id))
    } catch (error) {
      console.error("Failed to delete topic", error)
      toast({
        title: "Unable to delete topic",
        description: "An error occurred while deleting the topic. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setTopicToDelete(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Organise your catalogue into meaningful subject areas to power filtering across the platform.
          </p>
          <div className="text-xs text-muted-foreground">
            Showing {topics.length} topics
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[240px] md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => loadTopics(searchQuery)}
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing" : "Refresh"}
          </Button>
          <Button onClick={handleCreateTopic} className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            New topic
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="border-border/60">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <Empty className="border border-dashed border-border/60">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Shapes className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>No topics found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search query or refresh to fetch the latest topics from your content service.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => loadTopics(searchQuery)} variant="secondary" disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload topics
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.id} className="border-border/60 transition-shadow hover:shadow-lg">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold">
                      <Shapes className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{topic.name}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1">
                      Topic
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTopic(topic)}
                        aria-label={`Edit ${topic.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTopicToDelete(topic)}
                        aria-label={`Delete ${topic.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>ID</span>
                  <span className="font-mono text-xs text-foreground/80">{topic.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Slug</span>
                  <span className="font-mono text-xs text-foreground/80">{topic.slug}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <TopicFormDialog
        open={showFormDialog}
        onOpenChange={handleDialogChange}
        topic={selectedTopic ?? undefined}
        onSuccess={handleTopicMutationSuccess}
      />
      <AlertDialog
        open={Boolean(topicToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setTopicToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete topic</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting "{topicToDelete?.name}" will remove it from filters and associations. Existing content will
              remain but lose this categorisation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopic}
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
