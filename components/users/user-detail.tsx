"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, MailCheck, Trophy, BookOpen, HelpCircle, TrendingUp, Shield, Lock, Unlock, Trash2, RotateCcw, KeyRound, Calendar, Globe, Clock, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { STATUS_ACTIVE, STATUS_DELETED, STATUS_DISABLED, STATUS_LOCKED, type User, type UserPoints, type UserStreak } from "@/types/user"
import type { Enrollment, QuizAttempt } from "@/types/common"
import { api } from "@/lib/api/exports"
import { useToast } from "@/hooks/use-toast"
import { UserDetailSkeleton } from "./user-detail-skeleton"

interface UserDetailProps {
  userId: string
}

export function UserDetail({ userId }: UserDetailProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLockDialog, setShowLockDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [lockoutDays, setLockoutDays] = useState("7")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadUserDetails = async () => {
      setIsLoading(true)
      try {
        const [infoData, enrollmentsData, attemptsData] = await Promise.all([
          api.users.getById(userId),
          api.enrollments.getByUserId(userId),
          api.quizAttempts.getByUserId(userId),
        ])
        setUser(infoData.user)
        setUserPoints(infoData.points || null)
        setUserStreak(infoData.streak || null)
        setEnrollments(enrollmentsData)
        setQuizAttempts(attemptsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserDetails()
  }, [userId, toast])

  const handleRoleChange = async (newRole: string) => {
    if (!user) return
    setIsUpdating(true)
    try {
      await api.users.updateRole(user.id, newRole)
      // Reload user data to get updated role information
      const userData = await api.users.getById(user.id)
      setUser(userData.user)
      toast({
        title: "Role updated",
        description: `User role updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }


  const handleLockAccount = async () => {
    if (!user) return
    setIsUpdating(true)
    try {
      const lockoutUntil = new Date()
      lockoutUntil.setDate(lockoutUntil.getDate() + Number.parseInt(lockoutDays))
      const updatedUser = await api.users.lockAccount(user.id, lockoutUntil.toISOString())
      setUser(updatedUser)
      setShowLockDialog(false)
      toast({
        title: "Account locked",
        description: `Account locked until ${lockoutUntil.toLocaleDateString()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lock account",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnlockAccount = async () => {
    if (!user) return
    setIsUpdating(true)
    try {
      const updatedUser = await api.users.unlockAccount(user.id)
      setUser(updatedUser)
      toast({
        title: "Account unlocked",
        description: "User can now access their account",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unlock account",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSoftDelete = async () => {
    if (!user) return
    setIsUpdating(true)
    try {
      const updatedUser = await api.users.softDelete(user.id)
      setUser(updatedUser)
      setShowDeleteDialog(false)
      toast({
        title: "Account deleted",
        description: "User account has been soft deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRestore = async () => {
    if (!user) return
    setIsUpdating(true)
    try {
      const updatedUser = await api.users.restore(user.id)
      setUser(updatedUser)
      toast({
        title: "Account restored",
        description: "User account has been restored",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore account",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user) return
    setIsUpdating(true)
    try {
      const result = await api.users.resetPassword(user.id)
      setShowResetPasswordDialog(false)
      toast({
        title: "Password reset sent",
        description: result.message,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <UserDetailSkeleton />
  }

  if (!user) {
    return (
      <div className="p-6">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Button>
        <Card className="p-6 text-center text-muted-foreground">User not found.</Card>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const completedEnrollments = enrollments.filter((e) => e.completed_at)

  const avgQuizScore =
    quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + (a.total_points / a.max_points) * 100, 0) / quizAttempts.length
      : 0



  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case STATUS_ACTIVE:
        return <Badge className="bg-green-500/10 text-green-500">Active</Badge>
      case STATUS_LOCKED:
        return <Badge className="bg-orange-500/10 text-orange-500">Locked</Badge>
      case STATUS_DISABLED:
        return <Badge className="bg-gray-500/10 text-gray-500">Disabled</Badge>
      case STATUS_DELETED:
        return <Badge variant="destructive">Deleted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "student":
        return <Badge className="bg-slate-500/10 text-slate-500">Student</Badge>
      case "teacher":
        return <Badge className="bg-cyan-500/10 text-cyan-500">Teacher</Badge>
      case "admin":
        return <Badge className="bg-purple-500/10 text-purple-500">Admin</Badge>
      case "super-admin":
        return <Badge className="bg-indigo-500/10 text-indigo-500">Super Admin</Badge>
      default:
        return <Badge variant="outline">User</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Button>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">User ID</p>
          <p className="text-xs font-mono text-muted-foreground">{user.id}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl">{getInitials(user.profile.display_name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{user.profile.display_name}</h1>
              {user.email_verified ? (
                <MailCheck className="h-5 w-5 text-green-500" />
              ) : (
                <Mail className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">@{user.profile.display_name}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {getStatusBadge(user.status)}
              {getRoleBadge(user.role)}
              {user.email_verified ? (
                <Badge variant="outline">Email Verified</Badge>
              ) : (
                <Badge variant="secondary">Email Unverified</Badge>
              )}
            </div>
          </div>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Actions
          </h3>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="role" className="text-sm font-medium">User Role</Label>
                </div>
                <Badge variant="outline" className="text-xs">
                  Current: {user.role}
                </Badge>
              </div>
              <Select value={user.role} onValueChange={handleRoleChange} disabled={isUpdating}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="teacher">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      Teacher
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="super-admin">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      Super Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Select a new role for this user. Changes will be applied immediately.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {user.status === "locked" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlockAccount}
                disabled={isUpdating}
                className="gap-2 bg-transparent"
              >
                <Unlock className="h-4 w-4" />
                Unlock Account
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLockDialog(true)}
                disabled={isUpdating || user.status === "deleted"}
                className="gap-2"
              >
                <Lock className="h-4 w-4" />
                Lock Account
              </Button>
            )}

            {user.status === "deleted" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestore}
                disabled={isUpdating}
                className="gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                Restore Account
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isUpdating}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Soft Delete
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetPasswordDialog(true)}
              disabled={isUpdating || user.status === "deleted"}
              className="gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Reset Password
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Total Points</span>
            </div>
            <p className="text-2xl font-bold">{userPoints?.lifetime}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Current Streak</span>
            </div>
            <p className="text-2xl font-bold">{userStreak?.current_len} days</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Enrollments</span>
            </div>
            <p className="text-2xl font-bold">{enrollments.length}</p>
            <p className="text-xs text-muted-foreground">{completedEnrollments.length} completed</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm">Quiz Attempts</span>
            </div>
            <p className="text-2xl font-bold">{quizAttempts.length}</p>
            <p className="text-xs text-muted-foreground">{avgQuizScore.toFixed(0)}% avg score</p>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <Mail className="h-3 w-3" />
                Email
              </span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <Shield className="h-3 w-3" />
                Role
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.role === 'student' ? 'bg-slate-500' :
                  user.role === 'teacher' ? 'bg-cyan-500' :
                    user.role === 'admin' ? 'bg-purple-500' :
                      user.role === 'super-admin' ? 'bg-indigo-500' : 'bg-gray-500'
                  }`}></div>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3" />
                Timezone
              </span>
              <p className="font-medium">{user.profile.time_zone}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3" />
                Created
              </span>
              <p className="font-medium">{new Date(user.created_at).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3" />
                Updated
              </span>
              <p className="font-medium">{new Date(user.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <Globe className="h-3 w-3" />
                Last Login
              </span>
              <span className="font-medium">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <Globe className="h-3 w-3" />
                Last Login IP
              </span>
              <p className="font-medium">{user.last_login_ip || "N/A"}</p>
            </div>
            {user.lockout_until && (
              <div>
                <span className="text-muted-foreground flex items-center gap-2 mb-1">
                  <Lock className="h-3 w-3" />
                  Locked Until
                </span>
                <p className="font-medium">{new Date(user.lockout_until).toLocaleString()}</p>
              </div>
            )}
          </div>
        </Card>

        <Tabs defaultValue="enrollments" className="mt-4">
          <TabsList>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Attempts</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments" className="space-y-3 mt-4">
            {enrollments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No enrollments yet</p>
            ) : (
              enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lesson #{enrollment.lesson_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{enrollment.progress_percentage}% complete</p>
                      {enrollment.completed_at && (
                        <Badge variant="outline" className="mt-1">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-3 mt-4">
            {quizAttempts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No quiz attempts yet</p>
            ) : (
              quizAttempts.map((attempt) => (
                <Card key={attempt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">Quiz #{attempt.quiz_id}</p>
                        {attempt.lesson_id && (
                          <Badge variant="outline" className="text-xs">
                            Lesson #{attempt.lesson_id}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Attempt #{attempt.attempt_no}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(attempt.started_at).toLocaleDateString()}
                      </p>
                      {attempt.duration_ms && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {Math.round(attempt.duration_ms / 60000)} minutes
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-lg font-bold">
                          {attempt.total_points}/{attempt.max_points}
                        </p>
                        {attempt.passed !== undefined && (
                          <Badge
                            variant={attempt.passed ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {attempt.passed ? "Passed" : "Failed"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {((attempt.total_points / attempt.max_points) * 100).toFixed(0)}%
                      </p>
                      {attempt.submitted_at && (
                        <Badge variant="outline" className="mt-1">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from accessing their account until the lockout period expires.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="lockout-days">Lockout Duration (days)</Label>
            <Input
              id="lockout-days"
              type="number"
              value={lockoutDays}
              onChange={(e) => setLockoutDays(e.target.value)}
              min="1"
              max="365"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLockAccount} disabled={isUpdating}>
              Lock Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soft Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the user account as deleted. The account can be restored later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDelete} disabled={isUpdating} className="bg-destructive">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to {user.email}. The user will need to follow the link to set a new
              password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={isUpdating}>
              Send Reset Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
