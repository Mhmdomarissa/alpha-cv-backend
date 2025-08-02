import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "CV Analyzer Platform | AI-Powered Resume Matching",
  description: "Advanced AI-powered platform for analyzing CVs and matching them with job descriptions using GPT-4 and vector similarity search.",
  keywords: ["CV analysis", "resume matching", "AI recruitment", "job matching", "GPT-4", "vector search"],
  authors: [{ name: "CV Analyzer Team" }],
  openGraph: {
    title: "CV Analyzer Platform",
    description: "AI-powered CV analysis and job matching platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Analyzer Platform",
    description: "AI-powered CV analysis and job matching platform",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
