'use client'

import { useState } from 'react'
import { 
  ClockIcon, 
  PlusIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'
import { motion } from 'framer-motion'

export default function PunctualPage() {
  // TODO: Replace with real data fetching
  const [todayTasks, setTodayTasks] = useState<any[]>([])

  const quickActions = [
    { id: 'add-task', title: 'Add Task', icon: PlusIcon, description: 'Create a new task with AI priority' },
    { id: 'schedule', title: 'Smart Schedule', icon: CalendarIcon, description: 'Let AI optimize your schedule' },
    { id: 'analytics', title: 'Productivity Analytics', icon: ChartBarIcon, description: 'View insights and patterns' }
  ]

  const [stats, setStats] = useState([
    { label: 'Today\'s Tasks', value: '0', completed: '0', icon: ClockIcon },
    { label: 'This Week', value: '0', completed: '0', icon: CalendarIcon },
    { label: 'Overdue', value: '0', completed: '0', icon: ExclamationTriangleIcon }
  ])

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-white dark:bg-zinc-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Punctual</h1>
                  <p className="text-zinc-600 dark:text-zinc-400">AI-powered task and time management</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>New Task</span>
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Stats Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="p-6 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {stat.completed} completed
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  className="group text-left p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {action.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Today's Tasks */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Today's Tasks
              </h2>
              {todayTasks.length > 0 && (
                <motion.button
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center space-x-1"
                  whileHover={{ x: 4 }}
                >
                  <span>View all</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.button>
              )}
            </div>
            {todayTasks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                  No tasks for today
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                  Get started by creating your first task. Let AI help you prioritize and organize your workflow.
                </p>
                <div className="flex justify-center space-x-3">
                  <motion.button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Task
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Import Calendar
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center space-x-4">
                      <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        task.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-green-500'
                      }`}>
                        {task.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className={`font-medium ${
                            task.completed 
                              ? 'text-zinc-500 dark:text-zinc-400 line-through' 
                              : 'text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400'
                          } transition-colors`}>
                            {task.title}
                          </h3>
                          {task.urgent && !task.completed && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full flex items-center space-x-1">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              <span>Urgent</span>
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'high' 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-xs text-zinc-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>{task.dueTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* AI Features Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <BoltIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">AI Task Management</h3>
                    <p className="text-white/80">Smart scheduling and priorities</p>
                  </div>
                </div>
                <p className="text-white/90 mb-6">
                  Let AI analyze your work patterns, optimize your schedule, and automatically prioritize tasks based on deadlines and importance.
                </p>
                <motion.button
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enable AI Scheduling
                </motion.button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            </div>
          </motion.section>
        </div>
      </div>
    </AppLayout>
  )
}