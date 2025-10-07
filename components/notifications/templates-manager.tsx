"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { NotificationTemplate } from "@/types/notification"
import { Clock, PencilLine } from "lucide-react"

interface NotificationTemplatesManagerProps {
  templates: NotificationTemplate[]
  onSaveTemplate: (id: string, updates: Partial<NotificationTemplate>) => Promise<void> | void
}

type TemplateFormState = {
  subject: string
  body: string
}

export function NotificationTemplatesManager({ templates, onSaveTemplate }: NotificationTemplatesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<TemplateFormState>({ subject: "", body: "" })

  const startEditing = (template: NotificationTemplate) => {
    setEditingId(template.id)
    setFormState({ subject: template.subject, body: template.body })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setSavingId(null)
    setFormState({ subject: "", body: "" })
  }

  const handleSave = async (template: NotificationTemplate) => {
    setSavingId(template.id)
    try {
      await onSaveTemplate(template.id, {
        subject: formState.subject.trim(),
        body: formState.body,
      })
      setEditingId(null)
    } finally {
      setSavingId(null)
    }
  }

  if (templates.length === 0) {
    return (
      <Card className="p-6">
        <div className="space-y-2 text-center">
          <PencilLine className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No email templates configured</h3>
          <p className="text-sm text-muted-foreground">
            Create notification templates in your backend to manage email content from here.
          </p>
        </div>
      </Card>
    )
  }

  return (
      <div className="space-y-4">
        {templates.map((template) => {
          const isEditing = editingId === template.id

          return (
            <div key={template.id} className="rounded-lg border p-5 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    {isEditing && (
                      <Badge variant="outline" className="uppercase">Editing</Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(template.updated_at).toLocaleString()}</span>
                </div>
              </div>

              {template.placeholders && template.placeholders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Placeholders</p>
                  <div className="flex flex-wrap gap-2">
                    {template.placeholders.map((placeholder) => (
                      <Badge key={placeholder} variant="secondary">
                        {`{{${placeholder}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`subject-${template.id}`}>Subject</Label>
                    <Input
                      id={`subject-${template.id}`}
                      value={formState.subject}
                      onChange={(event) => setFormState((prev) => ({ ...prev, subject: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`body-${template.id}`}>Email body</Label>
                    <Textarea
                      id={`body-${template.id}`}
                      rows={6}
                      value={formState.body}
                      onChange={(event) => setFormState((prev) => ({ ...prev, body: event.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use the placeholders above to personalize the message content for each recipient.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={cancelEditing} disabled={savingId === template.id}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSave(template)}
                      disabled={savingId === template.id || formState.subject.trim().length === 0}
                    >
                      {savingId === template.id ? "Saving..." : "Save template"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Subject</p>
                    <p className="text-sm">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Body</p>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-left">
                      {template.body}
                    </pre>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => startEditing(template)}>
                      <PencilLine className="mr-2 h-4 w-4" /> Edit template
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
  )
}
