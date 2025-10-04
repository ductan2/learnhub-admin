"use client"

import {
  LayoutDashboard,
  ImageIcon,
  BookOpen,
  HelpCircle,
  Users,
  Trophy,
  Settings,
  GraduationCap,
  Bell,
  FileCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "courses", name: "Courses", icon: GraduationCap },
  { id: "media", name: "Media Library", icon: ImageIcon },
  { id: "lessons", name: "Lessons", icon: BookOpen },
  { id: "quizzes", name: "Quizzes", icon: HelpCircle },
  { id: "submissions", name: "Submissions", icon: FileCheck },
  { id: "users", name: "Users", icon: Users },
  { id: "leaderboard", name: "Leaderboard", icon: Trophy },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "settings", name: "Settings", icon: Settings },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-sidebar-foreground">LMS Admin</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-10">Learning Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.name}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@lms.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
