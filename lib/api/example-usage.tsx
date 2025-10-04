'use client'

import React, { useState } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useDashboardStats } from './services'
import { CreateUserRequest, UpdateUserRequest } from './types'

// Example component showing how to use the API hooks
export function UsersManagement() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')

  // Fetch users with pagination and filters
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch 
  } = useUsers({ 
    page, 
    limit: 10, 
    search: searchTerm || undefined, 
    role: selectedRole || undefined 
  })

  // Mutations
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser('')
  const deleteUserMutation = useDeleteUser()

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(userData)
      // Success - query will be automatically refetched due to invalidation
      console.log('User created successfully!')
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleUpdateUser = async (userId: string, userData: UpdateUserRequest) => {
    try {
      await updateUserMutation.mutateAsync(userData)
      // Success - queries will be automatically refetched
      console.log('User updated successfully!')
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync({ id: userId })
      console.log('User deleted successfully!')
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading users...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error.message}
        <button 
          onClick={() => refetch()} 
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users Management</h2>
      
      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {usersData?.data.map((user) => (
          <div key={user.id} className="p-4 border rounded-md flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">{user.role}</span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                disabled={updateUserMutation.isPending}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                disabled={deleteUserMutation.isPending}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {usersData && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {usersData.data.length} of {usersData.pagination.total} users
          </p>
          <div className="space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page} of {usersData.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(usersData.pagination.totalPages, page + 1))}
              disabled={page === usersData.pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Example Dashboard Stats Component
export function DashboardStats() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return <div className="p-4">Loading dashboard stats...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">Error loading stats: {error.message}</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Total Courses</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.totalCourses}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Total Enrollments</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.totalEnrollments}</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Activities</h3>
        <div className="space-y-2">
          {stats?.recentActivities.map((activity) => (
            <div key={activity.id} className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}