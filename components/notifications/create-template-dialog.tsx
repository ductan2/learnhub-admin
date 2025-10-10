"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
    Eye,
    Code,
    Plus,
    X,
    FileText,
    Mail,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Palette,
    Image,
    Type,
    Layout,
    Zap,
    Star,
    Heart,
    Gift,
    Bell,
    BookOpen,
    GraduationCap,
    Trophy,
    Target,
    MessageSquare,
    Settings,
    Globe,
    Shield,
    Rocket
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationTemplate } from "@/types/notification"
import { CreateNotificationTemplateSchema, type CreateNotificationTemplateInput } from "@/lib/schemas/notification"
import { z } from "zod"
import { api } from "@/lib/api/exports"

interface CreateTemplateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (template: NotificationTemplate) => void
}

interface TemplateFormData {
    name: string
    description: string
    type: string
    subject: string
    body: string
    placeholders: string[]
}

const defaultPlaceholders = [
    "user_name",
    "user_email",
    "course_name",
    "lesson_title",
    "due_date",
    "platform_name",
    "support_email"
]

const templateTypes = [
    {
        value: "welcome",
        label: "Welcome Email",
        description: "Sent to new users",
        icon: Heart,
        color: "bg-pink-500/10 text-pink-600 border-pink-200",
        gradient: "from-pink-50 to-rose-50"
    },
    {
        value: "course_enrollment",
        label: "Course Enrollment",
        description: "When user enrolls in course",
        icon: BookOpen,
        color: "bg-blue-500/10 text-blue-600 border-blue-200",
        gradient: "from-blue-50 to-indigo-50"
    },
    {
        value: "lesson_reminder",
        label: "Lesson Reminder",
        description: "Remind users about lessons",
        icon: Bell,
        color: "bg-orange-500/10 text-orange-600 border-orange-200",
        gradient: "from-orange-50 to-amber-50"
    },
    {
        value: "quiz_completion",
        label: "Quiz Completion",
        description: "After completing a quiz",
        icon: Trophy,
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        gradient: "from-yellow-50 to-orange-50"
    },
    {
        value: "deadline_reminder",
        label: "Deadline Reminder",
        description: "Upcoming deadlines",
        icon: Target,
        color: "bg-red-500/10 text-red-600 border-red-200",
        gradient: "from-red-50 to-pink-50"
    },
    {
        value: "announcement",
        label: "Announcement",
        description: "General announcements",
        icon: MessageSquare,
        color: "bg-purple-500/10 text-purple-600 border-purple-200",
        gradient: "from-purple-50 to-violet-50"
    },
    {
        value: "system",
        label: "System Notification",
        description: "System-related messages",
        icon: Settings,
        color: "bg-gray-500/10 text-gray-600 border-gray-200",
        gradient: "from-gray-50 to-slate-50"
    },
    {
        value: "achievement",
        label: "Achievement",
        description: "Celebrate user milestones",
        icon: Star,
        color: "bg-amber-500/10 text-amber-600 border-amber-200",
        gradient: "from-amber-50 to-yellow-50"
    },
    {
        value: "promotion",
        label: "Promotion",
        description: "Special offers and deals",
        icon: Gift,
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        gradient: "from-emerald-50 to-green-50"
    },
    {
        value: "graduation",
        label: "Graduation",
        description: "Course completion celebration",
        icon: GraduationCap,
        color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
        gradient: "from-indigo-50 to-blue-50"
    }
]

