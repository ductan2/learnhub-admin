"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settings } from '@/lib/api/modules/settings'
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/schemas/settings'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Loader2, Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'

interface PasswordStrength {
    score: number
    feedback: string[]
}

function calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) {
        score += 1
    } else {
        feedback.push('At least 8 characters')
    }

    if (/[a-z]/.test(password)) {
        score += 1
    } else {
        feedback.push('One lowercase letter')
    }

    if (/[A-Z]/.test(password)) {
        score += 1
    } else {
        feedback.push('One uppercase letter')
    }

    if (/\d/.test(password)) {
        score += 1
    } else {
        feedback.push('One number')
    }

    if (/[^a-zA-Z\d]/.test(password)) {
        score += 1
    } else {
        feedback.push('One special character')
    }

    return { score, feedback }
}

function getStrengthColor(score: number): string {
    if (score <= 2) return 'text-red-500'
    if (score <= 3) return 'text-yellow-500'
    if (score <= 4) return 'text-blue-500'
    return 'text-green-500'
}

function getStrengthText(score: number): string {
    if (score <= 2) return 'Weak'
    if (score <= 3) return 'Fair'
    if (score <= 4) return 'Good'
    return 'Strong'
}

export function SecuritySettings() {
    const [isLoading, setIsLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            current_password: '',
            new_password: '',
            confirm_password: '',
        },
    })

    const newPassword = form.watch('new_password')
    const passwordStrength = calculatePasswordStrength(newPassword)

    const onSubmit = async (data: ChangePasswordFormData) => {
        setIsLoading(true)
        try {
            const response = await settings.changePassword(data)

            if (response.status === 'success') {
                toast({
                    title: 'Password changed',
                    description: 'Your password has been changed successfully.',
                })
                form.reset()
                setShowConfirmDialog(false)
            } else {
                toast({
                    title: 'Error',
                    description: response.message || 'Failed to change password',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleConfirmChange = () => {
        form.handleSubmit(onSubmit)()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                </CardTitle>
                <CardDescription>
                    Manage your password and security preferences
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-6">
                        {/* Current Password */}
                        <FormField
                            control={form.control}
                            name="current_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                placeholder="Enter your current password"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* New Password */}
                        <FormField
                            control={form.control}
                            name="new_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder="Enter your new password"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>

                                    {/* Password Strength Indicator */}
                                    {newPassword && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-muted rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.score <= 2
                                                                ? 'bg-red-500'
                                                                : passwordStrength.score <= 3
                                                                    ? 'bg-yellow-500'
                                                                    : passwordStrength.score <= 4
                                                                        ? 'bg-blue-500'
                                                                        : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.score)}`}>
                                                    {getStrengthText(passwordStrength.score)}
                                                </span>
                                            </div>

                                            {passwordStrength.feedback.length > 0 && (
                                                <div className="text-xs text-muted-foreground">
                                                    <p>Password should include:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {passwordStrength.feedback.map((item, index) => (
                                                            <li key={index}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm New Password */}
                        <FormField
                            control={form.control}
                            name="confirm_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your new password"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Security Tips */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Security Tips
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Use a unique password that you don't use elsewhere</li>
                                <li>• Consider using a password manager</li>
                                <li>• Enable two-factor authentication if available</li>
                                <li>• Change your password regularly</li>
                            </ul>
                        </div>

                        {/* Change Password Button */}
                        <div className="flex justify-end">
                            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        disabled={!form.formState.isValid || isLoading}
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Change Password
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Password Change</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to change your password? You will need to log in again with your new password.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleConfirmChange}
                                            disabled={isLoading}
                                        >
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Change Password
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
