'use client'

import {
  BookOpenIcon,
  BoltIcon,
  MicrophoneIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const apps = [
  {
    id: 'notebook',
    name: 'Notebook',
    icon: BookOpenIcon,
    href: '/notebook',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    icon: BoltIcon,
    href: '/marathon',
  },
  {
    id: 'yonder',
    name: 'Yonder',
    icon: MicrophoneIcon,
    href: '/yonder',
  },
  {
    id: 'junction',
    name: 'Junction',
    icon: DocumentTextIcon,
    href: '/junction',
  },
]

interface AppListProps {
  isCollapsed: boolean
}

export function AppList({ isCollapsed }: AppListProps) {
  return (
    <div className="space-y-2">
      <div className={cn('px-2', isCollapsed ? 'sr-only' : '')}>
        <h2 className="text-lg font-semibold">Apps</h2>
      </div>
      <nav className="grid gap-1">
        {apps.map((app) => (
          <a
            key={app.id}
            href={app.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              isCollapsed ? 'justify-center' : ''
            )}
          >
            <app.icon className="h-5 w-5" />
            {!isCollapsed && <span>{app.name}</span>}
          </a>
        ))}
      </nav>
    </div>
  )
} 