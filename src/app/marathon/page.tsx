'use client'

import { useState } from 'react'
import { 
  BoltIcon, 
  PlusIcon, 
  CogIcon, 
  PlayIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'
// import { WorkflowDashboard } from '@/components/WorkflowDashboard' // Remove for templates
import { motion } from 'framer-motion'

export default function MarathonPage() {
  // TODO: Replace with real data fetching
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([])
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)

  // Marathon templates
  const marathonTemplates = [
    {
      id: '1',
      name: 'Memory Processing Pipeline',
      description: 'Automated memory processing with AI analysis and compliance checks',
      status: 'published',
      executions: 150,
    },
    // Add more templates here as needed
  ]

  const quickActions = [
    { id: 'create', title: 'Create Workflow', icon: PlusIcon, description: 'Build automated processes' },
    { id: 'templates', title: 'Browse Templates', icon: CogIcon, description: 'Use pre-built workflows' },
    { id: 'monitoring', title: 'View Analytics', icon: ChartBarIcon, description: 'Monitor workflow performance' }
  ]

  const [stats, setStats] = useState([
    { label: 'Active Workflows', value: '0', completed: '0 running', icon: BoltIcon },
    { label: 'Total Executions', value: '0', completed: 'This month', icon: PlayIcon },
    { label: 'Success Rate', value: '0%', completed: 'Last 30 days', icon: CheckCircleIcon }
  ])

  const handleCreateWorkflow = () => setShowWorkflowModal(true)
  const handleBrowseTemplates = () => setShowTemplatesModal(true)
  const handleViewAnalytics = () => alert('Analytics coming soon!')
  const handleEnableAI = () => alert('AI Optimization coming soon!')
  const handleViewAll = () => alert('View all workflows coming soon!')

  return (
    <AppLayout>
      {/* Modal overlays */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 max-w-2xl w-full shadow-xl relative">
            <button
              onClick={() => setShowWorkflowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl leading-none focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            {/* <WorkflowDashboard /> */}
            {/* You can render the workflow builder here if needed */}
            <div className="text-xl font-bold mb-4">Create New Workflow (Coming Soon)</div>
          </div>
        </div>
      )}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 max-w-2xl w-full shadow-xl relative">
            <button
              onClick={() => setShowTemplatesModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl leading-none focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-zinc-100">Marathon Templates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marathonTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold dark:text-zinc-100">{template.name}</span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-300 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className={`px-2 py-1 rounded-full ${template.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{template.status}</span>
                    <span className="text-gray-500 dark:text-gray-400">{template.executions} executions</span>
                  </div>
                  <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">Use Template</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="h-full overflow-y-auto bg-white dark:bg-zinc-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BoltIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Marathon</h1>
                  <p className="text-zinc-600 dark:text-zinc-400">Workflow automation dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateWorkflow}
                >
                  <span className="flex items-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>New Workflow</span>
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
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {stat.completed}
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
              <motion.button
                key="create"
                className="group text-left p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
                onClick={handleCreateWorkflow}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PlusIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  Create Workflow
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Build automated processes
                </p>
              </motion.button>
              <motion.button
                key="templates"
                className="group text-left p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ y: -4 }}
                onClick={handleBrowseTemplates}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CogIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  Browse Templates
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Use pre-built workflows
                </p>
              </motion.button>
              <motion.button
                key="analytics"
                className="group text-left p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
                onClick={handleViewAnalytics}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                  View Analytics
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Monitor workflow performance
                </p>
              </motion.button>
            </div>
          </motion.section>

          {/* Active Workflows */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Active Workflows
              </h2>
              {activeWorkflows.length > 0 && (
                <motion.button
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center space-x-1"
                  whileHover={{ x: 4 }}
                  onClick={handleViewAll}
                >
                  <span>View all</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.button>
              )}
            </div>
            {activeWorkflows.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BoltIcon className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                  No workflows yet
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                  Create your first automated workflow to streamline repetitive tasks and boost productivity.
                </p>
                <div className="flex justify-center space-x-3">
                  <motion.button
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateWorkflow}
                  >
                    Create Workflow
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBrowseTemplates}
                  >
                    Browse Templates
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeWorkflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BoltIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {workflow.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-zinc-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>{workflow.lastRun}</span>
                          </div>
                          <span className="text-xs text-zinc-500">{workflow.executions} executions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workflow.status === 'running' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : workflow.status === 'paused'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {workflow.status}
                        </span>
                        <ArrowRightIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
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
            <div className="bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <BoltIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">AI-Powered Automation</h3>
                    <p className="text-white/80">Intelligent workflow optimization</p>
                  </div>
                </div>
                <p className="text-white/90 mb-6">
                  Let AI suggest workflow improvements, optimize execution paths, and automatically handle complex decision-making processes.
                </p>
                <motion.button
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnableAI}
                >
                  Enable AI Optimization
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
