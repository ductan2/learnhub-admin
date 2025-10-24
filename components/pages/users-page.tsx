"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserList } from "@/components/users/user-list"
import { UserListSkeleton } from "@/components/users/user-list-skeleton"
import { api } from "@/lib/api/exports"
import type { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verifiedFilter, setVerifiedFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, statusFilter, verifiedFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await api.users.getAll()
      setUsers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.profile.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter)
    }

    if (verifiedFilter === "verified") {
      filtered = filtered.filter((u) => u.email_verified)
    } else if (verifiedFilter === "unverified") {
      filtered = filtered.filter((u) => !u.email_verified)
    }

    setFilteredUsers(filtered)
  }

  const handleViewUser = (user: User) => {
    router.push(`/users/${user.id}`)
  }

  const handleUpdateStatus = async (userId: string, status: User["status"]) => {
    try {
      await api.users.updateStatus(userId, status)
      toast({
        title: "Success",
        description: `User status updated to ${status}`,
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <UserListSkeleton />
      </div>
    )
  }

  return (
    <div className="p-6">
      <UserList
        users={filteredUsers}
        onViewUser={handleViewUser}
        onUpdateStatus={handleUpdateStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        verifiedFilter={verifiedFilter}
        onVerifiedFilterChange={setVerifiedFilter}
      />
    </div>
  )
}
