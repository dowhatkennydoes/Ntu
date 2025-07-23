'use client'

import { useState, useEffect } from 'react'
import { 
  PuzzlePieceIcon,
  PlusIcon,
  Cog6ToothIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  StarIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: 'productivity' | 'ai' | 'integration' | 'security' | 'analytics' | 'communication'
  status: 'installed' | 'available' | 'updating' | 'error'
  rating: number
  downloads: number
  lastUpdated: Date
  size: number // KB
  permissions: string[]
  dependencies: string[]
  icon: string
  screenshots: string[]
  documentation: string
  source: 'official' | 'community' | 'verified'
  trustScore: number
  compatibility: {
    ntuVersion: string
    platforms: string[]
  }
  features: string[]
  pricing: 'free' | 'premium' | 'subscription'
  license: string
}

interface PluginConfig {
  pluginId: string
  enabled: boolean
  settings: Record<string, any>
  permissions: {
    memory: boolean
    files: boolean
    network: boolean
    system: boolean
  }
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  hooks: {
    onMemoryCreate: boolean
    onFileUpload: boolean
    onWorkflowComplete: boolean
    onUserAction: boolean
  }
}

interface PluginExecution {
  id: string
  pluginId: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  startTime: Date
  endTime?: Date
  duration?: number
  output?: any
  error?: string
  logs: string[]
  memoryUsage: number
  cpuUsage: number
}

