export const analytics = {
  getDashboardStats: async () => {
    const response = await fetch('/api/analytics/dashboard')
    if (!response.ok) throw new Error('Failed to fetch dashboard stats')
    return response.json()
  },
}
