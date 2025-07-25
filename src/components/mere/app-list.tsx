'use client'

import {
  BoltIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ClockIcon,
  SparklesIcon,
  PlusIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const apps = [
  {
    id: 'mere',
    name: 'Mere',
    icon: SparklesIcon,
    href: '/mere',
    description: 'AI assistant and workflow orchestration',
    status: 'beta',
    color: 'from-purple-500 to-indigo-600',
    accentColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  },
  {
    id: 'marathon',
    name: 'Marathon',
    icon: BoltIcon,
    href: '/marathon',
    description: 'Workflow automation dashboard',
    status: 'beta',
    color: 'from-yellow-500 to-orange-600',
    accentColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  {
    id: 'yonder',
    name: 'Yonder',
    icon: MicrophoneIcon,
    href: '/yonder',
    description: 'Audio processing and transcription',
    status: 'active',
    color: 'from-red-500 to-pink-600',
    accentColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  },
  {
    id: 'junction',
    name: 'Junction',
    icon: DocumentTextIcon,
    href: '/junction',
    description: 'Document processing and analysis',
    status: 'active',
    color: 'from-blue-500 to-cyan-600',
    accentColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  },
  {
    id: 'punctual',
    name: 'Punctual',
    icon: ClockIcon,
    href: '/punctual',
    description: 'AI-powered task and time management',
    status: 'active',
    color: 'from-green-500 to-emerald-600',
    accentColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  },
]

interface AppListProps {
  isCollapsed: boolean
}

function NotebookList({ isCollapsed }: { isCollapsed: boolean }) {
  const notebooks = [
    { id: 'demo', title: 'Demo Notebook', updated: 'Just now', isActive: false, color: 'bg-blue-500' },
    { id: '1', title: 'AI Research Notes', updated: '1 hour ago', isActive: true, color: 'bg-purple-500' },
    { id: '2', title: 'Personal Journal', updated: 'Yesterday', isActive: false, color: 'bg-green-500' },
    { id: '3', title: 'Project X Docs', updated: '2 days ago', isActive: false, color: 'bg-orange-500' },
  ];
  
  return (
    <motion.div 
      className="space-y-3 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className={cn('flex items-center justify-between px-4', isCollapsed ? 'sr-only' : '')}>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Notebooks</h3>
        <motion.button 
          className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-4 w-4 text-zinc-400" />
        </motion.button>
      </div>
      <nav className="space-y-1 px-2">
        {notebooks.map((notebook, index) => (
          <motion.div
            key={notebook.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            <Link
              href={`/junction/notebook/${notebook.id}`}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-600 dark:text-zinc-400 transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50',
                notebook.isActive && 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 shadow-sm',
                isCollapsed ? 'justify-center' : ''
              )}
            >
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', notebook.color)} />
              {!isCollapsed && (
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-sm font-medium truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    {notebook.title}
                  </span>
                  <span className="text-xs text-zinc-400 truncate">{notebook.updated}</span>
                </div>
              )}
              {!isCollapsed && (
                <ChevronRightIcon className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              )}
            </Link>
          </motion.div>
        ))}
      </nav>
    </motion.div>
  );
}

export function AppList({ isCollapsed }: AppListProps) {
  const pathname = usePathname();
  const isJunction = pathname.startsWith('/junction');
  
  return (
    <div className="space-y-1">
      {apps.map((app) => {
        const isActive = pathname.startsWith(app.href) && app.href !== '/';
        return (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 2 }}
          >
            <Link
              href={app.href}
              title={isCollapsed ? `${app.name}: ${app.description}` : app.description}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100',
                isCollapsed ? 'justify-center' : ''
              )}
            >
              <app.icon className={cn(
                'h-4 w-4 flex-shrink-0',
                isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
              )} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {app.name}
                    </span>
                    {app.status === 'beta' && (
                      <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                        β
                      </span>
                    )}
                  </div>
                  {!isActive && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {app.description}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </motion.div>
        );
      })}
      
      {isJunction && !isCollapsed && (
        <div className="pt-4">
          <NotebookList isCollapsed={isCollapsed} />
        </div>
      )}
    </div>
  )
} 