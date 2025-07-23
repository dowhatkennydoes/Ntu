'use client'

import { useState, useEffect } from 'react'
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BellIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowPathIcon,
  CloudIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,

  CodeBracketIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  FlagIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  tags: string[]
  dueDate: Date
  estimatedTime: number // in minutes
  actualTime: number // in minutes
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  assignedTo: string
  createdBy: string
  reminders: Reminder[]
  timeEntries: TimeEntry[]
  subtasks: Subtask[]
  dependencies: string[]
  notes: string
  attachments: string[]
  recurring: RecurringSettings
  productivity: ProductivityMetrics
}

interface Reminder {
  id: string
  type: 'email' | 'push' | 'sms' | 'calendar'
  time: Date
  sent: boolean
  message: string
}

interface TimeEntry {
  id: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  notes: string
  tags: string[]
}

interface Subtask {
  id: string
  title: string
  completed: boolean
  dueDate?: Date
  estimatedTime?: number
  actualTime?: number
}

interface RecurringSettings {
  enabled: boolean
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval: number
  endDate?: Date
  maxOccurrences?: number
}

interface ProductivityMetrics {
  focusTime: number
  breaks: number
  efficiency: number
  distractions: number
  completionRate: number
  averageSessionLength: number
}

interface Project {
  id: string
  name: string
  description: string
  tasks: string[]
  startDate: Date
  endDate?: Date
  status: 'active' | 'completed' | 'on_hold'
  progress: number
}

