'use client'

import { useState, useRef } from 'react'
import { 
  DocumentArrowDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  LockClosedIcon,
  LockOpenIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface ExportContent {
  id: string
  title: string
  type: 'memory' | 'transcript' | 'notebook' | 'conversation' | 'workflow'
  content: string
  metadata: Record<string, any>
  tags: string[]
  createdAt: Date
  updatedAt: Date
  permissions: {
    canExport: boolean
    canRedact: boolean
    complianceLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  }
}

interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: React.ComponentType<any>
  supportsRedaction: boolean
  supportsMetadata: boolean
  maxFileSize: number // MB
}

interface RedactionRule {
  id: string
  name: string
  type: 'pii' | 'phi' | 'custom' | 'keyword'
  pattern: string
  replacement: string
  enabled: boolean
  priority: number
}

interface ComplianceSettings {
  includeAuditTrail: boolean
  includeWatermark: boolean
  includeMetadata: boolean
  redactSensitiveData: boolean
  encryptionLevel: 'none' | 'basic' | 'strong'
  expirationDate?: Date
  accessControl: {
    passwordProtected: boolean
    password?: string
    viewOnly: boolean
    allowPrinting: boolean
    allowCopying: boolean
  }
}

export default function ExportWorkflow() {
  const [selectedContent, setSelectedContent] = useState<ExportContent | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null)
  const [redactionRules, setRedactionRules] = useState<RedactionRule[]>([])
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings>({
    includeAuditTrail: true,
    includeWatermark: false,
    includeMetadata: true,
    redactSensitiveData: false,
    encryptionLevel: 'none',
    accessControl: {
      passwordProtected: false,
      viewOnly: false,
      allowPrinting: true,
      allowCopying: true
    }
  })
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string
    contentId: string
    format: string
    timestamp: Date
    status: 'completed' | 'failed' | 'in-progress'
    fileSize?: number
    downloadUrl?: string
  }>>([])
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  // Sample content for demonstration
  const availableContent: ExportContent[] = [
    {
      id: '1',
      title: 'Q4 Strategy Meeting Transcript',
      type: 'transcript',
      content: 'Meeting started at 2:00 PM. Alice: Welcome everyone to our Q4 strategy session. Bob: I think we should focus on expanding into the Asian market. Carol: That sounds expensive. We need to consider our budget constraints...',
      metadata: {
        duration: '45 minutes',
        speakers: ['Alice', 'Bob', 'Carol'],
        sentiment: 'positive',
        actionItems: 5
      },
      tags: ['strategy', 'q4', 'meeting'],
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01'),
      permissions: {
        canExport: true,
        canRedact: true,
        complianceLevel: 'internal'
      }
    },
    {
      id: '2',
      title: 'Product Research Notes',
      type: 'notebook',
      content: 'Competitor Analysis:\n1. Company A: Strong in enterprise market\n2. Company B: Leading in mobile solutions\n3. Company C: Emerging player with innovative features...',
      metadata: {
        wordCount: 1250,
        sections: 8,
        lastAccessed: new Date()
      },
      tags: ['research', 'competitors', 'product'],
      createdAt: new Date('2024-11-28'),
      updatedAt: new Date('2024-12-01'),
      permissions: {
        canExport: true,
        canRedact: true,
        complianceLevel: 'confidential'
      }
    }
  ]

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF Document',
      extension: '.pdf',
      description: 'Portable Document Format with formatting preserved',
      icon: DocumentTextIcon,
      supportsRedaction: true,
      supportsMetadata: true,
      maxFileSize: 50
    },
    {
      id: 'docx',
      name: 'Word Document',
      extension: '.docx',
      description: 'Microsoft Word format with rich formatting',
      icon: DocumentTextIcon,
      supportsRedaction: true,
      supportsMetadata: true,
      maxFileSize: 25
    },
    {
      id: 'json',
      name: 'JSON Data',
      extension: '.json',
      description: 'Structured data format with metadata',
      icon: CodeBracketIcon,
      supportsRedaction: false,
      supportsMetadata: true,
      maxFileSize: 10
    },
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      extension: '.csv',
      description: 'Comma-separated values for data analysis',
      icon: TableCellsIcon,
      supportsRedaction: false,
      supportsMetadata: false,
      maxFileSize: 5
    },
    {
      id: 'txt',
      name: 'Plain Text',
      extension: '.txt',
      description: 'Simple text format without formatting',
      icon: DocumentTextIcon,
      supportsRedaction: true,
      supportsMetadata: false,
      maxFileSize: 1
    }
  ]

  // Default redaction rules
  const defaultRedactionRules: RedactionRule[] = [
    {
      id: '1',
      name: 'Email Addresses',
      type: 'pii',
      pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      replacement: '[EMAIL]',
      enabled: true,
      priority: 1
    },
    {
      id: '2',
      name: 'Phone Numbers',
      type: 'pii',
      pattern: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
      replacement: '[PHONE]',
      enabled: true,
      priority: 2
    },
    {
      id: '3',
      name: 'Credit Card Numbers',
      type: 'pii',
      pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',
      replacement: '[CARD]',
      enabled: true,
      priority: 3
    },
    {
      id: '4',
      name: 'Social Security Numbers',
      type: 'pii',
      pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
      replacement: '[SSN]',
      enabled: true,
      priority: 4
    }
  ]

  const [customRedactionRules, setCustomRedactionRules] = useState<RedactionRule[]>([])

  // Apply redaction rules to content
  const applyRedaction = (content: string): string => {
    let redactedContent = content
    const allRules = [...defaultRedactionRules, ...customRedactionRules]
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority)

    allRules.forEach(rule => {
      const regex = new RegExp(rule.pattern, 'gi')
      redactedContent = redactedContent.replace(regex, rule.replacement)
    })

    return redactedContent
  }

  // Generate export content with compliance settings
  const generateExportContent = (content: ExportContent, format: ExportFormat): string => {
    let exportContent = content.content

    // Apply redaction if enabled
    if (complianceSettings.redactSensitiveData) {
      exportContent = applyRedaction(exportContent)
    }

    // Add metadata if supported
    if (format.supportsMetadata && complianceSettings.includeMetadata) {
      const metadata = {
        title: content.title,
        type: content.type,
        tags: content.tags,
        createdAt: content.createdAt.toISOString(),
        updatedAt: content.updatedAt.toISOString(),
        complianceLevel: content.permissions.complianceLevel,
        exportedAt: new Date().toISOString()
      }

      if (format.id === 'json') {
        return JSON.stringify({
          content: exportContent,
          metadata
        }, null, 2)
      } else if (format.id === 'csv') {
        return `Title,Type,Tags,Created,Updated\n"${content.title}","${content.type}","${content.tags.join(';')}","${content.createdAt.toISOString()}","${content.updatedAt.toISOString()}"\n\nContent\n"${exportContent.replace(/"/g, '""')}"`
      }
    }

    return exportContent
  }

  // Simulate export process
  const performExport = async () => {
    if (!selectedContent || !selectedFormat) return

    setIsExporting(true)
    setExportProgress(0)

    // Simulate export steps
    const steps = [
      { progress: 10, message: 'Preparing content...' },
      { progress: 30, message: 'Applying redaction rules...' },
      { progress: 50, message: 'Formatting content...' },
      { progress: 70, message: 'Adding compliance features...' },
      { progress: 90, message: 'Generating file...' },
      { progress: 100, message: 'Export complete!' }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setExportProgress(step.progress)
    }

    // Generate the export
    const exportContent = generateExportContent(selectedContent, selectedFormat)
    const fileName = `${selectedContent.title.replace(/[^a-zA-Z0-9]/g, '_')}${selectedFormat.extension}`
    
    // Create download link
    const blob = new Blob([exportContent], { 
      type: selectedFormat.id === 'json' ? 'application/json' : 
            selectedFormat.id === 'csv' ? 'text/csv' : 
            selectedFormat.id === 'txt' ? 'text/plain' : 'application/octet-stream'
    })
    const downloadUrl = URL.createObjectURL(blob)

    // Add to export history
    const exportRecord = {
      id: Date.now().toString(),
      contentId: selectedContent.id,
      format: selectedFormat.name,
      timestamp: new Date(),
      status: 'completed' as const,
      fileSize: blob.size,
      downloadUrl
    }

    setExportHistory(prev => [exportRecord, ...prev])
    setIsExporting(false)
    setExportProgress(0)

    // Trigger download
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Preview export content
  const generatePreview = () => {
    if (!selectedContent || !selectedFormat) return

    const previewContent = generateExportContent(selectedContent, selectedFormat)
    setPreviewContent(previewContent)
    setShowPreview(true)
  }

  // Add custom redaction rule
  const addCustomRedactionRule = () => {
    const newRule: RedactionRule = {
      id: Date.now().toString(),
      name: 'Custom Rule',
      type: 'custom',
      pattern: '',
      replacement: '[REDACTED]',
      enabled: true,
      priority: customRedactionRules.length + 1
    }
    setCustomRedactionRules(prev => [...prev, newRule])
  }

  // Update custom redaction rule
  const updateCustomRedactionRule = (id: string, updates: Partial<RedactionRule>) => {
    setCustomRedactionRules(prev => 
      prev.map(rule => rule.id === id ? { ...rule, ...updates } : rule)
    )
  }

  // Remove custom redaction rule
  const removeCustomRedactionRule = (id: string) => {
    setCustomRedactionRules(prev => prev.filter(rule => rule.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Workflow</h1>
          <p className="text-gray-600">Export content with privacy controls, compliance features, and multiple formats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Select Content</h2>
              <div className="space-y-3">
                {availableContent.map(content => (
                  <div
                    key={content.id}
                    onClick={() => setSelectedContent(content)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedContent?.id === content.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{content.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{content.type}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            content.permissions.complianceLevel === 'public' ? 'bg-green-100 text-green-800' :
                            content.permissions.complianceLevel === 'internal' ? 'bg-blue-100 text-blue-800' :
                            content.permissions.complianceLevel === 'confidential' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {content.permissions.complianceLevel}
                          </span>
                          {content.permissions.canRedact && (
                            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Export Format</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map(format => (
                  <div
                    key={format.id}
                    onClick={() => setSelectedFormat(format)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFormat?.id === format.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <format.icon className="w-6 h-6 text-gray-600" />
                      <div className="flex-1">
                        <h3 className="font-medium">{format.name}</h3>
                        <p className="text-sm text-gray-600">{format.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {format.supportsRedaction && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Redaction
                            </span>
                          )}
                          {format.supportsMetadata && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Metadata
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Settings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Compliance & Privacy</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={complianceSettings.includeAuditTrail}
                      onChange={(e) => setComplianceSettings(prev => ({
                        ...prev,
                        includeAuditTrail: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span>Include Audit Trail</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={complianceSettings.includeWatermark}
                      onChange={(e) => setComplianceSettings(prev => ({
                        ...prev,
                        includeWatermark: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span>Add Watermark</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={complianceSettings.includeMetadata}
                      onChange={(e) => setComplianceSettings(prev => ({
                        ...prev,
                        includeMetadata: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span>Include Metadata</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={complianceSettings.redactSensitiveData}
                      onChange={(e) => setComplianceSettings(prev => ({
                        ...prev,
                        redactSensitiveData: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span>Redact Sensitive Data</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Encryption Level</label>
                  <select
                    value={complianceSettings.encryptionLevel}
                    onChange={(e) => setComplianceSettings(prev => ({
                      ...prev,
                      encryptionLevel: e.target.value as any
                    }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="basic">Basic</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Redaction Rules */}
            {complianceSettings.redactSensitiveData && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Redaction Rules</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Default Rules</h3>
                    <div className="space-y-2">
                      {defaultRedactionRules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{rule.name}</span>
                            <p className="text-sm text-gray-600">{rule.pattern}</p>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => {
                                const updatedRules = defaultRedactionRules.map(r =>
                                  r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                                )
                                // Update the default rules (in a real app, this would be managed differently)
                              }}
                              className="rounded"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Custom Rules</h3>
                      <button
                        onClick={addCustomRedactionRule}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Add Rule
                      </button>
                    </div>
                    <div className="space-y-2">
                      {customRedactionRules.map(rule => (
                        <div key={rule.id} className="p-3 border rounded">
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={rule.name}
                              onChange={(e) => updateCustomRedactionRule(rule.id, { name: e.target.value })}
                              className="flex-1 border rounded px-2 py-1 text-sm"
                              placeholder="Rule name"
                            />
                            <button
                              onClick={() => removeCustomRedactionRule(rule.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={rule.pattern}
                              onChange={(e) => updateCustomRedactionRule(rule.id, { pattern: e.target.value })}
                              className="border rounded px-2 py-1 text-sm"
                              placeholder="Pattern (regex)"
                            />
                            <input
                              type="text"
                              value={rule.replacement}
                              onChange={(e) => updateCustomRedactionRule(rule.id, { replacement: e.target.value })}
                              className="border rounded px-2 py-1 text-sm"
                              placeholder="Replacement"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Export Actions</h2>
                {selectedContent && selectedFormat && (
                  <button
                    onClick={generatePreview}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <DocumentMagnifyingGlassIcon className="w-5 h-5 inline mr-1" />
                    Preview
                  </button>
                )}
              </div>

              {isExporting && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Exporting...</span>
                    <span className="text-sm text-gray-600">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={performExport}
                  disabled={!selectedContent || !selectedFormat || isExporting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 inline mr-2" />
                  Export Now
                </button>
              </div>
            </div>

            {/* Export History */}
            {exportHistory.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Export History</h2>
                <div className="space-y-3">
                  {exportHistory.slice(0, 5).map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{record.format}</span>
                        <p className="text-sm text-gray-600">
                          {record.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.status === 'completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                        {record.downloadUrl && (
                          <button
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = record.downloadUrl!
                              link.download = `export_${record.id}`
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Export Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-96">
                <pre className="text-sm bg-gray-50 p-4 rounded border whitespace-pre-wrap">
                  {previewContent}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 