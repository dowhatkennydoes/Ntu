import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { SimpleAuthProvider as AuthProvider } from '@/contexts/SimpleAuthContext'
import AuthWrapper from '@/components/AuthWrapper'
import { ClientLayoutWrapper } from '@/components/ClientLayoutWrapper';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NTU App',
  description: 'Your AI-powered productivity suite',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + ' bg-background text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen'} suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <AuthWrapper>
              <ClientLayoutWrapper>
                {children}
              </ClientLayoutWrapper>
            </AuthWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
} 