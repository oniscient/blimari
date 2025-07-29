import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blimari - Plataforma de Aprendizado com IA',
  description: 'Transforme qualquer objetivo de aprendizado em uma trilha estruturada e personalizada em minutos com a Blimari, sua plataforma de aprendizado nativa de IA.',
  generator: 'Blimari Platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.className} ${GeistMono.className}`}>
      <body>{children}</body>
    </html>
  )
}
