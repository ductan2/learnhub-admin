import { z } from "zod"

export const CreateNotificationTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required").max(100, "Template name must be less than 100 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    type: z.string().min(1, "Template type is required"),
    subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
    body: z.string().min(1, "Body is required").max(10000, "Body must be less than 10000 characters"),
    placeholders: z.array(z.string()).optional().default([]),
})

export const UpdateNotificationTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required").max(100, "Template name must be less than 100 characters").optional(),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters").optional(),
    body: z.string().min(1, "Body is required").max(10000, "Body must be less than 10000 characters").optional(),
    placeholders: z.array(z.string()).optional(),
})

export const CreateNotificationSchema = z.object({
    type: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    data: z.record(z.any()).optional(),
})

export type CreateNotificationTemplateInput = z.infer<typeof CreateNotificationTemplateSchema>
export type UpdateNotificationTemplateInput = z.infer<typeof UpdateNotificationTemplateSchema>
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>
