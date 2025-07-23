"use client";

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { AppSidebar } from '@/components/AppSidebar'
import { useState, useEffect } from 'react';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MereChat } from '@/components/mere/mere-chat';
import { SessionList } from '@/components/mere/session-list';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mereOpen, setMereOpen] = useState(false);
  const [showFloatingIcon, setShowFloatingIcon] = useState(true); // mock preference
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const pathname = usePathname();

  // Only show floating icon on non-home views
  const isHome = pathname === '/' || pathname === '/home';

  // Ensure at least one session exists and is selected
  useEffect(() => {
    if (!mereOpen) return;
    const sessions = JSON.parse(localStorage.getItem('mere_sessions_v1') || '[]');
    if (sessions.length === 0) {
      const newSession = {
        id: Date.now().toString(),
        title: 'New Session',
        timestamp: new Date().toLocaleString(),
        isActive: false,
        tokenCount: 0,
      };
      localStorage.setItem('mere_sessions_v1', JSON.stringify([newSession]));
      setSelectedSessionId(newSession.id);
    } else if (!selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [mereOpen, selectedSessionId]);

  // Handler for closing drawer (but icon reappears if preference enabled)
  const handleCloseDrawer = () => {
    setMereOpen(false);
    setTimeout(() => setShowFloatingIcon(true), 500); // icon reappears after drawer closes
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + ' bg-background text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen'}>
        <Providers>
          {children}
          {/* Floating Mere Icon (all non-home views) */}
          {showFloatingIcon && !mereOpen && !isHome && (
            <button
              aria-label="Open Mere Assistant"
              className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => { setMereOpen(true); setShowFloatingIcon(false); }}
            >
              <SparklesIcon className="h-7 w-7" />
            </button>
          )}
          {/* Floating 'Ask Mere to handle this' button (all non-home views) */}
          {!mereOpen && !isHome && (
            <button
              aria-label="Ask Mere to handle this"
              className="fixed bottom-24 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => { setMereOpen(true); setShowFloatingIcon(false); }}
            >
              <SparklesIcon className="h-6 w-6 mr-2" />
              <span className="font-semibold text-sm">Ask Mere to handle this</span>
            </button>
          )}
          {/* Mere Chat Drawer */}
          {mereOpen && (
            <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
              <div className="w-full h-full bg-black/20 transition-opacity duration-300 pointer-events-auto" onClick={handleCloseDrawer} />
              <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 transform translate-x-0 pointer-events-auto flex flex-col">
                <button
                  aria-label="Close Mere Assistant"
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-900 rounded-full p-2 shadow focus:outline-none"
                  onClick={handleCloseDrawer}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="flex-1 flex overflow-hidden pt-12 pb-4 px-2">
                  {/* Sidebar with sessions */}
                  <div className="w-64 border-r bg-card hidden md:block">
                    <SessionList
                      isCollapsed={false}
                      onSessionSelect={setSelectedSessionId}
                      selectedSessionId={selectedSessionId || ''}
                    />
                  </div>
                  {/* Chat drawer */}
                  <div className="flex-1 flex flex-col">
                    {selectedSessionId && <MereChat sessionId={selectedSessionId} />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
} 