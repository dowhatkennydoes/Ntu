'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CommandPaletteProps {
  onClose: () => void
  onWorkflowStart: (type: 'task' | 'memory' | 'voice' | 'automation') => void
}

export function CommandPalette({ onClose, onWorkflowStart }: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  const commands = [
    { id: 'task', label: 'Create Task', type: 'task' as const },
    { id: 'memory', label: 'Save Memory', type: 'memory' as const },
    { id: 'voice', label: 'Voice Note', type: 'voice' as const },
    { id: 'automation', label: 'Automation', type: 'automation' as const },
  ]

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-zinc-700 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((command) => (
            <button
              key={command.id}
              onClick={() => {
                onWorkflowStart(command.type)
                onClose()
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {command.label}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}