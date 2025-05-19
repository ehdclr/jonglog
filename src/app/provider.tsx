"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client"

interface ProvidersProps {
  children: React.ReactNode
}

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
})

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </ApolloProvider>
  )
}
