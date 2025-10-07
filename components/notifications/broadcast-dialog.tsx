"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api/exports"
import { useToast } from "@/hooks/use-toast"
import type { CreateNotificationDto, NotificationTemplate } from "@/types/notification"
import type { User } from "@/types/user"

interface BroadcastDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: User[]
  onSuccess: () => void
  templates: NotificationTemplate[]
}

export function BroadcastDialog({ open, onOpenChange, users, onSuccess, templates }: BroadcastDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [broadcastType, setBroadcastType] = useState<"all" | "tenant" | "users">("all")
  const [selectedTenant, setSelectedTenant] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [sendEmail, setSendEmail] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [formData, setFormData] = useState<Partial<CreateNotificationDto>>({
    title: "",
    body: "",
    type: "announcement",
    priority: "normal",
  })

  const lastSyncedTemplate = useRef<NotificationTemplate | null>(null)

  const tenants = Array.from(new Set(users.map((u) => u.tenant)))
  const canSendEmail = templates.length > 0

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId, templates],
  )

  useEffect(() => {
    if (!canSendEmail && sendEmail) {
      setSendEmail(false)
    }
  }, [canSendEmail, sendEmail])

  useEffect(() => {
    if (sendEmail && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [sendEmail, templates, selectedTemplateId])

  useEffect(() => {
    if (!selectedTemplateId) {
      lastSyncedTemplate.current = null
      return
    }

    const template = templates.find((t) => t.id === selectedTemplateId)
    if (!template) {
      lastSyncedTemplate.current = null
      return
    }

    if (!lastSyncedTemplate.current || lastSyncedTemplate.current.updated_at !== template.updated_at) {
      setFormData((prev) => ({
        ...prev,
        title: template.subject,
        body: template.body,
      }))
      lastSyncedTemplate.current = template
    }
  }, [selectedTemplateId, templates])

  useEffect(() => {
    if (!open) {
      setSendEmail(false)
      setSelectedTemplateId("")
      lastSyncedTemplate.current = null
      setBroadcastType("all")
      setSelectedTenant("")
      setSelectedUserIds([])
      setFormData({ title: "", body: "", type: "announcement", priority: "normal" })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (sendEmail && !selectedTemplateId) {
      toast({
        title: "Template required",
        description: "Please select an email template before sending.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const data: CreateNotificationDto = {
        ...formData,
        title: formData.title!,
        type: formData.type!,
        priority: formData.priority || "normal",
        template_id: sendEmail ? selectedTemplateId || undefined : undefined,
        send_email: sendEmail,
      }

      if (broadcastType === "all") {
        data.user_ids = users.map((u) => u.id)
      } else if (broadcastType === "tenant") {
        data.tenant = selectedTenant
      } else {
        data.user_ids = selectedUserIds
      }

      await api.notifications.create(data)

      toast({
        title: "Broadcast sent",
        description: `Notification sent to ${
          broadcastType === "all"
            ? "all users"
            : broadcastType === "tenant"
              ? `tenant: ${selectedTenant}`
              : `${selectedUserIds.length} users`
        }${sendEmail && selectedTemplate ? ` using ${selectedTemplate.name} template` : ""}`,
      })

      onSuccess()
      onOpenChange(false)
      setFormData({ title: "", body: "", type: "announcement", priority: "normal" })
      setSelectedUserIds([])
      setSendEmail(false)
      setSelectedTemplateId("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send broadcast notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Broadcast Notification</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Broadcast To</Label>
            <RadioGroup value={broadcastType} onValueChange={(v) => setBroadcastType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All Users
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tenant" id="tenant" />
                <Label htmlFor="tenant" className="font-normal cursor-pointer">
                  By Tenant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="users" id="users" />
                <Label htmlFor="users" className="font-normal cursor-pointer">
                  Specific Users
                </Label>
              </div>
            </RadioGroup>
          </div>

          {broadcastType === "tenant" && (
            <div className="space-y-2">
              <Label>Select Tenant</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant} value={tenant}>
                      {tenant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {broadcastType === "users" && (
            <div className="space-y-2">
              <Label>Select Users ({selectedUserIds.length} selected)</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds([...selectedUserIds, user.id])
                        } else {
                          setSelectedUserIds(selectedUserIds.filter((id) => id !== user.id))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {user.full_name} ({user.email})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Send Email</Label>
                <p className="text-sm text-muted-foreground">
                  {canSendEmail
                    ? "Deliver this notification with an email template."
                    : "Add email templates to enable email delivery."}
                </p>
              </div>
              <Switch checked={sendEmail && canSendEmail} onCheckedChange={setSendEmail} disabled={!canSendEmail} />
            </div>

            {sendEmail && canSendEmail && (
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      Last updated {new Date(selectedTemplate.updated_at).toLocaleString()}
                    </p>
                    {selectedTemplate.placeholders && selectedTemplate.placeholders.length > 0 && (
                      <div>
                        <p className="font-medium">Available placeholders</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedTemplate.placeholders.map((placeholder) => (
                            <Badge key={placeholder} variant="secondary">
                              {`{{${placeholder}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!selectedTemplate) {
                          return
                        }
                        setFormData((prev) => ({
                          ...prev,
                          title: selectedTemplate.subject,
                          body: selectedTemplate.body,
                        }))
                        lastSyncedTemplate.current = selectedTemplate
                      }}
                    >
                      Reset to template content
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notification title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Notification message"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as any })}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at">Expires At (Optional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at?.slice(0, 16) || ""}
              onChange={(e) =>
                setFormData({ ...formData, expires_at: e.target.value ? `${e.target.value}:00Z` : undefined })
              }
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Broadcast"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
