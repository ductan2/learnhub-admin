"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Hash, RefreshCw, Search, Tag as TagIcon } from "lucide-react"

import { api } from "@/lib/api"
import type { Tag } from "@/lib/types"
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

export function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()

  const loadTags = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.tags.getAll()
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
      setTags(sorted)
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
  }, [toast])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  const filteredTags = useMemo(() => {
    if (!searchQuery) {
      return tags
    }

    const search = searchQuery.toLowerCase().trim()
    return tags.filter((tag) => {
      return (
        tag.name.toLowerCase().includes(search) || tag.slug.toLowerCase().includes(search) ||
        (tag.description?.toLowerCase().includes(search) ?? false)
      )
    })
  }, [tags, searchQuery])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Use tags to add flexible metadata to courses, lessons and quizzes for discovery and automation.
          </p>
          <div className="text-xs text-muted-foreground">
            Showing {filteredTags.length} of {tags.length} tags
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[240px] md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={loadTags} disabled={isLoading} className="whitespace-nowrap">
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing" : "Refresh"}
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
                <CardTitle className="text-base font-semibold">Total tags</CardTitle>
                <p className="text-sm text-muted-foreground">Available to assign across your content.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{tags.length}</p>
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
            <p className="text-3xl font-semibold">{new Set(tags.map((tag) => tag.slug)).size}</p>
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
            <p className="text-3xl font-semibold">{filteredTags.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">Tag directory</CardTitle>
          <Badge variant="outline">{filteredTags.length} visible</Badge>
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
          ) : filteredTags.length === 0 ? (
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
                  <Button onClick={loadTags} variant="secondary" disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload tags
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[200px]">Slug</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id} className="hover:bg-accent/40">
                    <TableCell className="font-medium flex items-center gap-2">
                      <Badge variant="secondary" className="h-6 w-6 shrink-0 items-center justify-center rounded-full p-0">
                        <TagIcon className="h-3 w-3" />
                      </Badge>
                      {tag.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{tag.slug}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tag.description ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
