'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon, 
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  ShareIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

interface TeamStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
}

interface TeamWorkflowProps {
  onComplete: (team: any) => void
  onCancel: () => void
  workflowType: 'collaborate' | 'approve' | 'share' | 'track' | 'digest' | 'mention' | 'delegate' | 'assign' | 'status' | 'feedback'
}

export default function TeamWorkflow({ onComplete, onCancel, workflowType }: TeamWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [team, setTeam] = useState<any>({})
  const [steps, setSteps] = useState<TeamStep[]>(getWorkflowSteps(workflowType))
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])

  function getWorkflowSteps(type: string): TeamStep[] {
    switch (type) {
      case 'collaborate':
        return [
          { id: 'setup', title: 'Setup Session', description: 'Initialize collaborative workspace', icon: UserGroupIcon, status: 'pending', progress: 0 },
          { id: 'invite', title: 'Invite Contributors', description: 'Add team members to session', icon: UserIcon, status: 'pending', progress: 0 },
          { id: 'collaborate', title: 'Real-time Collaboration', description: 'Work together live', icon: ChatBubbleLeftRightIcon, status: 'pending', progress: 0 }
        ]
      case 'approve':
        return [
          { id: 'select', title: 'Select Content', description: 'Choose content for approval', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'approvers', title: 'Assign Approvers', description: 'Set up approval workflow', icon: UserGroupIcon, status: 'pending', progress: 0 },
          { id: 'review', title: 'Review Process', description: 'Sequential or parallel sign-off', icon: CheckIcon, status: 'pending', progress: 0 }
        ]
      case 'share':
        return [
          { id: 'content', title: 'Select Content', description: 'Choose what to share', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'roles', title: 'Set Roles', description: 'Define access permissions', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'invite', title: 'Send Invites', description: 'Invite team members', icon: ShareIcon, status: 'pending', progress: 0 }
        ]
      case 'track':
        return [
          { id: 'identify', title: 'Identify Items', description: 'Flag memory items for tracking', icon: EyeIcon, status: 'pending', progress: 0 },
          { id: 'promote', title: 'Auto-Promote', description: 'Convert to action items', icon: ArrowPathIcon, status: 'pending', progress: 0 },
          { id: 'monitor', title: 'Monitor Progress', description: 'Track completion status', icon: ClockIcon, status: 'pending', progress: 0 }
        ]
      case 'digest':
        return [
          { id: 'select', title: 'Select Content', description: 'Choose content for digest', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'generate', title: 'Generate Digest', description: 'AI creates team summary', icon: CogIcon, status: 'pending', progress: 0 },
          { id: 'edit', title: 'Edit & Send', description: 'Review and distribute', icon: BellIcon, status: 'pending', progress: 0 }
        ]
      case 'mention':
        return [
          { id: 'mention', title: 'Mention Teammate', description: 'Tag team member in workflow', icon: UserIcon, status: 'pending', progress: 0 },
          { id: 'preview', title: 'Inline Preview', description: 'Show mention context', icon: EyeIcon, status: 'pending', progress: 0 },
          { id: 'notify', title: 'Send Notification', description: 'Deliver mention alert', icon: BellIcon, status: 'pending', progress: 0 }
        ]
      case 'delegate':
        return [
          { id: 'select', title: 'Select Task', description: 'Choose task to delegate', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'assignee', title: 'Choose Assignee', description: 'Select team member', icon: UserIcon, status: 'pending', progress: 0 },
          { id: 'track', title: 'Track Status', description: 'Monitor task progress', icon: ClockIcon, status: 'pending', progress: 0 }
        ]
      case 'assign':
        return [
          { id: 'select', title: 'Select Workflow', description: 'Choose workflow to assign', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'team', title: 'Assign Team', description: 'Select team members', icon: UserGroupIcon, status: 'pending', progress: 0 },
          { id: 'configure', title: 'Configure Access', description: 'Set permissions and roles', icon: CogIcon, status: 'pending', progress: 0 }
        ]
      case 'status':
        return [
          { id: 'setup', title: 'Setup Visibility', description: 'Configure status tracking', icon: EyeIcon, status: 'pending', progress: 0 },
          { id: 'monitor', title: 'Monitor Status', description: 'Track live status updates', icon: ClockIcon, status: 'pending', progress: 0 },
          { id: 'notify', title: 'Status Notifications', description: 'Alert on status changes', icon: BellIcon, status: 'pending', progress: 0 }
        ]
      case 'feedback':
        return [
          { id: 'annotate', title: 'Annotate Content', description: 'Add feedback annotations', icon: DocumentTextIcon, status: 'pending', progress: 0 },
          { id: 'suggest', title: 'Make Suggestions', description: 'Propose improvements', icon: ChatBubbleLeftRightIcon, status: 'pending', progress: 0 },
          { id: 'approve', title: 'Approve Changes', description: 'Review and approve', icon: CheckIcon, status: 'pending', progress: 0 },
          { id: 'apply', title: 'Apply Changes', description: 'Implement approved feedback', icon: ArrowPathIcon, status: 'pending', progress: 0 }
        ]
      default:
        return []
    }
  }

  const simulateProcessing = async (stepIndex: number, duration: number) => {
    setIsProcessing(true)
    setSteps(prev => {
      const newSteps = [...prev]
      newSteps[stepIndex] = { ...newSteps[stepIndex], status: 'in-progress', progress: 0 }
      return newSteps
    })

    const interval = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev]
        const currentProgress = newSteps[stepIndex].progress
        if (currentProgress < 90) {
          newSteps[stepIndex] = { ...newSteps[stepIndex], progress: currentProgress + 10 }
        }
        return newSteps
      })
    }, duration / 10)

    setTimeout(() => {
      clearInterval(interval)
      setSteps(prev => {
        const newSteps = [...prev]
        newSteps[stepIndex] = { ...newSteps[stepIndex], status: 'completed', progress: 100 }
        return newSteps
      })
      setIsProcessing(false)
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1)
      } else {
        handleWorkflowComplete()
      }
    }, duration)
  }

  const handleWorkflowComplete = () => {
    const completedTeam = {
      id: `team-${Date.now()}`,
      name: team.name || `${workflowType} Session`,
      type: workflowType,
      status: 'completed',
      createdAt: new Date(),
      collaborators: collaborators,
      approvals: approvals
    }
    onComplete(completedTeam)
  }

  const getStepContent = () => {
    const step = steps[currentStep]
    
    switch (workflowType) {
      case 'collaborate':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Setup Collaborative Session</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Project Planning Session"
                      value={team.sessionName || ''}
                      onChange={(e) => setTeam((prev: any) => ({ ...prev, sessionName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Type
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>Note taking</option>
                      <option>Brainstorming</option>
                      <option>Document review</option>
                      <option>Project planning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Invite Contributors</h4>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Project Manager' },
                      { name: 'Mike Chen', email: 'mike@company.com', role: 'Developer' },
                      { name: 'Lisa Rodriguez', email: 'lisa@company.com', role: 'Designer' }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email} • {member.role}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Invited</span>
                          <button className="text-red-600 hover:text-red-800">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Live Collaboration</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-800 font-medium">Live Session Active</span>
                    </div>
                    <p className="text-sm text-blue-700">3 participants • Started 5 minutes ago</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">SJ</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">Sarah Johnson is typing...</div>
                        <div className="text-xs text-gray-500">2 seconds ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">MC</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">Mike Chen added a comment</div>
                        <div className="text-xs text-gray-500">1 minute ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'approve':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Content for Approval</h4>
                <div className="space-y-3">
                  {[
                    { title: 'Q4 Marketing Strategy', type: 'Document', status: 'Pending Approval' },
                    { title: 'Product Roadmap 2024', type: 'Presentation', status: 'Draft' },
                    { title: 'Budget Proposal', type: 'Spreadsheet', status: 'Ready for Review' }
                  ].map((content, index) => (
                    <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <input
                        type="radio"
                        name="content"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        onChange={() => setTeam((prev: any) => ({ ...prev, selectedContent: content }))}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{content.title}</div>
                        <div className="text-sm text-gray-500">{content.type} • {content.status}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Assign Approvers</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Type
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>Sequential (one after another)</option>
                      <option>Parallel (all at once)</option>
                      <option>Hybrid (some sequential, some parallel)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'John Smith', role: 'Department Head', order: 1 },
                      { name: 'Maria Garcia', role: 'Legal Review', order: 2 },
                      { name: 'David Kim', role: 'Finance', order: 3 }
                    ].map((approver, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{approver.name}</div>
                          <div className="text-sm text-gray-500">{approver.role}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Step {approver.order}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <CogIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Approval Process</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">Approval in Progress</span>
                    </div>
                    <p className="text-sm text-blue-700">Waiting for John Smith (Department Head)</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">JS</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">John Smith</div>
                          <div className="text-sm text-gray-500">Department Head</div>
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">MG</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Maria Garcia</div>
                          <div className="text-sm text-gray-500">Legal Review</div>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Waiting</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">DK</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">David Kim</div>
                          <div className="text-sm text-gray-500">Finance</div>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Waiting</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'share':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Content to Share</h4>
                <div className="space-y-3">
                  {[
                    { title: 'Project Documentation', type: 'Notebook', size: '2.3 MB' },
                    { title: 'Meeting Notes - Q4 Planning', type: 'Memory', size: '156 KB' },
                    { title: 'Research Findings', type: 'Document', size: '1.1 MB' }
                  ].map((content, index) => (
                    <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{content.title}</div>
                        <div className="text-sm text-gray-500">{content.type} • {content.size}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Set Access Roles</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Permission Level
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>View Only</option>
                      <option>Comment</option>
                      <option>Edit</option>
                      <option>Admin</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Marketing Team', role: 'Edit', members: 8 },
                      { name: 'Development Team', role: 'View Only', members: 12 },
                      { name: 'Leadership', role: 'Admin', members: 3 }
                    ].map((team, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">{team.members} members</div>
                        </div>
                        <select className="p-2 border border-gray-300 rounded-md">
                          <option>View Only</option>
                          <option>Comment</option>
                          <option>Edit</option>
                          <option>Admin</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Send Invitations</h4>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckIcon className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Ready to Share</span>
                    </div>
                    <p className="text-sm text-green-700">3 teams • 23 total members</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">Marketing Team</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">8 invites sent</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">Development Team</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">12 invites sent</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">Leadership</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">3 invites sent</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'track':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Identify Memory Items</h4>
                <div className="space-y-3">
                  {[
                    { title: 'Follow up with client about proposal', type: 'Action Item', priority: 'High' },
                    { title: 'Review competitor analysis', type: 'Task', priority: 'Medium' },
                    { title: 'Schedule team meeting', type: 'Reminder', priority: 'Low' },
                    { title: 'Update project timeline', type: 'Action Item', priority: 'High' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.type}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Auto-Promote to Action Items</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <ArrowPathIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">Converting to Action Items</span>
                    </div>
                    <p className="text-sm text-blue-700">4 items selected for promotion</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-green-200 rounded-md bg-green-50">
                      <div>
                        <div className="font-medium text-green-900">Follow up with client about proposal</div>
                        <div className="text-sm text-green-700">Action Item • High Priority</div>
                      </div>
                      <CheckIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-green-200 rounded-md bg-green-50">
                      <div>
                        <div className="font-medium text-green-900">Update project timeline</div>
                        <div className="text-sm text-green-700">Action Item • High Priority</div>
                      </div>
                      <CheckIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Monitor Progress</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h6 className="font-medium text-gray-900 mb-2">Action Items Overview</h6>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">4</div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">2</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">2</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <div className="font-medium text-gray-900">Follow up with client about proposal</div>
                        <div className="text-sm text-gray-500">Assigned to: Sarah Johnson</div>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">In Progress</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <div className="font-medium text-gray-900">Update project timeline</div>
                        <div className="text-sm text-gray-500">Assigned to: Mike Chen</div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'digest':
        return (
          <div className="space-y-6">
            {currentStep === 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Content for Digest</h4>
                <div className="space-y-3">
                  {[
                    { title: 'Weekly Team Updates', type: 'Collection', items: 12 },
                    { title: 'Project Milestones', type: 'Collection', items: 8 },
                    { title: 'Research Notes', type: 'Collection', items: 15 }
                  ].map((content, index) => (
                    <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{content.title}</div>
                        <div className="text-sm text-gray-500">{content.type} • {content.items} items</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Generated Digest</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <CogIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">AI Digest Generated</span>
                    </div>
                    <p className="text-sm text-blue-700">Summarized 35 items into key insights</p>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded-md">
                      <h6 className="font-medium text-gray-900 mb-2">Key Highlights</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Project Alpha reached 75% completion milestone</li>
                        <li>• 3 new team members joined this week</li>
                        <li>• Client feedback score improved to 4.8/5</li>
                      </ul>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-md">
                      <h6 className="font-medium text-gray-900 mb-2">Action Items</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Schedule project review meeting</li>
                        <li>• Prepare onboarding materials for new hires</li>
                        <li>• Follow up on client satisfaction survey</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Edit & Send Digest</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digest Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      defaultValue="Weekly Team Digest - January 15, 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>All Team Members (23 people)</option>
                      <option>Leadership Only (3 people)</option>
                      <option>Project Teams (15 people)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send Time
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option>Send now</option>
                      <option>Schedule for tomorrow 9:00 AM</option>
                      <option>Schedule for Friday 5:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <div>Unknown workflow type</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {workflowType.charAt(0).toUpperCase() + workflowType.slice(1)} Team Workflow
            </h1>
            <p className="text-gray-600 mt-2">
              Complete this team workflow in {steps.length} steps or less
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                step.status === 'in-progress' ? 'bg-blue-500 border-blue-500 text-white' :
                'bg-white border-gray-300 text-gray-400'
              }`}>
                {step.status === 'completed' ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div key={step.id} className="text-center">
              <div className="text-sm font-medium text-gray-900">{step.title}</div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isProcessing}
              >
                Previous
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => simulateProcessing(currentStep, 2000)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleWorkflowComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 