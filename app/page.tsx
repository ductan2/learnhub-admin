"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { MediaLibraryPage } from "@/components/pages/media-library-page"
import { LessonsPage } from "@/components/pages/lessons-page"
import { QuizzesPage } from "@/components/pages/quizzes-page"
import { UsersPage } from "@/components/pages/users-page"
import { LeaderboardPage } from "@/components/pages/leaderboard-page"
import { CoursesPage } from "@/components/pages/courses-page"
import { NotificationsPage } from "@/components/pages/notifications-page"
import { SubmissionsPage } from "@/components/pages/submissions-page"

function SettingsPage() {
  return (
    <div className="p-6">
      <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
        Settings - Coming soon
      </div>
    </div>
  )
}

const pageConfig = {
  dashboard: { title: "Dashboard", component: DashboardPage },
  courses: { title: "Courses", component: CoursesPage },
  media: { title: "Media Library", component: MediaLibraryPage },
  lessons: { title: "Lessons", component: LessonsPage },
  quizzes: { title: "Quizzes", component: QuizzesPage },
  submissions: { title: "Submissions Review", component: SubmissionsPage },
  users: { title: "Users", component: UsersPage },
  leaderboard: { title: "Leaderboard", component: LeaderboardPage },
  notifications: { title: "Notifications", component: NotificationsPage },
  settings: { title: "Settings", component: SettingsPage },
}

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<keyof typeof pageConfig>("dashboard")

  const PageComponent = pageConfig[currentPage].component
  const pageTitle = pageConfig[currentPage].title

  return (
    <ProtectedRoute>
      <div className="h-screen flex bg-background">
        <Sidebar currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as keyof typeof pageConfig)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={pageTitle} />

          <main className="flex-1 overflow-y-auto">
            <PageComponent />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