export default function PunctualTaskManagerWorkflow() {
  const [currentView, setCurrentView] = useState<'overview' | 'tasks' | 'calendar' | 'analytics' | 'settings'>('overview')
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTimer, setCurrentTimer] = useState<{ taskId: string; startTime: Date } | null>(null)

  // Sample tasks
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Q4 Strategy Review',
      description: 'Review and finalize the Q4 strategy document with stakeholders',
      status: 'in_progress',
      priority: 'high',
      category: 'Strategy',
      tags: ['strategy', 'q4', 'review'],
      dueDate: new Date('2024-12-20'),
      estimatedTime: 120,
      actualTime: 45,
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-14'),
      assignedTo: 'Alice Johnson',
      createdBy: 'Bob Smith',
      reminders: [
        {
          id: 'rem-1',
          type: 'email',
          time: new Date('2024-12-19T09:00:00'),
          sent: false,
          message: 'Q4 Strategy Review due tomorrow'
        }
      ],
      timeEntries: [
        {
          id: 'time-1',
          startTime: new Date('2024-12-14T10:00:00'),
          endTime: new Date('2024-12-14T10:45:00'),
          duration: 45,
          notes: 'Initial review and stakeholder consultation',
          tags: ['review', 'stakeholder']
        }
      ],
      subtasks: [
        {
          id: 'sub-1',
          title: 'Gather stakeholder feedback',
          completed: true,
          estimatedTime: 30,
          actualTime: 25
        },
        {
          id: 'sub-2',
          title: 'Update strategy document',
          completed: false,
          estimatedTime: 60,
          actualTime: 20
        },
        {
          id: 'sub-3',
          title: 'Final review and approval',
          completed: false,
          estimatedTime: 30
        }
      ],
      dependencies: [],
      notes: 'Need to coordinate with marketing team for final approval',
      attachments: ['strategy-doc.pdf', 'feedback-summary.docx'],
      recurring: {
        enabled: false,
        pattern: 'monthly',
        interval: 1
      },
      productivity: {
        focusTime: 45,
        breaks: 2,
        efficiency: 0.85,
        distractions: 1,
        completionRate: 0.33,
        averageSessionLength: 45
      }
    },
    {
      id: '2',
      title: 'Weekly Team Meeting',
      description: 'Regular team sync to discuss progress and blockers',
      status: 'pending',
      priority: 'medium',
      category: 'Meetings',
      tags: ['meeting', 'team', 'sync'],
      dueDate: new Date('2024-12-16T14:00:00'),
      estimatedTime: 60,
      actualTime: 0,
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-14'),
      assignedTo: 'Alice Johnson',
      createdBy: 'Alice Johnson',
      reminders: [
        {
          id: 'rem-2',
          type: 'push',
          time: new Date('2024-12-16T13:45:00'),
          sent: false,
          message: 'Team meeting in 15 minutes'
        }
      ],
      timeEntries: [],
      subtasks: [
        {
          id: 'sub-4',
          title: 'Prepare agenda',
          completed: false,
          estimatedTime: 15
        },
        {
          id: 'sub-5',
          title: 'Send meeting invite',
          completed: true,
          estimatedTime: 5,
          actualTime: 5
        }
      ],
      dependencies: [],
      notes: 'Focus on Q4 progress and Q1 planning',
      attachments: [],
      recurring: {
        enabled: true,
        pattern: 'weekly',
        interval: 1
      },
      productivity: {
        focusTime: 0,
        breaks: 0,
        efficiency: 0,
        distractions: 0,
        completionRate: 0.5,
        averageSessionLength: 0
      }
    }
  ]

  // Sample projects
  const sampleProjects: Project[] = [
    {
      id: '1',
      name: 'Q4 Strategy Implementation',
      description: 'Implement the Q4 strategic initiatives across all departments',
      tasks: ['1', '3', '4'],
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      status: 'active',
      progress: 65
    }
  ]

  useEffect(() => {
    setTasks(sampleTasks)
    setProjects(sampleProjects)
  }, [])

  // Create new task
  const createTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: 'pending',
      priority: 'medium',
      category: taskData.category || 'General',
      tags: taskData.tags || [],
      dueDate: taskData.dueDate || new Date(),
      estimatedTime: taskData.estimatedTime || 60,
      actualTime: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedTo: taskData.assignedTo || 'Current User',
      createdBy: 'Current User',
      reminders: [],
      timeEntries: [],
      subtasks: [],
      dependencies: taskData.dependencies || [],
      notes: taskData.notes || '',
      attachments: taskData.attachments || [],
      recurring: {
        enabled: false,
        pattern: 'daily',
        interval: 1
      },
      productivity: {
        focusTime: 0,
        breaks: 0,
        efficiency: 0,
        distractions: 0,
        completionRate: 0,
        averageSessionLength: 0
      }
    }
    setTasks(prev => [...prev, newTask])
    setShowTaskModal(false)
  }

  // Start timer
  const startTimer = (taskId: string) => {
    setIsTimerRunning(true)
    setCurrentTimer({ taskId, startTime: new Date() })
    console.log(`Started timer for task: ${taskId}`)
  }

  // Stop timer
  const stopTimer = () => {
    if (currentTimer) {
      const endTime = new Date()
      const duration = Math.round((endTime.getTime() - currentTimer.startTime.getTime()) / 60000)
      
      setTasks(prev => prev.map(task => 
        task.id === currentTimer.taskId 
          ? {
              ...task,
              actualTime: task.actualTime + duration,
              timeEntries: [...task.timeEntries, {
                id: Date.now().toString(),
                startTime: currentTimer.startTime,
                endTime,
                duration,
                notes: '',
                tags: []
              }]
            }
          : task
      ))
      
      setIsTimerRunning(false)
      setCurrentTimer(null)
      console.log(`Stopped timer. Duration: ${duration} minutes`)
    }
  }

  // Update task status
  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status,
            updatedAt: new Date(),
            completedAt: status === 'completed' ? new Date() : undefined
          }
        : task
    ))
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ListBulletIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
          <div className="space-y-3">
            {tasks
              .filter(task => {
                const today = new Date()
                const taskDate = new Date(task.dueDate)
                return taskDate.toDateString() === today.toDateString()
              })
              .slice(0, 5)
              .map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => stopTimer()}
                        className="text-red-600 hover:text-red-800"
                      >
                        <StopIcon className="w-4 h-4" />
                      </button>
                    )}
                    {task.status === 'pending' && (
                      <button
                        onClick={() => startTimer(task.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Productivity Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Focus Time Today</span>
                <span>{tasks.reduce((acc, task) => acc + task.productivity.focusTime, 0)} min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Task Completion Rate</span>
                <span>{(tasks.filter(t => t.status === 'completed').length / tasks.length * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${tasks.filter(t => t.status === 'completed').length / tasks.length * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Efficiency</span>
                <span>{(tasks.reduce((acc, task) => acc + task.productivity.efficiency, 0) / tasks.length * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <div className="flex items-center space-x-2">
          {isTimerRunning && (
            <div className="flex items-center space-x-2 bg-red-100 px-3 py-2 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700">Timer Running</span>
              <button
                onClick={stopTimer}
                className="text-red-600 hover:text-red-800"
              >
                <StopIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            New Task
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="space-y-4">
          {tasks
            .filter(task => 
              (filterStatus === 'all' || task.status === filterStatus) &&
              (filterPriority === 'all' || task.priority === filterPriority) &&
              (searchTerm === '' || task.title.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map(task => (
              <div key={task.id} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {task.actualTime}/{task.estimatedTime} min
                    </span>
                    <span className="text-sm text-gray-500">
                      Due: {task.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{task.category}</span>
                    <span>{task.subtasks.length} subtasks</span>
                    <span>{task.timeEntries.length} time entries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => stopTimer()}
                        className="text-red-600 hover:text-red-800"
                      >
                        <StopIcon className="w-4 h-4" />
                      </button>
                    )}
                    {task.status === 'pending' && (
                      <button
                        onClick={() => startTimer(task.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {task.status === 'completed' ? 'Reopen' : 'Complete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderCalendar = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Calendar View</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days would be rendered here */}
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date(2024, 11, i - 10) // December 2024
            const dayTasks = tasks.filter(task => {
              const taskDate = new Date(task.dueDate)
              return taskDate.toDateString() === date.toDateString()
            })
            
            return (
              <div key={i} className="border rounded p-2 min-h-24">
                <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.title.substring(0, 20)}...
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Productivity Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Time Tracking</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Total Time</span>
                <span>{tasks.reduce((acc, task) => acc + task.actualTime, 0)} min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Estimated vs Actual</span>
                <span>{(tasks.reduce((acc, task) => acc + task.actualTime, 0) / tasks.reduce((acc, task) => acc + task.estimatedTime, 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Session</span>
                <span>{(tasks.reduce((acc, task) => acc + task.productivity.averageSessionLength, 0) / tasks.length).toFixed(0)} min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Task Completion</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completed</span>
                <span>{tasks.filter(t => t.status === 'completed').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>In Progress</span>
                <span>{tasks.filter(t => t.status === 'in_progress').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overdue</span>
                <span>{tasks.filter(t => t.status === 'overdue').length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Efficiency Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Focus Time</span>
                <span>{tasks.reduce((acc, task) => acc + task.productivity.focusTime, 0)} min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Distractions</span>
                <span>{tasks.reduce((acc, task) => acc + task.productivity.distractions, 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Efficiency Score</span>
                <span>{(tasks.reduce((acc, task) => acc + task.productivity.efficiency, 0) / tasks.length * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Task Manager Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Task Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Auto-start timer when task begins</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Send reminders for due tasks</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="ml-2">Track time automatically</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded" />
              <span className="ml-2">Require time entries</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Default Task Duration</label>
              <select className="w-full border rounded px-3 py-2">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Reminder Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Reminder Time</label>
              <select className="w-full border rounded px-3 py-2">
                <option>15 minutes before</option>
                <option>30 minutes before</option>
                <option>1 hour before</option>
                <option>1 day before</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reminder Types</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="ml-2">Email</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="ml-2">Push notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded" />
                  <span className="ml-2">SMS</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="ml-2">Calendar events</span>
                </label>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Punctual Task Manager</h1>
          <p className="text-gray-600">Advanced task management with time tracking, productivity analytics, and smart scheduling</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'tasks', label: 'Tasks', icon: ListBulletIcon },
              { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
              { id: 'analytics', label: 'Analytics', icon: SparklesIcon },
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
        {currentView === 'tasks' && renderTasks()}
        {currentView === 'calendar' && renderCalendar()}
        {currentView === 'analytics' && renderAnalytics()}
        {currentView === 'settings' && renderSettings()}
      </div>
    </div>
  )
} 