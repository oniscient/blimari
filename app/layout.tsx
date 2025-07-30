import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import StyledComponentsRegistry from "../lib/registry"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Blimari - AI-Powered Learning Platform",
  description: "Transform any learning goal into a structured, personalized path in minutes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="antialiased">
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
