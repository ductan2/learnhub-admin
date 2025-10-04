import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import QueryProvider from "../lib/providers/query-client-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "LMS Admin Dashboard",
  description: "Learning Management System Administration",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <QueryProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
