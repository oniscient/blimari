import type React from "react"
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import StyledComponentsRegistry from "../lib/registry"
import I18nProvider from "@/src/components/I18nProvider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Blimari - AI-Powered Learning Platform",
  description: "Transform any learning goal into a structured, personalized path in minutes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html className={inter.className}>
      <body className="antialiased">
        <I18nProvider>
          <StackProvider app={stackServerApp}><StackTheme>
            <StyledComponentsRegistry>
              {children}
            </StyledComponentsRegistry>
          </StackTheme></StackProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
