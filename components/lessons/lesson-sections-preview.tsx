import type { ReactNode } from "react"

import type { Lesson, LessonSection } from "@/types/lesson"
import { asBoolean, asNumber, asString, formatDuration } from "@/utils/format"

interface LessonSectionsPreviewProps {
  lesson: Lesson
  sections: LessonSection[]
}

export function LessonSectionsPreview({ lesson, sections }: LessonSectionsPreviewProps) {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">{lesson.title}</h2>
        {lesson.description && <p className="text-muted-foreground">{lesson.description}</p>}
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          <p>No sections to preview yet</p>
        </div>
      ) : (
        sections.map((section) => {
          const body = (section.body ?? {}) as Record<string, unknown>
          const resolvedTitle = section.title ?? asString(body.title)
          let content: ReactNode = null

          switch (section.type) {
            case "text": {
              const htmlContent = section.content ?? asString(body.content)
              content = (
                <div className="space-y-3">
                  {resolvedTitle && <h3 className="text-xl font-semibold">{resolvedTitle}</h3>}
                  {htmlContent ? (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No content yet</p>
                  )}
                </div>
              )
              break
            }
            case "video": {
              const videoSource =
                asString(section.content) ?? asString(body.videoUrl) ?? asString(body.url) ?? undefined
              const transcript = asString(body.transcript)
              const durationLabel = formatDuration(body.duration)
              const captionsAvailable = asBoolean(body.captions)
              const thumbnail = asString(body.thumbnail)

              content = (
                <div className="space-y-3">
                  {resolvedTitle && <h3 className="text-xl font-semibold">{resolvedTitle}</h3>}
                  {videoSource ? (
                    videoSource.startsWith("<") ? (
                      <div
                        className="aspect-video w-full overflow-hidden rounded-lg border border-border"
                        dangerouslySetInnerHTML={{ __html: videoSource }}
                      />
                    ) : (
                      <video controls className="w-full max-h-[480px] rounded-lg" poster={thumbnail}>
                        <source src={videoSource} />
                      </video>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">Video not available</p>
                  )}
                  {(durationLabel || captionsAvailable || transcript) && (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {durationLabel && <p>Duration: {durationLabel}</p>}
                      {captionsAvailable && <p>Captions available</p>}
                      {transcript && (
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">Transcript</p>
                          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                            {transcript}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
              break
            }
            case "audio": {
              const audioSource =
                asString(section.content) ?? asString(body.audioUrl) ?? asString(body.url) ?? undefined
              const instruction = asString(body.instruction)
              const transcript = asString(body.transcript)
              const durationLabel = formatDuration(body.duration)
              const speedValues = Array.isArray(body.speed)
                ? (body.speed as Array<unknown>)
                  .map((speed) => asString(speed) ?? (typeof speed === "number" ? speed.toString() : undefined))
                  .filter((value): value is string => Boolean(value))
                : []

              content = (
                <div className="space-y-3">
                  {resolvedTitle && <h3 className="text-xl font-semibold">{resolvedTitle}</h3>}
                  {instruction && <p className="text-sm text-muted-foreground">{instruction}</p>}
                  {audioSource ? (
                    <audio controls className="w-full">
                      <source src={audioSource} />
                    </audio>
                  ) : (
                    <p className="text-sm text-muted-foreground">Audio not available</p>
                  )}
                  {(durationLabel || speedValues.length > 0 || transcript) && (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {durationLabel && <p>Duration: {durationLabel}</p>}
                      {speedValues.length > 0 && <p>Playback speeds: {speedValues.join(", ")}</p>}
                      {transcript && (
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">Transcript</p>
                          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                            {transcript}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
              break
            }
            case "image": {
              const imageSource =
                asString(section.content) ?? asString(body.imageUrl) ?? asString(body.url) ?? undefined
              const caption = asString(body.caption)
              const altText = asString(body.altText) ?? resolvedTitle ?? lesson.title ?? "Lesson image"

              content = (
                <div className="space-y-3">
                  {resolvedTitle && <h3 className="text-xl font-semibold">{resolvedTitle}</h3>}
                  {imageSource ? (
                    <div className="w-full overflow-hidden rounded-lg border border-border">
                      <img src={imageSource} alt={altText} className="w-full h-auto" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Image not available</p>
                  )}
                  {caption && <p className="text-sm text-muted-foreground">{caption}</p>}
                </div>
              )
              break
            }
            case "quiz":
            case "exercise": {
              const quizId = section.quiz_id ?? asString(body.quizId)
              const instruction = asString(body.instruction)
              const exerciseType = asString(body.exerciseType)
              const questions = Array.isArray(body.questions) ? (body.questions as Array<Record<string, unknown>>) : []

              content = (
                <div className="space-y-4">
                  {resolvedTitle && <h3 className="text-xl font-semibold">{resolvedTitle}</h3>}
                  {section.type === "quiz" && (
                    <p className="text-sm text-muted-foreground">
                      {quizId ? `Linked quiz ID: ${quizId}` : "Quiz not selected"}
                    </p>
                  )}
                  {exerciseType && <p className="text-sm text-muted-foreground">Exercise type: {exerciseType}</p>}
                  {instruction && <p className="text-sm text-muted-foreground">{instruction}</p>}
                  {questions.length > 0 ? (
                    <div className="space-y-3">
                      {questions.map((question, index) => {
                        const questionId = asString(question.id) ?? `question-${index}`
                        const scenario = asString(question.scenario) ?? `Question ${index + 1}`
                        const options = Array.isArray(question.options) ? (question.options as Array<unknown>) : []
                        const correctAnswer =
                          asString(question.correctAnswer) ??
                          (typeof question.correctAnswer === "number" ? question.correctAnswer.toString() : undefined)
                        const explanation = asString(question.explanation)

                        return (
                          <div key={questionId} className="space-y-2 rounded-md border border-border p-4">
                            <p className="font-medium text-foreground">{scenario}</p>
                            {options.length > 0 && (
                              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                {options.map((option, optionIndex) => (
                                  <li key={`option-${questionId}-${optionIndex}`}>
                                    {asString(option) ?? (typeof option === "number" ? option.toString() : String(option))}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {correctAnswer && (
                              <p className="text-sm text-foreground">
                                <span className="font-medium">Correct answer:</span> {correctAnswer}
                              </p>
                            )}
                            {explanation && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Explanation:</span> {explanation}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No questions configured yet.</p>
                  )}
                </div>
              )
              break
            }
            default: {
              content = <p className="text-sm text-muted-foreground">Unsupported section type: {section.type}</p>
            }
          }

          return (
            <div key={section.id} className="border border-border rounded-lg p-6 space-y-4">
              {content}
            </div>
          )
        })
      )}
    </div>
  )
}
