"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ListOrdered, RefreshCw, Search } from "lucide-react"

import { api } from "@/lib/api"
import type { Level } from "@/lib/types"
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

export function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()

  const loadLevels = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.levels.getAll()
      const sorted = [...data].sort((a, b) => a.order - b.order)
      setLevels(sorted)
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
    loadLevels()
  }, [loadLevels])

  const filteredLevels = useMemo(() => {
    if (!searchQuery) {
      return levels
    }

    const search = searchQuery.toLowerCase().trim()
    return levels.filter((level) => level.name.toLowerCase().includes(search))
  }, [levels, searchQuery])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Define learner progression and difficulty for courses, lessons and quizzes.
          </p>
          <div className="text-xs text-muted-foreground">
            Showing {filteredLevels.length} of {levels.length} levels
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[240px] md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search levels..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={loadLevels} disabled={isLoading} className="whitespace-nowrap">
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing" : "Refresh"}
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
          ) : filteredLevels.length === 0 ? (
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
                  <Button onClick={loadLevels} variant="secondary" disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload levels
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Identifier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLevels.map((level) => (
                  <TableRow key={level.id} className="hover:bg-accent/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {level.order}
                        </div>
                        <Badge variant="secondary" className="md:hidden">
                          #{level.order}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">
                      {level.id}
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