export default function PluginEcosystemWorkflow() {
  const [currentView, setCurrentView] = useState<'marketplace' | 'installed' | 'configuration' | 'execution' | 'development'>('marketplace')
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([])
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([])
  const [pluginConfigs, setPluginConfigs] = useState<Record<string, PluginConfig>>({})
  const [executions, setExecutions] = useState<PluginExecution[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [installingPlugin, setInstallingPlugin] = useState<string | null>(null)

  // Sample plugins for demonstration
  const samplePlugins: Plugin[] = [
    {
      id: '1',
      name: 'Advanced Memory Analytics',
      description: 'Deep insights into memory patterns, usage trends, and optimization suggestions',
      version: '2.1.0',
      author: 'Ntu Official',
      category: 'analytics',
      status: 'installed',
      rating: 4.8,
      downloads: 15420,
      lastUpdated: new Date('2024-11-15'),
      size: 2048,
      permissions: ['memory:read', 'analytics:write'],
      dependencies: [],
      icon: '📊',
      screenshots: [],
      documentation: 'https://docs.ntu.com/plugins/analytics',
      source: 'official',
      trustScore: 95,
      compatibility: {
        ntuVersion: '>=1.0.0',
        platforms: ['web', 'desktop']
      },
      features: ['Memory insights', 'Usage patterns', 'Optimization suggestions'],
      pricing: 'free',
      license: 'MIT'
    },
    {
      id: '2',
      name: 'Slack Integration',
      description: 'Send notifications and share memories directly to Slack channels',
      version: '1.5.2',
      author: 'Community Developer',
      category: 'integration',
      status: 'available',
      rating: 4.6,
      downloads: 8920,
      lastUpdated: new Date('2024-11-20'),
      size: 512,
      permissions: ['network:write', 'memory:read'],
      dependencies: ['slack-api'],
      icon: '💬',
      screenshots: [],
      documentation: 'https://github.com/community/slack-integration',
      source: 'community',
      trustScore: 87,
      compatibility: {
        ntuVersion: '>=1.0.0',
        platforms: ['web']
      },
      features: ['Slack notifications', 'Channel sharing', 'Webhook support'],
      pricing: 'free',
      license: 'Apache 2.0'
    },
    {
      id: '3',
      name: 'AI Content Generator',
      description: 'Generate content, summaries, and insights using advanced AI models',
      version: '3.0.1',
      author: 'AI Labs',
      category: 'ai',
      status: 'available',
      rating: 4.9,
      downloads: 23450,
      lastUpdated: new Date('2024-11-25'),
      size: 4096,
      permissions: ['ai:execute', 'memory:read', 'memory:write'],
      dependencies: ['openai-api', 'anthropic-api'],
      icon: '🤖',
      screenshots: [],
      documentation: 'https://ai-labs.com/ntu-plugin',
      source: 'verified',
      trustScore: 92,
      compatibility: {
        ntuVersion: '>=1.2.0',
        platforms: ['web', 'desktop', 'mobile']
      },
      features: ['Content generation', 'Smart summaries', 'AI insights'],
      pricing: 'subscription',
      license: 'Proprietary'
    },
    {
      id: '4',
      name: 'Data Export Suite',
      description: 'Comprehensive export tools with compliance and privacy controls',
      version: '1.8.0',
      author: 'Ntu Official',
      category: 'productivity',
      status: 'installed',
      rating: 4.7,
      downloads: 12340,
      lastUpdated: new Date('2024-11-10'),
      size: 1024,
      permissions: ['files:write', 'memory:read'],
      dependencies: [],
      icon: '📤',
      screenshots: [],
      documentation: 'https://docs.ntu.com/plugins/export',
      source: 'official',
      trustScore: 98,
      compatibility: {
        ntuVersion: '>=1.0.0',
        platforms: ['web', 'desktop']
      },
      features: ['Multiple formats', 'Compliance controls', 'Batch export'],
      pricing: 'free',
      license: 'MIT'
    }
  ]

  useEffect(() => {
    // Initialize with sample data
    setAvailablePlugins(samplePlugins)
    setInstalledPlugins(samplePlugins.filter(p => p.status === 'installed'))
    
    // Initialize plugin configurations
    const configs: Record<string, PluginConfig> = {}
    samplePlugins.filter(p => p.status === 'installed').forEach(plugin => {
      configs[plugin.id] = {
        pluginId: plugin.id,
        enabled: true,
        settings: {},
        permissions: {
          memory: plugin.permissions.includes('memory:read') || plugin.permissions.includes('memory:write'),
          files: plugin.permissions.includes('files:read') || plugin.permissions.includes('files:write'),
          network: plugin.permissions.includes('network:read') || plugin.permissions.includes('network:write'),
          system: plugin.permissions.includes('system:read') || plugin.permissions.includes('system:write')
        },
        hooks: {
          onMemoryCreate: false,
          onFileUpload: false,
          onWorkflowComplete: false,
          onUserAction: false
        }
      }
    })
    setPluginConfigs(configs)
  }, [])

  // Filter plugins based on search and category
  const filteredPlugins = availablePlugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Install plugin
  const installPlugin = async (plugin: Plugin) => {
    setInstallingPlugin(plugin.id)
    
    // Simulate installation process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const updatedPlugin = { ...plugin, status: 'installed' as const }
    setInstalledPlugins(prev => [...prev, updatedPlugin])
    setAvailablePlugins(prev => prev.map(p => p.id === plugin.id ? updatedPlugin : p))
    
    // Initialize configuration
    setPluginConfigs(prev => ({
      ...prev,
      [plugin.id]: {
        pluginId: plugin.id,
        enabled: true,
        settings: {},
        permissions: {
          memory: plugin.permissions.includes('memory:read') || plugin.permissions.includes('memory:write'),
          files: plugin.permissions.includes('files:read') || plugin.permissions.includes('files:write'),
          network: plugin.permissions.includes('network:read') || plugin.permissions.includes('network:write'),
          system: plugin.permissions.includes('system:read') || plugin.permissions.includes('system:write')
        },
        hooks: {
          onMemoryCreate: false,
          onFileUpload: false,
          onWorkflowComplete: false,
          onUserAction: false
        }
      }
    }))
    
    setInstallingPlugin(null)
    setShowInstallModal(false)
  }

  // Uninstall plugin
  const uninstallPlugin = async (pluginId: string) => {
    setInstalledPlugins(prev => prev.filter(p => p.id !== pluginId))
    setAvailablePlugins(prev => prev.map(p => p.id === pluginId ? { ...p, status: 'available' } : p))
    
    // Remove configuration
    const newConfigs = { ...pluginConfigs }
    delete newConfigs[pluginId]
    setPluginConfigs(newConfigs)
  }

  // Update plugin configuration
  const updatePluginConfig = (pluginId: string, config: Partial<PluginConfig>) => {
    setPluginConfigs(prev => ({
      ...prev,
      [pluginId]: { ...prev[pluginId], ...config }
    }))
  }

  // Execute plugin
  const executePlugin = async (pluginId: string) => {
    const execution: PluginExecution = {
      id: Date.now().toString(),
      pluginId,
      status: 'running',
      startTime: new Date(),
      logs: ['Plugin execution started'],
      memoryUsage: 0,
      cpuUsage: 0
    }
    
    setExecutions(prev => [execution, ...prev])
    
    // Simulate execution
    setTimeout(() => {
      setExecutions(prev => prev.map(e => 
        e.id === execution.id 
          ? { 
              ...e, 
              status: 'completed', 
              endTime: new Date(),
              duration: Date.now() - e.startTime.getTime(),
              output: { result: 'success', data: 'Sample output data' },
              logs: [...e.logs, 'Plugin execution completed successfully']
            }
          : e
      ))
    }, 3000)
  }

  // Stop plugin execution
  const stopExecution = (executionId: string) => {
    setExecutions(prev => prev.map(e => 
      e.id === executionId 
        ? { ...e, status: 'stopped', endTime: new Date() }
        : e
    ))
  }

  const renderMarketplace = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plugin Marketplace</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="productivity">Productivity</option>
            <option value="ai">AI</option>
            <option value="integration">Integration</option>
            <option value="security">Security</option>
            <option value="analytics">Analytics</option>
            <option value="communication">Communication</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map(plugin => (
          <div key={plugin.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{plugin.icon}</span>
                <div>
                  <h3 className="font-semibold">{plugin.name}</h3>
                  <p className="text-sm text-gray-600">v{plugin.version}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">{plugin.rating}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{plugin.description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{plugin.author}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                plugin.source === 'official' ? 'bg-blue-100 text-blue-800' :
                plugin.source === 'verified' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {plugin.source}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                {plugin.features.slice(0, 2).map(feature => (
                  <span key={feature} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">{plugin.size} KB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs ${
                plugin.pricing === 'free' ? 'bg-green-100 text-green-800' :
                plugin.pricing === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {plugin.pricing}
              </span>
              
              {plugin.status === 'installed' ? (
                <button
                  onClick={() => setSelectedPlugin(plugin)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Configure
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedPlugin(plugin)
                    setShowInstallModal(true)
                  }}
                  disabled={installingPlugin === plugin.id}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {installingPlugin === plugin.id ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderInstalled = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Installed Plugins</h2>
      
      <div className="space-y-4">
        {installedPlugins.map(plugin => {
          const config = pluginConfigs[plugin.id]
          return (
            <div key={plugin.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{plugin.icon}</span>
                  <div>
                    <h3 className="font-semibold">{plugin.name}</h3>
                    <p className="text-sm text-gray-600">v{plugin.version}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config?.enabled || false}
                      onChange={(e) => updatePluginConfig(plugin.id, { enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm">Enabled</span>
                  </label>
                  <button
                    onClick={() => setSelectedPlugin(plugin)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => uninstallPlugin(plugin.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Permissions</h4>
                  <div className="space-y-1">
                    {Object.entries(config?.permissions || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key}</span>
                        <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Hooks</h4>
                  <div className="space-y-1">
                    {Object.entries(config?.hooks || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{key}</span>
                        <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => executePlugin(plugin.id)}
                      className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Execute
                    </button>
                    <button
                      onClick={() => setSelectedPlugin(plugin)}
                      className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderConfiguration = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Plugin Configuration</h2>
      
      {selectedPlugin ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedPlugin.icon}</span>
              <div>
                <h3 className="text-xl font-semibold">{selectedPlugin.name}</h3>
                <p className="text-gray-600">v{selectedPlugin.version}</p>
              </div>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Advanced Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Permissions</h4>
              <div className="space-y-3">
                {Object.entries(pluginConfigs[selectedPlugin.id]?.permissions || {}).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key} Access</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updatePluginConfig(selectedPlugin.id, {
                        permissions: {
                          ...pluginConfigs[selectedPlugin.id]?.permissions,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Event Hooks</h4>
              <div className="space-y-3">
                {Object.entries(pluginConfigs[selectedPlugin.id]?.hooks || {}).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm">{key}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updatePluginConfig(selectedPlugin.id, {
                        hooks: {
                          ...pluginConfigs[selectedPlugin.id]?.hooks,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Select a plugin to configure</p>
      )}
    </div>
  )

  const renderExecution = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Plugin Execution</h2>
      
      <div className="space-y-4">
        {executions.map(execution => {
          const plugin = installedPlugins.find(p => p.id === execution.pluginId)
          return (
            <div key={execution.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{plugin?.icon}</span>
                  <div>
                    <h3 className="font-semibold">{plugin?.name}</h3>
                    <p className="text-sm text-gray-600">
                      Started: {execution.startTime.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                    execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {execution.status}
                  </span>
                  {execution.status === 'running' && (
                    <button
                      onClick={() => stopExecution(execution.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <StopIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {execution.duration && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Duration</span>
                    <p className="font-medium">{Math.round(execution.duration / 1000)}s</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Memory</span>
                    <p className="font-medium">{execution.memoryUsage} MB</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">CPU</span>
                    <p className="font-medium">{execution.cpuUsage}%</p>
                  </div>
                </div>
              )}

              {execution.output && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Output</h4>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(execution.output, null, 2)}
                  </pre>
                </div>
              )}

              {execution.error && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-red-600">Error</h4>
                  <p className="text-red-600 text-sm">{execution.error}</p>
                </div>
              )}

              {execution.logs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Logs</h4>
                  <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                    {execution.logs.map((log, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderDevelopment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Plugin Development</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create New Plugin</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Plugin Name</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="My Awesome Plugin" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="What does your plugin do?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select className="w-full border rounded px-3 py-2">
                <option>productivity</option>
                <option>ai</option>
                <option>integration</option>
                <option>security</option>
                <option>analytics</option>
                <option>communication</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Plugin
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Development Tools</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
              <CodeBracketIcon className="w-5 h-5 inline mr-2" />
              Plugin SDK Documentation
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
              <WrenchScrewdriverIcon className="w-5 h-5 inline mr-2" />
              Testing Framework
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Performance Profiler
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50">
              <ShieldCheckIcon className="w-5 h-5 inline mr-2" />
              Security Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plugin Ecosystem</h1>
          <p className="text-gray-600">Extend Ntu with powerful plugins, integrations, and custom workflows</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'marketplace', label: 'Marketplace', icon: PuzzlePieceIcon },
              { id: 'installed', label: 'Installed', icon: Cog6ToothIcon },
              { id: 'configuration', label: 'Configuration', icon: WrenchScrewdriverIcon },
              { id: 'execution', label: 'Execution', icon: PlayIcon },
              { id: 'development', label: 'Development', icon: CodeBracketIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentView === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {currentView === 'marketplace' && renderMarketplace()}
        {currentView === 'installed' && renderInstalled()}
        {currentView === 'configuration' && renderConfiguration()}
        {currentView === 'execution' && renderExecution()}
        {currentView === 'development' && renderDevelopment()}

        {/* Install Modal */}
        {showInstallModal && selectedPlugin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Install Plugin</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to install "{selectedPlugin.name}"?
              </p>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Required Permissions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedPlugin.permissions.map(permission => (
                    <li key={permission}>• {permission}</li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => installPlugin(selectedPlugin)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 