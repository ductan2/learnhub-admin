import type {
  Notification,
  NotificationFilters,
  NotificationStats,
  CreateNotificationDto,
  NotificationTemplate,
} from '@/types/notification'
import { delay } from '@/lib/api/utils'
import { mockNotifications, mockUsers, mockNotificationTemplates } from '@/lib/mock-data'

export const notifications = {
  getAll: async (filters?: NotificationFilters): Promise<Notification[]> => {
    await delay()
    let notifications = [...mockNotifications]

    if (filters?.user_id) {
      notifications = notifications.filter((n) => n.user_id === filters.user_id)
    }
    if (filters?.type) {
      notifications = notifications.filter((n) => n.type === filters.type)
    }
    if (filters?.priority) {
      notifications = notifications.filter((n) => n.priority === filters.priority)
    }
    if (filters?.is_read !== undefined) {
      notifications = notifications.filter((n) => n.is_read === filters.is_read)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      notifications = notifications.filter((n) => n.title.toLowerCase().includes(search) || n.body?.toLowerCase().includes(search))
    }
    if (filters?.date_from) {
      notifications = notifications.filter((n) => n.created_at >= filters.date_from!)
    }
    if (filters?.date_to) {
      notifications = notifications.filter((n) => n.created_at <= filters.date_to!)
    }

    return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getStats: async (): Promise<NotificationStats> => {
    await delay()
    const total = mockNotifications.length
    const read = mockNotifications.filter((n) => n.is_read).length
    const unread = total - read

    const by_type: Record<string, number> = {}
    const by_priority: Record<string, number> = {}

    mockNotifications.forEach((n) => {
      by_type[n.type] = (by_type[n.type] || 0) + 1
      by_priority[n.priority] = (by_priority[n.priority] || 0) + 1
    })

    return {
      total,
      read,
      unread,
      by_type,
      by_priority,
      read_rate: total > 0 ? (read / total) * 100 : 0,
    }
  },

  create: async (data: CreateNotificationDto): Promise<Notification | Notification[]> => {
    await delay()

    const template = data.template_id ? mockNotificationTemplates.find((t) => t.id === data.template_id) : undefined

    const resolveNotification = (userId: string): Notification => {
      const notification: Notification = {
        id: String(mockNotifications.length + Math.random()),
        user_id: userId,
        title: data.title || template?.subject || 'Notification',
        body: data.body ?? template?.body,
        type: data.type,
        data: data.data || {},
        is_read: false,
        created_at: new Date().toISOString(),
        expires_at: data.expires_at,
        priority: data.priority || 'normal',
        template_id: data.template_id,
      }
      mockNotifications.push(notification)
      return notification
    }

    if (data.user_ids && data.user_ids.length > 0) {
      return data.user_ids.map((userId) => resolveNotification(userId))
    }

    if (data.tenant) {
      const tenantUsers = mockUsers.filter((u) => u.tenant === data.tenant)
      return tenantUsers.map((user) => resolveNotification(user.id))
    }

    const notification: Notification = {
      id: String(mockNotifications.length + 1),
      user_id: data.user_id || '',
      title: data.title || template?.subject || 'Notification',
      body: data.body ?? template?.body,
      type: data.type,
      data: data.data || {},
      is_read: false,
      created_at: new Date().toISOString(),
      expires_at: data.expires_at,
      priority: data.priority || 'normal',
      template_id: data.template_id,
    }
    mockNotifications.push(notification)
    return notification
  },

  markAsRead: async (id: string): Promise<void> => {
    await delay()
    const notification = mockNotifications.find((n) => n.id === id)
    if (notification) {
      notification.is_read = true
      notification.read_at = new Date().toISOString()
    }
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockNotifications.findIndex((n) => n.id === id)
    if (index !== -1) {
      mockNotifications.splice(index, 1)
    }
  },

  deleteExpired: async (): Promise<number> => {
    await delay()
    const now = new Date().toISOString()
    const expiredCount = mockNotifications.filter((n) => n.expires_at && n.expires_at < now).length
    mockNotifications.splice(0, mockNotifications.length, ...mockNotifications.filter((n) => !n.expires_at || n.expires_at >= now))
    return expiredCount
  },

  getTemplates: async (): Promise<NotificationTemplate[]> => {
    await delay()
    return mockNotificationTemplates.map((template) => ({ ...template }))
  },

  updateTemplate: async (id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
    await delay()
    const template = mockNotificationTemplates.find((t) => t.id === id)
    if (!template) {
      throw new Error('Template not found')
    }

    if (updates.subject !== undefined) {
      template.subject = updates.subject
    }
    if (updates.body !== undefined) {
      template.body = updates.body
    }
    if (updates.description !== undefined) {
      template.description = updates.description
    }
    if (updates.placeholders) {
      template.placeholders = updates.placeholders
    }

    template.updated_at = new Date().toISOString()
    return { ...template }
  },
}
