'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  BellIcon,
  KeyIcon,
  ServerIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  FingerPrintIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlusIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface ComplianceRule {
  id: string
  name: string
  description: string
  type: 'hipaa' | 'ferpa' | 'gdpr' | 'soc2' | 'custom'
  status: 'active' | 'inactive' | 'draft'
  priority: 'low' | 'medium' | 'high' | 'critical'
  conditions: ComplianceCondition[]
  actions: ComplianceAction[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastTriggered?: Date
  triggerCount: number
}

interface ComplianceCondition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than'
  value: string
  logicalOperator?: 'and' | 'or'
}

interface ComplianceAction {
  id: string
  type: 'alert' | 'block' | 'log' | 'redact' | 'encrypt' | 'quarantine'
  parameters: Record<string, any>
  severity: 'info' | 'warning' | 'error' | 'critical'
}

interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: string
  resource: string
  resourceType: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  sessionId: string
  complianceLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  dataClassification: string[]
  success: boolean
  errorMessage?: string
  auditHash: string
  tamperDetected: boolean
}

interface SecurityAlert {
  id: string
  timestamp: Date
  type: 'compliance_violation' | 'access_denied' | 'suspicious_activity' | 'data_breach' | 'system_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  source: string
  affectedUsers: string[]
  affectedData: string[]
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  resolution?: string
  resolutionDate?: Date
}

interface AccessControl {
  id: string
  name: string
  description: string
  resource: string
  resourceType: string
  permissions: string[]
  users: string[]
  groups: string[]
  roles: string[]
  conditions: AccessCondition[]
  status: 'active' | 'inactive'
  createdAt: Date
  expiresAt?: Date
}

interface AccessCondition {
  id: string
  type: 'time' | 'location' | 'device' | 'network' | 'compliance'
  parameters: Record<string, any>
}

interface DataClassification {
  id: string
  name: string
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  description: string
  color: string
  autoDetection: boolean
  keywords: string[]
  patterns: string[]
  actions: string[]
}

interface EncryptionKey {
  id: string
  name: string
  type: 'aes' | 'rsa' | 'ecc'
  keySize: number
  status: 'active' | 'rotating' | 'expired'
  createdAt: Date
  expiresAt: Date
  lastRotated: Date
  usage: number
}

