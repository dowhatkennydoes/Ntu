import React, { useState, useEffect } from 'react'
import { 
  CpuChipIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface CustomAIModel {
  id: string
  name: string
  purpose: string
  training_data: {
    meetings_count: number
    transcripts_count: number
    custom_annotations: number
  }
  performance_metrics: {
    accuracy: number
    precision: number
    recall: number
    f1_score: number
  }
  status: 'training' | 'ready' | 'failed'
  created_at: string
  updated_at: string
}

interface EnterpriseIntegration {
  id: string
  tool_name: string
  integration_type: 'calendar' | 'communication' | 'project_management' | 'crm' | 'hr'
  status: 'active' | 'inactive' | 'error'
  sync_frequency: string
  last_sync: string
  data_mapping: Record<string, string>
  error_count: number
}

interface AdvancedReport {
  id: string
  name: string
  type: 'executive' | 'team' | 'individual' | 'compliance' | 'custom'
  data_sources: string[]
  metrics: Array<{
    name: string
    value: number
    unit: string
    trend: 'up' | 'down' | 'stable'
    change_percentage: number
  }>
  insights: string[]
  recommendations: string[]
  generated_at: string
}

interface AdvancedAIDashboardProps {
  userId: string
}

export default function AdvancedAIDashboard({ userId }: AdvancedAIDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'integrations' | 'reports' | 'analysis'>('overview')
  const [customModels, setCustomModels] = useState<CustomAIModel[]>([])
  const [integrations, setIntegrations] = useState<EnterpriseIntegration[]>([])
  const [reports, setReports] = useState<AdvancedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModel, setShowCreateModel] = useState(false)
  const [showCreateIntegration, setShowCreateIntegration] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load custom models
      const modelsResponse = await fetch(`/api/ai/advanced?action=custom_models&userId=${userId}`)
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        setCustomModels(modelsData.models || [])
      }

      // Load integrations
      const integrationsResponse = await fetch(`/api/ai/advanced?action=enterprise_integrations&userId=${userId}`)
      if (integrationsResponse.ok) {
        const integrationsData = await integrationsResponse.json()
        setIntegrations(integrationsData.integrations || [])
      }

      // Load reports
      const reportsResponse = await fetch(`/api/ai/advanced?action=advanced_reports&userId=${userId}`)
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports || [])
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return 'text-green-600 bg-green-100'
      case 'training':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'training':
        return <ClockIcon className="w-4 h-4" />
      case 'error':
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      default:
        return <Cog6ToothIcon className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4 border-t-2 border-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced AI Dashboard</h2>
          <p className="text-gray-600">Enterprise features, custom models, and advanced analytics</p>
        </div>
        
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'models'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Custom Models
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'integrations'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analysis
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custom Models</p>
                <p className="text-2xl font-bold text-gray-900">{customModels.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Custom AI Models</h3>
            <button
              onClick={() => setShowCreateModel(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Model</span>
            </button>
          </div>

          {customModels.length === 0 ? (
            <div className="text-center py-12">
              <CpuChipIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Models</h3>
              <p className="text-gray-600">Create your first custom AI model to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {customModels.map((model) => (
                <div key={model.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                          {getStatusIcon(model.status)}
                          <span className="capitalize">{model.status}</span>
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{model.purpose}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Accuracy</p>
                          <p className="font-medium">{(model.performance_metrics.accuracy * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Precision</p>
                          <p className="font-medium">{(model.performance_metrics.precision * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Recall</p>
                          <p className="font-medium">{(model.performance_metrics.recall * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">F1 Score</p>
                          <p className="font-medium">{(model.performance_metrics.f1_score * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {model.status === 'ready' && (
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          Use Model
                        </button>
                      )}
                      {model.status === 'training' && (
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                          View Progress
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Enterprise Integrations</h3>
            <button
              onClick={() => setShowCreateIntegration(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Integration</span>
            </button>
          </div>

          {integrations.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheckIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Integrations</h3>
              <p className="text-gray-600">Connect your enterprise tools to enhance functionality</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{integration.tool_name}</h4>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {getStatusIcon(integration.status)}
                          <span className="capitalize">{integration.status}</span>
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 capitalize">{integration.integration_type} Integration</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Sync Frequency</p>
                          <p className="font-medium">{integration.sync_frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Sync</p>
                          <p className="font-medium">
                            {new Date(integration.last_sync).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Error Count</p>
                          <p className="font-medium">{integration.error_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Data Mappings</p>
                          <p className="font-medium">{Object.keys(integration.data_mapping).length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {integration.status === 'active' && (
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          Manage
                        </button>
                      )}
                      {integration.status === 'error' && (
                        <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                          Fix Issues
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Reports</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports</h3>
              <p className="text-gray-600">Generate your first advanced report to get insights</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{report.name}</h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        Generated on {new Date(report.generated_at).toLocaleDateString()}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        {report.metrics.slice(0, 4).map((metric, index) => (
                          <div key={index}>
                            <p className="text-gray-500">{metric.name}</p>
                            <div className="flex items-center space-x-1">
                              <p className="font-medium">{metric.value} {metric.unit}</p>
                              {getTrendIcon(metric.trend)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {report.insights.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Key Insights:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.insights.slice(0, 2).map((insight, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        View Report
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Analysis Tools</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CpuChipIcon className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-medium text-gray-900">Natural Language Understanding</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Advanced NLU analysis for deeper understanding of meeting content, entities, and relationships.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Run NLU Analysis
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-medium text-gray-900">Multi-Modal Analysis</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Analyze audio and video content together for comprehensive meeting insights.
              </p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Analyze Content
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
                <h4 className="text-lg font-medium text-gray-900">Predictive Analytics</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Predict meeting outcomes and optimize future meetings based on patterns.
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Generate Predictions
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-orange-600" />
                <h4 className="text-lg font-medium text-gray-900">Security & Compliance</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Assess security compliance and implement enterprise-grade data protection.
              </p>
              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Security Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 