import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FlashcardSet } from "@/types/flashcard"

interface FlashcardSetCardProps {
  flashcardSet: FlashcardSet
  onOpen: (flashcardSet: FlashcardSet) => void
}

export function FlashcardSetCard({ flashcardSet, onOpen }: FlashcardSetCardProps) {
  const createdAt = new Date(flashcardSet.createdAt)

  return (
    <Card className="border-border/60 transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="line-clamp-2 leading-tight">{flashcardSet.title}</CardTitle>
            {flashcardSet.description ? (
              <CardDescription className="line-clamp-2">{flashcardSet.description}</CardDescription>
            ) : null}
          </div>
          <Badge variant="secondary" className="whitespace-nowrap">
            {flashcardSet.cardCount} card{flashcardSet.cardCount === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Topic: {flashcardSet.topic?.name || "—"}</span>
          <span className="before:mx-1 before:content-['•']">Level: {flashcardSet.level?.name || "—"}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {flashcardSet.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {flashcardSet.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="border-dashed">
                #{tag.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tags assigned</p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created {createdAt.toLocaleDateString()}</span>
          <Button variant="outline" size="sm" onClick={() => onOpen(flashcardSet)}>
            View set
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