export default function ComplianceSecurityWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'compliance' | 'audit' | 'alerts' | 'access' | 'encryption' | 'settings'>('overview')
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [accessControls, setAccessControls] = useState<AccessControl[]>([])
  const [dataClassifications, setDataClassifications] = useState<DataClassification[]>([])
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([])
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Sample data
  const sampleComplianceRules: ComplianceRule[] = [
    {
      id: '1',
      name: 'HIPAA PHI Protection',
      description: 'Automatically detect and protect PHI data',
      type: 'hipaa',
      status: 'active',
      priority: 'critical',
      conditions: [
        {
          id: '1',
          field: 'content',
          operator: 'contains',
          value: 'patient|medical|diagnosis|treatment'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'redact',
          parameters: { pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b' },
          severity: 'critical'
        },
        {
          id: '2',
          type: 'alert',
          parameters: { recipients: ['security@company.com'] },
          severity: 'high'
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-01'),
      createdBy: 'admin@company.com',
      lastTriggered: new Date('2024-12-14T10:30:00'),
      triggerCount: 15
    },
    {
      id: '2',
      name: 'FERPA Student Data Protection',
      description: 'Protect student educational records',
      type: 'ferpa',
      status: 'active',
      priority: 'high',
      conditions: [
        {
          id: '1',
          field: 'content',
          operator: 'contains',
          value: 'student|grade|enrollment|academic'
        }
      ],
      actions: [
        {
          id: '1',
          type: 'encrypt',
          parameters: { algorithm: 'AES-256' },
          severity: 'high'
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-01'),
      createdBy: 'admin@company.com',
      lastTriggered: new Date('2024-12-13T14:20:00'),
      triggerCount: 8
    }
  ]

  const sampleAuditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date('2024-12-14T15:30:00'),
      userId: 'user1',
      userName: 'Alice Johnson',
      action: 'export_data',
      resource: 'meeting_transcript_123',
      resourceType: 'transcript',
      details: {
        format: 'PDF',
        pages: 5,
        redacted: true
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      sessionId: 'sess_123',
      complianceLevel: 'confidential',
      dataClassification: ['PHI', 'FERPA'],
      success: true,
      auditHash: 'hash_123456789',
      tamperDetected: false
    },
    {
      id: '2',
      timestamp: new Date('2024-12-14T14:45:00'),
      userId: 'user2',
      userName: 'Bob Smith',
      action: 'access_denied',
      resource: 'restricted_memory_456',
      resourceType: 'memory',
      details: {
        reason: 'insufficient_permissions',
        requiredLevel: 'restricted'
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      sessionId: 'sess_124',
      complianceLevel: 'restricted',
      dataClassification: ['PHI'],
      success: false,
      errorMessage: 'Access denied: insufficient permissions',
      auditHash: 'hash_987654321',
      tamperDetected: false
    }
  ]

  const sampleSecurityAlerts: SecurityAlert[] = [
    {
      id: '1',
      timestamp: new Date('2024-12-14T16:00:00'),
      type: 'compliance_violation',
      severity: 'high',
      title: 'PHI Data Detected in Export',
      description: 'Patient health information was detected in an export request',
      source: 'HIPAA PHI Protection Rule',
      affectedUsers: ['user1'],
      affectedData: ['meeting_transcript_123'],
      status: 'investigating',
      assignedTo: 'security@company.com'
    },
    {
      id: '2',
      timestamp: new Date('2024-12-14T15:30:00'),
      type: 'access_denied',
      severity: 'medium',
      title: 'Unauthorized Access Attempt',
      description: 'User attempted to access restricted memory without proper permissions',
      source: 'Access Control System',
      affectedUsers: ['user2'],
      affectedData: ['restricted_memory_456'],
      status: 'resolved',
      resolution: 'Access properly denied, no data breach occurred',
      resolutionDate: new Date('2024-12-14T15:35:00')
    }
  ]

  const sampleDataClassifications: DataClassification[] = [
    {
      id: '1',
      name: 'Public',
      level: 'public',
      description: 'Information that can be freely shared',
      color: '#10B981',
      autoDetection: false,
      keywords: [],
      patterns: [],
      actions: ['share', 'export']
    },
    {
      id: '2',
      name: 'Internal',
      level: 'internal',
      description: 'Company internal information',
      color: '#3B82F6',
      autoDetection: true,
      keywords: ['internal', 'company', 'proprietary'],
      patterns: ['\\b[A-Z]{2,}\\b'],
      actions: ['share', 'export', 'audit']
    },
    {
      id: '3',
      name: 'Confidential',
      level: 'confidential',
      description: 'Sensitive business information',
      color: '#F59E0B',
      autoDetection: true,
      keywords: ['confidential', 'secret', 'sensitive'],
      patterns: ['\\b\\d{3}-\\d{2}-\\d{4}\\b'],
      actions: ['audit', 'encrypt', 'redact']
    },
    {
      id: '4',
      name: 'Restricted',
      level: 'restricted',
      description: 'Highly sensitive information requiring special handling',
      color: '#EF4444',
      autoDetection: true,
      keywords: ['restricted', 'top-secret', 'classified'],
      patterns: ['\\b\\d{3}-\\d{2}-\\d{4}\\b', '\\b[A-Z]{2}\\d{6}\\b'],
      actions: ['audit', 'encrypt', 'redact', 'quarantine']
    }
  ]

  useEffect(() => {
    setComplianceRules(sampleComplianceRules)
    setAuditLogs(sampleAuditLogs)
    setSecurityAlerts(sampleSecurityAlerts)
    setDataClassifications(sampleDataClassifications)
  }, [])

  const createComplianceRule = (rule: Omit<ComplianceRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>) => {
    const newRule: ComplianceRule = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0
    }
    setComplianceRules(prev => [...prev, newRule])
  }

  const updateAlertStatus = (alertId: string, status: SecurityAlert['status'], resolution?: string) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status, 
            resolution,
            resolutionDate: status === 'resolved' ? new Date() : undefined
          }
        : alert
    ))
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {complianceRules.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Audit Events</p>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityAlerts.filter(a => a.status === 'open' || a.status === 'investigating').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <KeyIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Keys</p>
              <p className="text-2xl font-bold text-gray-900">
                {encryptionKeys.filter(k => k.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Security Alerts</h3>
          <div className="space-y-3">
            {securityAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="font-medium text-sm">{alert.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {alert.timestamp.toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.status === 'open' ? 'bg-red-100 text-red-800' :
                  alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
          <div className="space-y-4">
            {['hipaa', 'ferpa', 'gdpr', 'soc2'].map(standard => (
              <div key={standard} className="flex items-center justify-between">
                <span className="capitalize font-medium">{standard.toUpperCase()}</span>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600">Compliant</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Compliance Rules</h2>
        <button
          onClick={() => setShowRuleModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          Create Rule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="space-y-4">
            {complianceRules
              .filter(rule => 
                (filterStatus === 'all' || rule.status === filterStatus) &&
                (filterSeverity === 'all' || rule.priority === filterSeverity) &&
                (searchTerm === '' || rule.name.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map(rule => (
                <div key={rule.id} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.type === 'hipaa' ? 'bg-red-100 text-red-800' :
                        rule.type === 'ferpa' ? 'bg-blue-100 text-blue-800' :
                        rule.type === 'gdpr' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rule.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.status === 'active' ? 'bg-green-100 text-green-800' :
                        rule.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rule.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedRule(rule)
                          setShowRuleModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{rule.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Triggers: {rule.triggerCount}</span>
                    <span>Last triggered: {rule.lastTriggered?.toLocaleString() || 'Never'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAudit = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Audit Logs</h2>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search audit logs..."
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <select className="px-3 py-2 border rounded">
              <option>All Actions</option>
              <option>Access</option>
              <option>Export</option>
              <option>Modify</option>
              <option>Delete</option>
            </select>
            <select className="px-3 py-2 border rounded">
              <option>All Users</option>
              <option>Alice Johnson</option>
              <option>Bob Smith</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Timestamp</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Resource</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 text-sm">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="py-2 text-sm">{log.userName}</td>
                    <td className="py-2 text-sm">{log.action}</td>
                    <td className="py-2 text-sm">{log.resource}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.complianceLevel === 'restricted' ? 'bg-red-100 text-red-800' :
                        log.complianceLevel === 'confidential' ? 'bg-orange-100 text-orange-800' :
                        log.complianceLevel === 'internal' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {log.complianceLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Alerts</h2>
        <button
          onClick={() => setShowAlertModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          Create Alert
        </button>
      </div>

      <div className="space-y-4">
        {securityAlerts.map(alert => (
          <div key={alert.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`w-3 h-3 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <h3 className="font-semibold">{alert.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{alert.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Source: {alert.source}</p>
                  <p>Affected Users: {alert.affectedUsers.join(', ')}</p>
                  <p>Timestamp: {alert.timestamp.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.status === 'open' ? 'bg-red-100 text-red-800' :
                  alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {alert.status}
                </span>
                <button
                  onClick={() => {
                    setSelectedAlert(alert)
                    setShowAlertModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            {alert.resolution && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Resolution:</p>
                <p className="text-sm text-gray-600">{alert.resolution}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAccess = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Access Controls</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Data Classifications</h3>
          <div className="space-y-3">
            {dataClassifications.map(classification => (
              <div key={classification.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: classification.color }}
                  />
                  <div>
                    <p className="font-medium">{classification.name}</p>
                    <p className="text-sm text-gray-600">{classification.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{classification.actions.length} actions</p>
                  <p className="text-xs text-gray-500">
                    {classification.autoDetection ? 'Auto-detect' : 'Manual'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Access Permissions</h3>
          <div className="space-y-3">
            {accessControls.map(control => (
              <div key={control.id} className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{control.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    control.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {control.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{control.description}</p>
                <div className="text-xs text-gray-500">
                  <p>Resource: {control.resource}</p>
                  <p>Users: {control.users.length}</p>
                  <p>Groups: {control.groups.length}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderEncryption = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Encryption Management</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Encryption Keys</h3>
        <div className="space-y-4">
          {encryptionKeys.map(key => (
            <div key={key.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium">{key.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    key.status === 'active' ? 'bg-green-100 text-green-800' :
                    key.status === 'rotating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {key.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Type: {key.type.toUpperCase()} • Size: {key.keySize} bits</p>
                  <p>Usage: {key.usage} operations • Last rotated: {key.lastRotated.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Expires: {key.expiresAt.toLocaleDateString()}</p>
                {key.status === 'active' && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Rotate Key
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">General Security</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Enable audit logging</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Enable tamper detection</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Enable automatic key rotation</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded" />
              <span className="ml-2">Enable emergency shutdown</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Compliance Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Data Classification</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Internal</option>
                <option>Confidential</option>
                <option>Restricted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Audit Retention Period</label>
              <select className="w-full border rounded px-3 py-2">
                <option>1 year</option>
                <option>3 years</option>
                <option>7 years</option>
                <option>Indefinite</option>
              </select>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance & Security</h1>
          <p className="text-gray-600">Enterprise security, compliance monitoring, and audit management</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
              { id: 'compliance', label: 'Compliance', icon: DocumentTextIcon },
              { id: 'audit', label: 'Audit Logs', icon: ArchiveBoxIcon },
              { id: 'alerts', label: 'Alerts', icon: BellIcon },
              { id: 'access', label: 'Access Control', icon: LockClosedIcon },
              { id: 'encryption', label: 'Encryption', icon: KeyIcon },
              { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
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
        {currentView === 'overview' && renderOverview()}
        {currentView === 'compliance' && renderCompliance()}
        {currentView === 'audit' && renderAudit()}
        {currentView === 'alerts' && renderAlerts()}
        {currentView === 'access' && renderAccess()}
        {currentView === 'encryption' && renderEncryption()}
        {currentView === 'settings' && renderSettings()}
      </div>
    </div>
  )
} 