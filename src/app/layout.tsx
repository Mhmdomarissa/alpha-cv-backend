import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'CV Analyzer Platform - AI-Powered Resume Matching',
  description: 'Advanced AI-powered platform for analyzing and matching CVs with job descriptions using GPT-4 and semantic search',
  keywords: 'CV analyzer, resume matching, AI recruitment, GPT-4, job matching, talent acquisition',
  authors: [{ name: 'CV Analyzer Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'CV Analyzer Platform',
    description: 'AI-powered CV analysis and matching platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV Analyzer Platform',
    description: 'AI-powered CV analysis and matching platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}