export function CreateTemplateDialog({ open, onOpenChange, onSuccess }: CreateTemplateDialogProps) {
    const { toast } = useToast()
    const [formData, setFormData] = useState<TemplateFormData>({
        name: "",
        description: "",
        type: "welcome",
        subject: "",
        body: "",
        placeholders: []
    })
    const [customPlaceholder, setCustomPlaceholder] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            type: "welcome",
            subject: "",
            body: "",
            placeholders: []
        })
        setCustomPlaceholder("")
        setErrors({})
    }

    const handleClose = () => {
        resetForm()
        onOpenChange(false)
    }

    const validateForm = (): boolean => {
        try {
            const validatedData = CreateNotificationTemplateSchema.parse({
                name: formData.name,
                description: formData.description,
                type: formData.type,
                subject: formData.subject,
                body: formData.body,
                placeholders: formData.placeholders,
            })
            setErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {}
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message
                    }
                })
                setErrors(newErrors)
            }
            return false
        }
    }

    const handleCreate = async () => {
        if (!validateForm()) {
            return
        }

        setIsCreating(true)
        try {
            const newTemplate = await api.notifications.createTemplate({
                name: formData.name,
                description: formData.description,
                subject: formData.subject,
                body: formData.body,
                placeholders: formData.placeholders,
            })

            toast({
                title: "Success",
                description: "Template created successfully",
            })

            onSuccess(newTemplate)
            handleClose()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create template",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
        }
    }

    const addPlaceholder = (placeholder: string) => {
        if (placeholder && !formData.placeholders.includes(placeholder)) {
            setFormData(prev => ({
                ...prev,
                placeholders: [...prev.placeholders, placeholder]
            }))
        }
    }

    const removePlaceholder = (placeholder: string) => {
        setFormData(prev => ({
            ...prev,
            placeholders: prev.placeholders.filter(p => p !== placeholder)
        }))
    }

    const insertPlaceholder = (placeholder: string) => {
        const placeholderText = `{{${placeholder}}}`
        setFormData(prev => ({
            ...prev,
            body: prev.body + placeholderText
        }))
    }

    const renderPreview = () => {
        let previewBody = formData.body
        let previewSubject = formData.subject

        // Replace placeholders with sample data
        const sampleData: Record<string, string> = {
            user_name: "John Doe",
            user_email: "john.doe@example.com",
            course_name: "Introduction to React",
            lesson_title: "Components and Props",
            due_date: "2024-12-31",
            platform_name: "LearnHub",
            support_email: "support@learnhub.com"
        }

        formData.placeholders.forEach(placeholder => {
            const placeholderRegex = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g')
            const sampleValue = sampleData[placeholder] || `[${placeholder}]`
            previewBody = previewBody.replace(placeholderRegex, sampleValue)
            previewSubject = previewSubject.replace(placeholderRegex, sampleValue)
        })

        return { subject: previewSubject, body: previewBody }
    }

    const preview = renderPreview()
    const selectedTemplateType = templateTypes.find(type => type.value === formData.type)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-6xl !max-w-6xl max-h-[90vh] overflow-hidden" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Create Notification Template
                            </h2>
                            <p className="text-sm text-muted-foreground font-normal">
                                Design beautiful email templates with live preview
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
                    {/* Left Side - Code Editor */}
                    <div className="space-y-4 overflow-y-auto">
                        <div className="space-y-4">
                            {/* Template Name Section with Enhanced Styling */}
                            <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-200/50">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 rounded-md">
                                            <Type className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <Label htmlFor="name" className="text-sm font-semibold text-blue-900">
                                            Template Name *
                                        </Label>
                                    </div>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Welcome Email"
                                        className={cn(
                                            "border-blue-200 focus:border-blue-400 focus:ring-blue-200",
                                            errors.name && "border-red-500 focus:border-red-500 focus:ring-red-200"
                                        )}
                                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {/* Template Type Selection with Visual Cards */}
                            <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/50">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-100 rounded-md">
                                            <Layout className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <Label className="text-sm font-semibold text-purple-900">
                                            Template Type
                                        </Label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                        {templateTypes.map((type) => {
                                            const IconComponent = type.icon
                                            const isSelected = formData.type === type.value

                                            return (
                                                <div
                                                    key={type.value}
                                                    className={cn(
                                                        "p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105",
                                                        isSelected
                                                            ? `${type.color} border-current shadow-md`
                                                            : "bg-white border-gray-200 hover:border-gray-300"
                                                    )}
                                                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <IconComponent className={cn("h-4 w-4", isSelected ? "text-current" : "text-gray-500")} />
                                                        <span className={cn("text-xs font-medium", isSelected ? "text-current" : "text-gray-700")}>
                                                            {type.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-tight">
                                                        {type.description}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </Card>

                            {/* Description Section */}
                            <Card className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200/50">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-green-100 rounded-md">
                                            <FileText className="h-4 w-4 text-green-600" />
                                        </div>
                                        <Label htmlFor="description" className="text-sm font-semibold text-green-900">
                                            Description
                                        </Label>
                                    </div>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of when this template is used"
                                        className="border-green-200 focus:border-green-400 focus:ring-green-200"
                                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                    />
                                </div>
                            </Card>

                            {/* Subject Section */}
                            <Card className="p-4 bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-orange-200/50">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-orange-100 rounded-md">
                                            <Mail className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <Label htmlFor="subject" className="text-sm font-semibold text-orange-900">
                                            Email Subject *
                                        </Label>
                                    </div>
                                    <Input
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                        placeholder="Email subject line"
                                        className={cn(
                                            "border-orange-200 focus:border-orange-400 focus:ring-orange-200",
                                            errors.subject && "border-red-500 focus:border-red-500 focus:ring-red-200"
                                        )}
                                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                    />
                                    {errors.subject && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.subject}
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {/* Email Body Section */}
                            <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border-indigo-200/50">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-100 rounded-md">
                                            <Code className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <Label htmlFor="body" className="text-sm font-semibold text-indigo-900">
                                            Email Body *
                                        </Label>
                                    </div>
                                    <Textarea
                                        id="body"
                                        value={formData.body}
                                        onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                                        placeholder="Enter your email content here..."
                                        rows={8}
                                        className={cn(
                                            "border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200 font-mono text-sm resize-none overflow-x-auto",
                                            errors.body && "border-red-500 focus:border-red-500 focus:ring-red-200"
                                        )}
                                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                    />
                                    {errors.body && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.body}
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {/* Placeholders Section */}
                            <Card className="p-4 pb-10 bg-gradient-to-br from-violet-50/50 to-purple-50/50 border-violet-200/50">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-violet-100 rounded-md">
                                            <Zap className="h-4 w-4 text-violet-600" />
                                        </div>
                                        <Label className="text-sm font-semibold text-violet-900">
                                            Dynamic Placeholders
                                        </Label>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {defaultPlaceholders.map((placeholder) => (
                                                <Badge
                                                    key={placeholder}
                                                    variant={formData.placeholders.includes(placeholder) ? "default" : "outline"}
                                                    className={cn(
                                                        "cursor-pointer transition-all duration-200 hover:scale-105",
                                                        formData.placeholders.includes(placeholder)
                                                            ? "bg-violet-500 text-white hover:bg-violet-600"
                                                            : "hover:bg-violet-50 hover:border-violet-300"
                                                    )}
                                                    onClick={() => {
                                                        if (formData.placeholders.includes(placeholder)) {
                                                            removePlaceholder(placeholder)
                                                        } else {
                                                            addPlaceholder(placeholder)
                                                        }
                                                    }}
                                                >
                                                    {placeholder}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                value={customPlaceholder}
                                                onChange={(e) => setCustomPlaceholder(e.target.value)}
                                                placeholder="Add custom placeholder"
                                                className="flex-1 border-violet-200 focus:border-violet-400 focus:ring-violet-200"
                                                style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-violet-200 hover:bg-violet-50"
                                                onClick={() => {
                                                    if (customPlaceholder.trim()) {
                                                        addPlaceholder(customPlaceholder.trim())
                                                        setCustomPlaceholder("")
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {formData.placeholders.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-violet-800">Selected Placeholders</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.placeholders.map((placeholder) => (
                                                    <Badge key={placeholder} variant="secondary" className="flex items-center gap-1 bg-violet-100 text-violet-800 border-violet-200">
                                                        <span className="font-mono text-xs">{`{{${placeholder}}}`}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-0 ml-1 hover:bg-violet-200"
                                                            onClick={() => {
                                                                insertPlaceholder(placeholder)
                                                            }}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-0 hover:bg-violet-200"
                                                            onClick={() => removePlaceholder(placeholder)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Right Side - Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                <Eye className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Live Preview
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    See how your template will look to users
                                </p>
                            </div>
                        </div>

                        <Card className="p-6 space-y-6 bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-200 shadow-lg">
                            {/* Email Header */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                    <Mail className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Email Preview</h4>
                                    <p className="text-xs text-gray-500">Template: {formData.name || "Untitled"}</p>
                                </div>
                            </div>

                            {/* Template Type Preview */}
                            {selectedTemplateType && (
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedTemplateType.color}`}>
                                            <selectedTemplateType.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-gray-900">{selectedTemplateType.label}</h5>
                                            <p className="text-sm text-gray-600">{selectedTemplateType.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subject Preview */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-orange-100 rounded-md">
                                        <Mail className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-orange-900">Subject Line</span>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                                    <p className="font-semibold text-gray-900 break-words overflow-wrap-anywhere">{preview.subject || "No subject"}</p>
                                </div>
                            </div>

                            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                            {/* Body Preview */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-100 rounded-md">
                                        <FileText className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-900">Email Content</span>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 min-h-[200px] max-h-[400px] overflow-y-auto overflow-x-hidden">
                                    <div className="prose prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap text-sm font-sans text-gray-800 leading-relaxed break-words overflow-wrap-anywhere hyphens-auto">
                                            {preview.body || "No content"}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {formData.placeholders.length > 0 && (
                                <>
                                    <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-violet-100 rounded-md">
                                                <User className="h-4 w-4 text-violet-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-violet-900">Sample Data Used</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {formData.placeholders.map((placeholder) => (
                                                <div key={placeholder} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-200">
                                                    <span className="font-mono text-sm bg-violet-100 px-2 py-1 rounded text-violet-800">
                                                        {`{{${placeholder}}}`}
                                                    </span>
                                                    <span className="text-sm text-gray-700 font-medium">
                                                        {placeholder === "user_name" && "John Doe"}
                                                        {placeholder === "user_email" && "john.doe@example.com"}
                                                        {placeholder === "course_name" && "Introduction to React"}
                                                        {placeholder === "lesson_title" && "Components and Props"}
                                                        {placeholder === "due_date" && "2024-12-31"}
                                                        {placeholder === "platform_name" && "LearnHub"}
                                                        {placeholder === "support_email" && "support@learnhub.com"}
                                                        {!["user_name", "user_email", "course_name", "lesson_title", "due_date", "platform_name", "support_email"].includes(placeholder) && `[${placeholder}]`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isCreating}
                        className="px-6 py-2 border-gray-300 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {isCreating ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Create Template
                            </div>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
