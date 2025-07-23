'use client'

import {
  BoltIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ClockIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const apps = [
  {
    id: 'mere',
    name: 'Mere',
    icon: SparklesIcon,
    href: '/mere',
    description: 'AI assistant and workflow orchestration',
    status: 'beta'
  },
  {
    id: 'marathon',
    name: 'Marathon',
    icon: BoltIcon,
    href: '/marathon',
    description: 'Workflow automation dashboard',
    status: 'beta'
  },
  {
    id: 'yonder',
    name: 'Yonder',
    icon: MicrophoneIcon,
    href: '/yonder',
    description: 'Audio processing and transcription',
    status: 'coming-soon'
  },
  {
    id: 'junction',
    name: 'Junction',
    icon: DocumentTextIcon,
    href: '/junction',
    description: 'Document processing and analysis',
    status: 'coming-soon'
  },
  {
    id: 'punctual',
    name: 'Punctual',
    icon: ClockIcon,
    href: '/punctual',
    description: 'AI-powered task and time management',
    status: 'active'
  },
]

interface AppListProps {
  isCollapsed: boolean
}

function NotebookList({ isCollapsed }: { isCollapsed: boolean }) {
  const notebooks = [
    { id: 'demo', title: 'Demo Notebook', updated: 'Just now', isActive: false },
    { id: '1', title: 'AI Research Notes', updated: '1 hour ago', isActive: true },
    { id: '2', title: 'Personal Journal', updated: 'Yesterday', isActive: false },
    { id: '3', title: 'Project X Docs', updated: '2 days ago', isActive: false },
  ];
  return (
    <div className="space-y-2 mt-8">
      <div className={cn('flex items-center justify-between px-2', isCollapsed ? 'sr-only' : '')}>
        <h2 className="text-lg font-semibold">Notebooks</h2>
        <button className="rounded-lg p-1 hover:bg-accent">
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="grid gap-1">
        {notebooks.map((notebook) => (
          <a
            key={notebook.id}
            href={`/junction/notebook/${notebook.id}`}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              notebook.isActive && 'bg-accent text-accent-foreground',
              isCollapsed ? 'justify-center' : ''
            )}
          >
            <DocumentTextIcon className="h-5 w-5" />
            {!isCollapsed && (
              <div className="flex flex-1 flex-col">
                <span className="text-sm">{notebook.title}</span>
                <span className="text-xs text-gray-400">{notebook.updated}</span>
              </div>
            )}
          </a>
        ))}
      </nav>
    </div>
  );
}

export function AppList({ isCollapsed }: AppListProps) {
  const pathname = usePathname();
  const isJunction = pathname.startsWith('/junction');
  return (
    <div className="space-y-2">
      <div className={cn('px-2', isCollapsed ? 'sr-only' : '')}>
        <h2 className="text-lg font-semibold">Apps</h2>
      </div>
      <nav className="grid gap-1">
        {apps.map((app) => {
          const isActive = pathname.startsWith(app.href) && app.href !== '/';
          return (
            <Link
              key={app.id}
              href={app.href}
              title={isCollapsed ? `${app.name}: ${app.description}` : app.description}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500',
                isCollapsed ? 'justify-center' : '',
                isActive ? 'bg-primary text-primary-foreground dark:bg-blue-900 dark:text-white' : ''
              )}
              tabIndex={0}
              aria-current={isActive ? 'page' : undefined}
            >
              <app.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium group-hover:text-gray-900 dark:group-hover:text-gray-50">
                      {app.name}
                    </div>
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                      app.status === 'active' ? 'bg-green-100 text-green-800' :
                      app.status === 'beta' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {app.status === 'active' ? '●' : 
                       app.status === 'beta' ? 'β' : 
                       '○'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">
                    {app.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      {isJunction && <NotebookList isCollapsed={isCollapsed} />}
    </div>
  )
} 