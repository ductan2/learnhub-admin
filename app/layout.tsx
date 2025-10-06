import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ApolloProvider } from "@apollo/client/react"
import QueryProvider from "../lib/providers/query-client-provider"
import { AuthProvider } from "../lib/auth/auth-context"
import { apolloClient } from "../lib/graphql/client"
import "./globals.css"
import ApolloProviderWrapper from "./ApolloProviderWrapper"

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
          <ApolloProviderWrapper>
          <AuthProvider>
            <QueryProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </QueryProvider>
          </AuthProvider>
        </ApolloProviderWrapper>
        <Analytics />
      </body>
    </html>
  )
}
