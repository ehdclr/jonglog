// src/app/layout.tsx
import type { Metadata } from "next"
import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Providers } from "@/app/providers"

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "개인 블로그",
  description: "개인 블로그 및 파일 관리 시스템",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${notoSansKR.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex flex-1 w-full">
                <Sidebar />
                <main className="flex-1 p-6">{children}</main>
              </div>
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}