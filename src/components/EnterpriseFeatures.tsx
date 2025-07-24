import React, { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  LockClosedIcon,
  EyeIcon,
  KeyIcon,
  ServerIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

interface SecurityCompliance {
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted'
  compliance_frameworks: string[]
  security_measures: string[]
  audit_requirements: string[]
  retention_policy: {
    duration: string
    auto_deletion: boolean
    archival_requirements: string[]
  }
  access_controls: {
    encryption: boolean
    authentication: string[]
    authorization_levels: string[]
  }
}

interface TeamCollaborationAnalytics {
  team_performance: {
    overall_score: number
    communication_effectiveness: number
    decision_making_speed: number
    collaboration_patterns: string[]
  }
  individual_contributions: Array<{
    participant: string
    contribution_score: number
    engagement_level: number
    expertise_areas: string[]
    collaboration_style: string
  }>
  team_dynamics: {
    leadership_effectiveness: number
    conflict_resolution: number
    consensus_building: number
    innovation_level: number
  }
  recommendations: string[]
}

interface EnterpriseFeaturesProps {
  userId: string
  organization: string
}

export default function EnterpriseFeatures({ userId, organization }: EnterpriseFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'security' | 'compliance' | 'team' | 'audit'>('security')
  const [securityData, setSecurityData] = useState<SecurityCompliance | null>(null)
  const [teamAnalytics, setTeamAnalytics] = useState<TeamCollaborationAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'restricted':
        return 'text-red-600 bg-red-100'
      case 'confidential':
        return 'text-orange-600 bg-orange-100'
      case 'internal':
        return 'text-yellow-600 bg-yellow-100'
      case 'public':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return 'bg-green-100'
    if (score >= 0.6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const handleSecurityAssessment = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'security_compliance',
          data: {
            meetingData: { transcript: 'Sample meeting transcript for assessment' },
            organization,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSecurityData(data.result)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Security assessment failed')
      }
    } catch (error) {
      console.error('Security assessment failed:', error)
      setError(error instanceof Error ? error.message : 'Security assessment failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTeamAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'team_collaboration',
          data: {
            meetings: [],
            teamMembers: ['User 1', 'User 2', 'User 3'],
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTeamAnalytics(data.result)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Team analysis failed')
      }
    } catch (error) {
      console.error('Team analysis failed:', error)
      setError(error instanceof Error ? error.message : 'Team analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enterprise Features</h2>
          <p className="text-gray-600">Advanced security, compliance, and team analytics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{organization}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Security</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'compliance'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <LockClosedIcon className="w-4 h-4" />
              <span>Compliance</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'team'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-4 h-4" />
              <span>Team Analytics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-4 h-4" />
              <span>Audit</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Security Assessment</h3>
            <button
              onClick={handleSecurityAssessment}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ShieldCheckIcon className="w-4 h-4" />
              )}
              <span>{loading ? 'Assessing...' : 'Run Assessment'}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {securityData && (
            <div className="grid gap-6">
              {/* Data Classification */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Data Classification</h4>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(securityData.data_classification)}`}>
                    {securityData.data_classification.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {securityData.data_classification === 'restricted' && 'Highest security level required'}
                    {securityData.data_classification === 'confidential' && 'Sensitive business information'}
                    {securityData.data_classification === 'internal' && 'Company internal use only'}
                    {securityData.data_classification === 'public' && 'Publicly accessible information'}
                  </span>
                </div>
              </div>

              {/* Security Measures */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Security Measures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {securityData.security_measures.map((measure, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{measure}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Controls */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Access Controls</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Encryption</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      securityData.access_controls.encryption 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {securityData.access_controls.encryption ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Authentication Methods:</span>
                    <div className="mt-2 space-y-1">
                      {securityData.access_controls.authentication.map((method, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <KeyIcon className="w-3 h-3 text-blue-600" />
                          <span className="text-sm text-gray-700">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Authorization Levels:</span>
                    <div className="mt-2 space-y-1">
                      {securityData.access_controls.authorization_levels.map((level, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <EyeIcon className="w-3 h-3 text-purple-600" />
                          <span className="text-sm text-gray-700">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Compliance Framework</h3>

          {securityData ? (
            <div className="grid gap-6">
              {/* Compliance Frameworks */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance Frameworks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {securityData.compliance_frameworks.map((framework, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{framework}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Requirements */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Audit Requirements</h4>
                <div className="space-y-3">
                  {securityData.audit_requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <ClockIcon className="w-4 h-4 text-orange-600 mt-0.5" />
                      <span className="text-sm text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention Policy */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Retention Policy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention Duration</span>
                    <span className="text-sm font-medium text-gray-900">{securityData.retention_policy.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auto Deletion</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      securityData.retention_policy.auto_deletion 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {securityData.retention_policy.auto_deletion ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Archival Requirements:</span>
                    <div className="mt-2 space-y-1">
                      {securityData.retention_policy.archival_requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <ServerIcon className="w-3 h-3 text-gray-600" />
                          <span className="text-sm text-gray-700">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <LockClosedIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Compliance Data</h3>
              <p className="text-gray-600">Run a security assessment to view compliance information</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Team Collaboration Analytics</h3>
            <button
              onClick={handleTeamAnalysis}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserGroupIcon className="w-4 h-4" />
              )}
              <span>{loading ? 'Analyzing...' : 'Analyze Team'}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {teamAnalytics && (
            <div className="grid gap-6">
              {/* Team Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Overall Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(teamAnalytics.team_performance.overall_score)}`}>
                      {(teamAnalytics.team_performance.overall_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Communication</p>
                    <p className={`text-2xl font-bold ${getScoreColor(teamAnalytics.team_performance.communication_effectiveness)}`}>
                      {(teamAnalytics.team_performance.communication_effectiveness * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Decision Speed</p>
                    <p className={`text-2xl font-bold ${getScoreColor(teamAnalytics.team_performance.decision_making_speed)}`}>
                      {(teamAnalytics.team_performance.decision_making_speed * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Collaboration</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {teamAnalytics.team_performance.collaboration_patterns.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Contributions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Individual Contributions</h4>
                <div className="space-y-4">
                  {teamAnalytics.individual_contributions.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.participant.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.participant}</p>
                          <p className="text-sm text-gray-600">{member.collaboration_style}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {(member.contribution_score * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-600">
                          {(member.engagement_level * 100).toFixed(0)}% engaged
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Dynamics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Team Dynamics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Leadership Effectiveness</span>
                      <span className={`text-sm font-medium ${getScoreColor(teamAnalytics.team_dynamics.leadership_effectiveness)}`}>
                        {(teamAnalytics.team_dynamics.leadership_effectiveness * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conflict Resolution</span>
                      <span className={`text-sm font-medium ${getScoreColor(teamAnalytics.team_dynamics.conflict_resolution)}`}>
                        {(teamAnalytics.team_dynamics.conflict_resolution * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Consensus Building</span>
                      <span className={`text-sm font-medium ${getScoreColor(teamAnalytics.team_dynamics.consensus_building)}`}>
                        {(teamAnalytics.team_dynamics.consensus_building * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Innovation Level</span>
                      <span className={`text-sm font-medium ${getScoreColor(teamAnalytics.team_dynamics.innovation_level)}`}>
                        {(teamAnalytics.team_dynamics.innovation_level * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h4>
                <div className="space-y-2">
                  {teamAnalytics.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Audit Trail & Monitoring</h3>
          
          <div className="grid gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <EyeIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Security Assessment Run</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Completed</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Team Analysis Completed</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Completed</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <LockClosedIcon className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Compliance Check</p>
                      <p className="text-xs text-gray-600">3 days ago</p>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Pending</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Audit Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Audit Logging</span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Retention Period</span>
                  <span className="text-sm font-medium text-gray-900">7 years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Real-time Monitoring</span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alert Threshold</span>
                  <span className="text-sm font-medium text-gray-900">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 