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
  Shapes,
  ListOrdered,
  Tags,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface AdminNavItem {
  id: string
  name: string
  href: string
  icon: LucideIcon
}

export const adminNavigation: AdminNavItem[] = [
  { id: "dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "courses", name: "Courses", href: "/courses", icon: GraduationCap },
  { id: "media", name: "Media Library", href: "/media", icon: ImageIcon },
  { id: "lessons", name: "Lessons", href: "/lessons", icon: BookOpen },
  { id: "topics", name: "Topics", href: "/topics", icon: Shapes },
  { id: "levels", name: "Levels", href: "/levels", icon: ListOrdered },
  { id: "tags", name: "Tags", href: "/tags", icon: Tags },
  { id: "quizzes", name: "Quizzes", href: "/quizzes", icon: HelpCircle },
  { id: "submissions", name: "Submissions", href: "/submissions", icon: FileCheck },
  { id: "users", name: "Users", href: "/users", icon: Users },
  { id: "leaderboard", name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { id: "notifications", name: "Notifications", href: "/notifications", icon: Bell },
  { id: "settings", name: "Settings", href: "/settings", icon: Settings },
]

export function getAdminPageTitle(pathname: string | null): string {
  if (!pathname) {
    return "Dashboard"
  }

  const match = adminNavigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))

  return match ? match.name : "Dashboard"
}
