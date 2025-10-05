"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Shapes, RefreshCw, Search } from "lucide-react"

import { api } from "@/lib/api"
import type { Topic } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()

  const loadTopics = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await api.topics.getAll()
      setTopics(data)
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
    loadTopics()
  }, [loadTopics])

  const filteredTopics = useMemo(() => {
    if (!searchQuery) {
      return topics
    }

    const search = searchQuery.toLowerCase().trim()
    return topics.filter((topic) => {
      return (
        topic.name.toLowerCase().includes(search) ||
        (topic.description?.toLowerCase().includes(search) ?? false)
      )
    })
  }, [topics, searchQuery])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Organise your catalogue into meaningful subject areas to power filtering across the platform.
          </p>
          <div className="text-xs text-muted-foreground">
            Showing {filteredTopics.length} of {topics.length} topics
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
          <Button variant="outline" onClick={loadTopics} disabled={isLoading} className="whitespace-nowrap">
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing" : "Refresh"}
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
      ) : filteredTopics.length === 0 ? (
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
            <Button onClick={loadTopics} variant="secondary" disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload topics
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="border-border/60 transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold">
                    {topic.icon ?? <Shapes className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">{topic.name}</CardTitle>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic.description}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="mt-1">
                  Topic
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>ID</span>
                  <span className="font-mono text-xs text-foreground/80">{topic.id}</span>
                </div>
                {topic.icon && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Icon</span>
                    <span>{topic.icon}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
