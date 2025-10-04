"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  breadcrumbs?: string[]
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-border">/</span>}
                  <span className="hover:text-foreground transition-colors">{crumb}</span>
                </span>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 bg-background/50 border-border focus-visible:ring-primary" />
          </div>

          <Button variant="ghost" size="icon" className="relative hover:bg-accent/10">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full ring-2 ring-card" />
          </Button>
        </div>
      </div>
    </header>
  )
}
