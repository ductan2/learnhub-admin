"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { getAdminPageTitle } from "@/lib/admin/navigation"

export function AdminHeader() {
  const pathname = usePathname()
  const title = getAdminPageTitle(pathname)

  return <Header title={title} />
}
