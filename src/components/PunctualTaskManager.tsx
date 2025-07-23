'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  BarsArrowUpIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  TagIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline'
import PunctualTaskModal from './PunctualTaskModal'

// P51: AI Priority Scoring Interfaces
interface AITaskPriority {
  score: number // 1-100
  urgency: number
  impact: number
  memoryContext: number
  reasoning: string
  // P14: Priority matrix quadrant
  matrix: {
    quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important'
    timePreference: 'immediate' | 'scheduled' | 'delegated' | 'eliminated'
  }
}

// P21: Project Management Interfaces
interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed'
  type: 'project' | 'sprint' | 'workflow'
  members: string[]
  dueDate?: Date
  color: string
}

// P1-P4: Task and Time-blocking Interfaces
interface TimeBlock {
  id: string
  taskId: string
  start: Date
  end: Date
  duration: number // minutes
  bufferBefore: number
  bufferAfter: number
  type: 'deep-work' | 'admin' | 'meeting' | 'break'
  isFlexible: boolean
}

interface Task {
  id: string
  title: string
  description: string
  projectId?: string
  priority: AITaskPriority
  dueDate?: Date
  estimatedDuration: number // minutes
  actualDuration?: number
  status: 'todo' | 'in-progress' | 'completed' | 'blocked'
  tags: string[]
  memoryLinks: string[]
  dependencies: string[]
  assignee?: string
  cognitiveLoad: 'light' | 'moderate' | 'heavy'
  workMode: 'deep-work' | 'admin' | 'reactive' | 'creative'
  emotionalTags: string[]
  createdAt: Date
  completedAt?: Date
  scheduledBlocks: TimeBlock[]
  // P52: Priority override system
  priorityLocked: boolean
  lockedPriority?: {
    score: number
    reason: string
    lockedAt: Date
    lockedBy: string
  }
}

// P3: User Preferences
interface UserPreferences {
  workingHours: {
    start: string // "09:00"
    end: string   // "17:00"
    timezone: string
    daysOfWeek: number[] // 0-6, Sunday = 0
  }
  focusBlocks: {
    deepWorkMinDuration: number // minutes
    bufferBetweenTasks: number
    maxTasksPerDay: number
    energyCycleOptimization: boolean
    deepWorkPreferredTime: 'morning' | 'afternoon' | 'evening'
    maxDeepWorkBlocksPerDay: number
  }
  notifications: {
    dailyDigest: boolean
    digestTime: string
    smartReminders: boolean
    urgencyLevels: ('low' | 'medium' | 'high' | 'critical')[]
  }
  scheduling: {
    autoReschedule: boolean
    confirmReschedule: boolean
    manualOnly: boolean
    weekendWork: boolean
  }
}

// P66: Memory Integration
interface MemoryActivity {
  taskId: string
  timestamp: Date
  action: 'created' | 'started' | 'completed' | 'modified'
  metadata: Record<string, any>
  sourceMemory?: string
}

// P16: Calendar Integration
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  source: 'outlook' | 'google' | 'manual'
  attendees?: string[]
  location?: string
  description?: string
  canReschedule: boolean
  priority: 'low' | 'medium' | 'high'
}

// P82: Smart Reminders
interface SmartReminder {
  id: string
  taskId: string
  type: 'deadline' | 'start' | 'priority-change' | 'block-starting' | 'overdue'
  scheduledFor: Date
  message: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  sent: boolean
  dismissed: boolean
  createdAt: Date
}

interface CalendarIntegration {
  outlook: {
    enabled: boolean
    lastSync: Date | null
    syncInterval: number // minutes
    accessToken?: string
  }
  google: {
    enabled: boolean
    lastSync: Date | null
    syncInterval: number // minutes
    accessToken?: string
  }
  conflictResolution: 'block-time' | 'suggest-alternatives' | 'notify-only'
  syncWorkingHoursOnly: boolean
}

export default function PunctualTaskManager() {
  // Core state
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [currentView, setCurrentView] = useState<'calendar' | 'kanban' | 'list' | 'gantt'>('calendar')
  
  // P3: User preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      daysOfWeek: [1, 2, 3, 4, 5] // Monday-Friday
    },
    focusBlocks: {
      deepWorkMinDuration: 120, // 2 hours - P15: Enforced minimum
      bufferBetweenTasks: 15,
      maxTasksPerDay: 8,
      energyCycleOptimization: true,
      deepWorkPreferredTime: 'morning', // morning, afternoon, evening
      maxDeepWorkBlocksPerDay: 2
    },
    notifications: {
      dailyDigest: true,
      digestTime: '08:00',
      smartReminders: true,
      urgencyLevels: ['medium', 'high', 'critical']
    },
    scheduling: {
      autoReschedule: false,
      confirmReschedule: true,
      manualOnly: false,
      weekendWork: false
    }
  })

  // P66: Memory activities for sync
  const [memoryActivities, setMemoryActivities] = useState<MemoryActivity[]>([])
  
  // P16: Calendar integration state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarIntegration, setCalendarIntegration] = useState<CalendarIntegration>({
    outlook: {
      enabled: false,
      lastSync: null,
      syncInterval: 15
    },
    google: {
      enabled: false,
      lastSync: null,
      syncInterval: 15
    },
    conflictResolution: 'block-time',
    syncWorkingHoursOnly: true
  })
  const [syncInProgress, setSyncInProgress] = useState(false)
  
  // UI state
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [focusMode, setFocusMode] = useState(false)
  
  // P52: Priority lock modal state
  const [showPriorityLockModal, setShowPriorityLockModal] = useState(false)
  const [lockingTask, setLockingTask] = useState<Task | null>(null)
  const [lockPriorityScore, setLockPriorityScore] = useState(50)
  const [lockReason, setLockReason] = useState('')

  // P82: Smart reminders state
  const [smartReminders, setSmartReminders] = useState<SmartReminder[]>([])
  const [activeReminders, setActiveReminders] = useState<SmartReminder[]>([])
  const [showReminders, setShowReminders] = useState(false)

  // P51, P52 & P14: AI Priority Calculation with lock override and matrix
  const calculateAIPriority = (task: Partial<Task>): AITaskPriority => {
    // P52: If priority is locked, return the locked priority with matrix
    if (task.priorityLocked && task.lockedPriority) {
      const lockedScore = task.lockedPriority.score
      const urgency = Math.floor(lockedScore * 0.4)
      const impact = Math.floor(lockedScore * 0.35)
      
      return {
        score: lockedScore,
        urgency,
        impact,
        memoryContext: Math.floor(lockedScore * 0.25),
        reasoning: `LOCKED: ${task.lockedPriority.reason} (Set by ${task.lockedPriority.lockedBy} on ${task.lockedPriority.lockedAt.toLocaleDateString()})`,
        matrix: determineMatrixQuadrant(urgency, impact)
      }
    }

    const now = new Date()
    const dueDate = task.dueDate
    
    // Urgency calculation (0-40 points)
    let urgency = 20
    if (dueDate) {
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      if (hoursUntilDue < 0) urgency = 40 // Overdue
      else if (hoursUntilDue < 24) urgency = 38
      else if (hoursUntilDue < 72) urgency = 35
      else if (hoursUntilDue < 168) urgency = 30
      else urgency = 15
    }

    // P14: Enhanced urgency factors
    if (task.tags?.includes('urgent')) urgency += 5
    if (task.tags?.includes('blocked')) urgency += 3
    if (task.workMode === 'reactive') urgency += 2

    // Impact calculation (0-35 points) 
    let impact = 20
    if (task.projectId) {
      const project = projects.find(p => p.id === task.projectId)
      if (project?.status === 'active') impact += 10
      if (project?.type === 'sprint') impact += 5
    }
    if (task.dependencies && task.dependencies.length > 0) impact += 5
    
    // P14: Enhanced impact factors
    if (task.tags?.includes('important')) impact += 8
    if (task.tags?.includes('strategic')) impact += 6
    if (task.workMode === 'deep-work') impact += 4
    if (task.cognitiveLoad === 'heavy') impact += 3

    // Memory context calculation (0-25 points)
    let memoryContext = 10
    if (task.memoryLinks && task.memoryLinks.length > 0) {
      memoryContext += Math.min(task.memoryLinks.length * 3, 15)
    }

    // Cap values at their maximums
    urgency = Math.min(urgency, 40)
    impact = Math.min(impact, 35)
    memoryContext = Math.min(memoryContext, 25)

    const totalScore = Math.min(urgency + impact + memoryContext, 100)
    
    return {
      score: totalScore,
      urgency,
      impact,
      memoryContext,
      reasoning: `Urgency: ${urgency}/40, Impact: ${impact}/35, Memory: ${memoryContext}/25`,
      matrix: determineMatrixQuadrant(urgency, impact)
    }
  }

  // P14: Determine Eisenhower Matrix quadrant
  const determineMatrixQuadrant = (urgency: number, impact: number): AITaskPriority['matrix'] => {
    const isUrgent = urgency >= 25 // 62.5% of max urgency (40)
    const isImportant = impact >= 22 // 62.9% of max impact (35)

    if (isUrgent && isImportant) {
      return {
        quadrant: 'urgent-important',
        timePreference: 'immediate'
      }
    } else if (!isUrgent && isImportant) {
      return {
        quadrant: 'not-urgent-important', 
        timePreference: 'scheduled'
      }
    } else if (isUrgent && !isImportant) {
      return {
        quadrant: 'urgent-not-important',
        timePreference: 'delegated'
      }
    } else {
      return {
        quadrant: 'not-urgent-not-important',
        timePreference: 'eliminated'
      }
    }
  }

  // P52: Priority locking functions
  const lockTaskPriority = (taskId: string, priorityScore: number, reason: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          priorityLocked: true,
          lockedPriority: {
            score: Math.max(1, Math.min(100, priorityScore)),
            reason,
            lockedAt: new Date(),
            lockedBy: 'user' // In a real app, this would be the current user
          }
        }
        // Recalculate priority to use locked value
        updatedTask.priority = calculateAIPriority(updatedTask)
        return updatedTask
      }
      return task
    }))
    
    // Trigger re-prioritization
    setTimeout(() => reorderTasksByPriority(), 100)
  }

  const unlockTaskPriority = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          priorityLocked: false,
          lockedPriority: undefined
        }
        // Recalculate priority without lock
        updatedTask.priority = calculateAIPriority(updatedTask)
        return updatedTask
      }
      return task
    }))
    
    // Trigger re-prioritization
    setTimeout(() => reorderTasksByPriority(), 100)
  }

  // P82: Smart reminder functions
  const generateSmartReminders = (task: Task) => {
    const reminders: SmartReminder[] = []
    const now = new Date()

    // Deadline-based reminders
    if (task.dueDate && task.status !== 'completed') {
      const hoursUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      // Critical: 2 hours before due
      if (hoursUntilDue > 2 && hoursUntilDue <= 24) {
        reminders.push({
          id: `reminder-${task.id}-critical`,
          taskId: task.id,
          type: 'deadline',
          scheduledFor: new Date(task.dueDate.getTime() - 2 * 60 * 60 * 1000),
          message: `⚠️ "${task.title}" is due in 2 hours! Priority: ${task.priority.score}/100`,
          urgencyLevel: task.priority.score >= 80 ? 'critical' : 'high',
          sent: false,
          dismissed: false,
          createdAt: now
        })
      }

      // High: 6 hours before due (for high priority tasks)
      if (task.priority.score >= 70 && hoursUntilDue > 6 && hoursUntilDue <= 24) {
        reminders.push({
          id: `reminder-${task.id}-high`,
          taskId: task.id,
          type: 'deadline',
          scheduledFor: new Date(task.dueDate.getTime() - 6 * 60 * 60 * 1000),
          message: `🔥 High priority task "${task.title}" due in 6 hours`,
          urgencyLevel: 'high',
          sent: false,
          dismissed: false,
          createdAt: now
        })
      }

      // Medium: 24 hours before due
      if (hoursUntilDue > 24 && hoursUntilDue <= 72) {
        reminders.push({
          id: `reminder-${task.id}-day`,
          taskId: task.id,
          type: 'deadline',
          scheduledFor: new Date(task.dueDate.getTime() - 24 * 60 * 60 * 1000),
          message: `📅 "${task.title}" is due tomorrow`,
          urgencyLevel: task.priority.score >= 60 ? 'medium' : 'low',
          sent: false,
          dismissed: false,
          createdAt: now
        })
      }

      // Overdue reminder
      if (hoursUntilDue < 0) {
        reminders.push({
          id: `reminder-${task.id}-overdue`,
          taskId: task.id,
          type: 'overdue',
          scheduledFor: now,
          message: `🚨 "${task.title}" is ${Math.abs(Math.floor(hoursUntilDue))} hours overdue!`,
          urgencyLevel: 'critical',
          sent: false,
          dismissed: false,
          createdAt: now
        })
      }
    }

    // Time block starting reminders
    if (task.scheduledBlocks.length > 0) {
      task.scheduledBlocks.forEach(block => {
        const minutesUntilStart = (new Date(block.start).getTime() - now.getTime()) / (1000 * 60)
        
        if (minutesUntilStart > 0 && minutesUntilStart <= 15) {
          reminders.push({
            id: `reminder-${task.id}-block-${block.id}`,
            taskId: task.id,
            type: 'block-starting',
            scheduledFor: new Date(new Date(block.start).getTime() - 5 * 60 * 1000), // 5 min before
            message: `⏰ Time to start "${task.title}" in 5 minutes`,
            urgencyLevel: task.workMode === 'deep-work' ? 'high' : 'medium',
            sent: false,
            dismissed: false,
            createdAt: now
          })
        }
      })
    }

    return reminders
  }

  const checkAndSendReminders = () => {
    const now = new Date()
    const activeRems: SmartReminder[] = []

    smartReminders.forEach(reminder => {
      if (!reminder.sent && !reminder.dismissed && reminder.scheduledFor <= now) {
        // Mark as sent
        setSmartReminders(prev => prev.map(r => 
          r.id === reminder.id ? { ...r, sent: true } : r
        ))
        
        // Add to active reminders (notifications)
        activeRems.push(reminder)
        
        // In a real app, this would trigger native notifications
        console.log(`📱 Smart Reminder: ${reminder.message}`)
      }
    })

    if (activeRems.length > 0) {
      setActiveReminders(prev => [...prev, ...activeRems])
      if (!showReminders) {
        setShowReminders(true)
      }
    }
  }

  const dismissReminder = (reminderId: string) => {
    setActiveReminders(prev => prev.filter(r => r.id !== reminderId))
    setSmartReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, dismissed: true } : r
    ))
  }

  const snoozeReminder = (reminderId: string, minutes: number) => {
    const newScheduledFor = new Date(Date.now() + minutes * 60 * 1000)
    
    setActiveReminders(prev => prev.filter(r => r.id !== reminderId))
    setSmartReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, scheduledFor: newScheduledFor, sent: false } : r
    ))
  }

  // P1 & P14: Time-blocking algorithm with matrix-based placement
  const scheduleTaskInTimeBlocks = (task: Task): TimeBlock[] => {
    const workingHours = userPreferences.workingHours
    const focusSettings = userPreferences.focusBlocks
    
    // P15: Enhanced deep work scheduling - find 2+ hour blocks first
    if (task.workMode === 'deep-work') {
      return scheduleDeepWorkTask(task)
    }
    
    // P14: Matrix-based time placement
    const timePreference = task.priority.matrix.timePreference
    const targetDate = getMatrixBasedScheduleDate(task, timePreference)
    
    // Find available time slots based on matrix preference
    const availableSlots = findMatrixBasedTimeSlots(targetDate, task.estimatedDuration, timePreference)
    return createTimeBlocksForTask(task, task.estimatedDuration, availableSlots)
  }

  // P14: Get target date based on matrix quadrant
  const getMatrixBasedScheduleDate = (task: Task, timePreference: string): Date => {
    const now = new Date()
    
    switch (timePreference) {
      case 'immediate':
        // Urgent + Important: Schedule ASAP (within next few hours)
        return new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
      
      case 'scheduled':
        // Not Urgent + Important: Schedule optimally within work hours
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow
      
      case 'delegated':
        // Urgent + Not Important: Can be scheduled flexibly
        const dayAfterTomorrow = new Date(now)
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
        return dayAfterTomorrow
      
      case 'eliminated':
        // Not Urgent + Not Important: Schedule much later
        const nextWeek = new Date(now)
        nextWeek.setDate(nextWeek.getDate() + 7)
        return nextWeek
      
      default:
        return selectedDate
    }
  }

  // P14: Find time slots based on matrix preference
  const findMatrixBasedTimeSlots = (targetDate: Date, duration: number, timePreference: string): { start: Date, end: Date }[] => {
    const allSlots = findAvailableTimeSlots(targetDate, duration)
    
    switch (timePreference) {
      case 'immediate':
        // Urgent + Important: Prefer earliest available slots
        return allSlots.slice(0, 1) // Take the first available slot
      
      case 'scheduled':
        // Not Urgent + Important: Prefer morning slots for best focus
        const morningSlots = allSlots.filter(slot => {
          const hour = new Date(slot.start).getHours()
          return hour >= 8 && hour <= 11
        })
        return morningSlots.length > 0 ? morningSlots : allSlots.slice(0, 2)
      
      case 'delegated':
        // Urgent + Not Important: Prefer afternoon slots
        const afternoonSlots = allSlots.filter(slot => {
          const hour = new Date(slot.start).getHours()
          return hour >= 13 && hour <= 16
        })
        return afternoonSlots.length > 0 ? afternoonSlots : allSlots
      
      case 'eliminated':
        // Not Urgent + Not Important: Any available slot is fine
        return allSlots
      
      default:
        return allSlots
    }
  }

  // P15: Dedicated deep work scheduling function
  const scheduleDeepWorkTask = (task: Task): TimeBlock[] => {
    const focusSettings = userPreferences.focusBlocks
    const minDeepWorkDuration = Math.max(focusSettings.deepWorkMinDuration, 120) // Enforce 2+ hours
    
    // Always ensure deep work tasks get at least 2+ hour blocks
    const requiredDuration = Math.max(task.estimatedDuration, minDeepWorkDuration)
    
    // Find deep work slots (longer continuous periods)
    const deepWorkSlots = findDeepWorkTimeSlots(selectedDate, requiredDuration)
    
    if (deepWorkSlots.length === 0) {
      // Try to find slots across multiple days
      return findMultiDayDeepWorkSlots(task, requiredDuration)
    }
    
    return createTimeBlocksForTask(task, requiredDuration, deepWorkSlots, true)
  }

  // P15: Find time slots suitable for deep work (2+ hours minimum)
  const findDeepWorkTimeSlots = (date: Date, minDuration: number): { start: Date, end: Date }[] => {
    const dayStart = new Date(date)
    const [startHour, startMin] = userPreferences.workingHours.start.split(':').map(Number)
    dayStart.setHours(startHour, startMin, 0, 0)
    
    const dayEnd = new Date(date)
    const [endHour, endMin] = userPreferences.workingHours.end.split(':').map(Number)
    dayEnd.setHours(endHour, endMin, 0, 0)

    const existingBlocks = timeBlocks
      .filter(block => isSameDay(new Date(block.start), date))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    const deepWorkSlots: { start: Date, end: Date }[] = []
    let currentTime = new Date(dayStart)

    // Find continuous blocks of at least minDuration
    for (const block of existingBlocks) {
      const blockStart = new Date(block.start)
      if (currentTime < blockStart) {
        const availableTime = blockStart.getTime() - currentTime.getTime()
        const availableMinutes = availableTime / (1000 * 60)
        
        // Only consider slots that can accommodate the full deep work duration
        if (availableMinutes >= minDuration + 30) { // 30min buffer
          deepWorkSlots.push({
            start: new Date(currentTime.getTime() + 15 * 60 * 1000), // 15min buffer
            end: new Date(blockStart.getTime() - 15 * 60 * 1000) // 15min buffer
          })
        }
      }
      currentTime = new Date(Math.max(currentTime.getTime(), new Date(block.end).getTime()))
    }

    // Check remaining time until end of day
    if (currentTime < dayEnd) {
      const remainingTime = dayEnd.getTime() - currentTime.getTime()
      const remainingMinutes = remainingTime / (1000 * 60)
      
      if (remainingMinutes >= minDuration + 15) { // 15min buffer
        deepWorkSlots.push({
          start: new Date(currentTime.getTime() + 15 * 60 * 1000),
          end: new Date(dayEnd.getTime() - 15 * 60 * 1000)
        })
      }
    }

    return deepWorkSlots
  }

  // P15: Find deep work slots across multiple days if needed
  const findMultiDayDeepWorkSlots = (task: Task, requiredDuration: number): TimeBlock[] => {
    const blocks: TimeBlock[] = []
    let remainingDuration = requiredDuration
    let currentDate = new Date(selectedDate)
    
    // Try up to 7 days to find suitable deep work slots
    for (let dayOffset = 0; dayOffset < 7 && remainingDuration > 0; dayOffset++) {
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() + dayOffset)
      
      // Skip weekends if not allowed
      if (!userPreferences.scheduling.weekendWork && (checkDate.getDay() === 0 || checkDate.getDay() === 6)) {
        continue
      }
      
      const deepWorkSlots = findDeepWorkTimeSlots(checkDate, Math.min(remainingDuration, 240)) // Max 4h per day
      
      for (const slot of deepWorkSlots) {
        if (remainingDuration <= 0) break
        
        const slotDuration = Math.min(
          remainingDuration,
          (slot.end.getTime() - slot.start.getTime()) / (1000 * 60) - 30 // 30min buffer
        )
        
        if (slotDuration >= 120) { // Minimum 2h chunks for deep work
          blocks.push({
            id: `deep-block-${task.id}-${checkDate.getTime()}`,
            taskId: task.id,
            start: new Date(slot.start.getTime() + 15 * 60 * 1000),
            end: new Date(slot.start.getTime() + (slotDuration + 15) * 60 * 1000),
            duration: slotDuration,
            bufferBefore: 15,
            bufferAfter: 15,
            type: 'deep-work',
            isFlexible: false // Deep work blocks are non-flexible
          })
          
          remainingDuration -= slotDuration
        }
      }
    }
    
    return blocks
  }

  // P16: Calendar integration functions
  const syncOutlookCalendar = async () => {
    if (!calendarIntegration.outlook.enabled) return
    
    setSyncInProgress(true)
    try {
      // In a real implementation, this would call Microsoft Graph API
      // For now, we'll simulate with sample data
      const mockOutlookEvents: CalendarEvent[] = [
        {
          id: 'outlook-1',
          title: 'Team Stand-up',
          start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0),
          end: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 30),
          isAllDay: false,
          source: 'outlook',
          attendees: ['team@company.com'],
          canReschedule: false,
          priority: 'high'
        },
        {
          id: 'outlook-2',
          title: 'Project Review Meeting',
          start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 14, 0),
          end: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 15, 30),
          isAllDay: false,
          source: 'outlook',
          attendees: ['manager@company.com', 'stakeholder@company.com'],
          canReschedule: false,
          priority: 'high'
        }
      ]
      
      setCalendarEvents(prev => [
        ...prev.filter(event => event.source !== 'outlook'),
        ...mockOutlookEvents
      ])
      
      setCalendarIntegration(prev => ({
        ...prev,
        outlook: {
          ...prev.outlook,
          lastSync: new Date()
        }
      }))
    } catch (error) {
      console.error('Failed to sync Outlook calendar:', error)
    } finally {
      setSyncInProgress(false)
    }
  }

  const syncGoogleCalendar = async () => {
    if (!calendarIntegration.google.enabled) return
    
    setSyncInProgress(true)
    try {
      // In a real implementation, this would call Google Calendar API
      // For now, we'll simulate with sample data
      const mockGoogleEvents: CalendarEvent[] = [
        {
          id: 'google-1',
          title: 'Doctor Appointment',
          start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 11, 0),
          end: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0),
          isAllDay: false,
          source: 'google',
          location: 'Medical Center',
          canReschedule: false,
          priority: 'high'
        },
        {
          id: 'google-2',
          title: 'Lunch with Client',
          start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 30),
          end: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 13, 30),
          isAllDay: false,
          source: 'google',
          location: 'Restaurant Downtown',
          canReschedule: true,
          priority: 'medium'
        }
      ]
      
      setCalendarEvents(prev => [
        ...prev.filter(event => event.source !== 'google'),
        ...mockGoogleEvents
      ])
      
      setCalendarIntegration(prev => ({
        ...prev,
        google: {
          ...prev.google,
          lastSync: new Date()
        }
      }))
    } catch (error) {
      console.error('Failed to sync Google calendar:', error)
    } finally {
      setSyncInProgress(false)
    }
  }

  const syncAllCalendars = async () => {
    await Promise.all([
      syncOutlookCalendar(),
      syncGoogleCalendar()
    ])
  }

  const detectSchedulingConflicts = (newTask: Task, proposedBlocks: TimeBlock[]): { conflict: CalendarEvent, block: TimeBlock }[] => {
    const conflicts: { conflict: CalendarEvent, block: TimeBlock }[] = []
    
    for (const block of proposedBlocks) {
      const blockStart = new Date(block.start)
      const blockEnd = new Date(block.end)
      
      for (const event of calendarEvents) {
        if (!isSameDay(new Date(event.start), new Date(block.start))) continue
        
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        
        // Check for time overlap
        if ((blockStart < eventEnd && blockEnd > eventStart)) {
          conflicts.push({ conflict: event, block })
        }
      }
    }
    
    return conflicts
  }

  // P2: Enhanced scheduling that considers calendar events
  const findAvailableTimeSlots = (date: Date, durationNeeded: number): { start: Date, end: Date }[] => {
    const dayStart = new Date(date)
    const [startHour, startMin] = userPreferences.workingHours.start.split(':').map(Number)
    dayStart.setHours(startHour, startMin, 0, 0)
    
    const dayEnd = new Date(date)
    const [endHour, endMin] = userPreferences.workingHours.end.split(':').map(Number)
    dayEnd.setHours(endHour, endMin, 0, 0)

    // P16: Combine existing time blocks with calendar events
    const existingBlocks = timeBlocks
      .filter(block => isSameDay(new Date(block.start), date))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    
    const calendarEventsToday = calendarEvents
      .filter(event => isSameDay(new Date(event.start), date))
      .map(event => ({
        start: new Date(event.start),
        end: new Date(event.end)
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime())
    
    // Merge calendar events with existing blocks for scheduling
    const allBlockedTime = [
      ...existingBlocks.map(block => ({ start: new Date(block.start), end: new Date(block.end) })),
      ...calendarEventsToday
    ].sort((a, b) => a.start.getTime() - b.start.getTime())

    const availableSlots: { start: Date, end: Date }[] = []
    let currentTime = new Date(dayStart)

    // Find gaps between all blocked time (tasks + calendar events)
    for (const block of allBlockedTime) {
      const blockStart = new Date(block.start)
      if (currentTime < blockStart) {
        const gap = blockStart.getTime() - currentTime.getTime()
        if (gap >= durationNeeded * 60 * 1000) {
          availableSlots.push({
            start: new Date(currentTime),
            end: new Date(blockStart)
          })
        }
      }
      currentTime = new Date(Math.max(currentTime.getTime(), new Date(block.end).getTime()))
    }

    // Check remaining time until end of day
    if (currentTime < dayEnd) {
      const remainingTime = dayEnd.getTime() - currentTime.getTime()
      if (remainingTime >= durationNeeded * 60 * 1000) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(dayEnd)
        })
      }
    }

    return availableSlots
  }

  const createTimeBlocksForTask = (task: Task, duration: number, availableSlots: { start: Date, end: Date }[], isDeepWork: boolean = false): TimeBlock[] => {
    const bufferTime = userPreferences.focusBlocks.bufferBetweenTasks
    
    for (const slot of availableSlots) {
      const slotDuration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60)
      
      if (slotDuration >= duration + bufferTime * 2) {
        const blockStart = new Date(slot.start.getTime() + bufferTime * 60 * 1000)
        const blockEnd = new Date(blockStart.getTime() + duration * 60 * 1000)
        
        return [{
          id: `block-${task.id}-${Date.now()}`,
          taskId: task.id,
          start: blockStart,
          end: blockEnd,
          duration,
          bufferBefore: bufferTime,
          bufferAfter: bufferTime,
          type: task.workMode === 'deep-work' ? 'deep-work' : 'admin',
          isFlexible: isDeepWork ? false : task.priority.score < 70 // Deep work blocks are non-flexible
        }]
      }
    }

    // P8: Split task across days if no single block is long enough
    return splitTaskAcrossDays(task, duration)
  }

  // P8: Task splitting logic
  const splitTaskAcrossDays = (task: Task, totalDuration: number): TimeBlock[] => {
    const blocks: TimeBlock[] = []
    let remainingDuration = totalDuration
    let currentDate = new Date(selectedDate)
    
    while (remainingDuration > 0 && blocks.length < 5) { // Max 5 days split
      const daySlots = findAvailableTimeSlots(currentDate, Math.min(remainingDuration, 120))
      
      if (daySlots.length > 0) {
        const slot = daySlots[0]
        const slotDuration = Math.min(
          remainingDuration,
          (slot.end.getTime() - slot.start.getTime()) / (1000 * 60) - 30 // 30min buffer
        )
        
        if (slotDuration >= 30) { // Minimum 30min chunks
          blocks.push({
            id: `block-${task.id}-${currentDate.getTime()}`,
            taskId: task.id,
            start: new Date(slot.start.getTime() + 15 * 60 * 1000),
            end: new Date(slot.start.getTime() + (slotDuration + 15) * 60 * 1000),
            duration: slotDuration,
            bufferBefore: 15,
            bufferAfter: 15,
            type: 'admin',
            isFlexible: true
          })
          
          remainingDuration -= slotDuration
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return blocks
  }

  // P4: Auto-prioritization and reordering
  const reorderTasksByPriority = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      // P7: Deadline urgency weighting
      const aPriority = a.priority.score + getDeadlineUrgency(a)
      const bPriority = b.priority.score + getDeadlineUrgency(b)
      return bPriority - aPriority
    })
    
    setTasks(sortedTasks)
    
    // Reschedule all tasks based on new priority order
    rescheduleAllTasks(sortedTasks)
  }

  // P7: Deadline urgency calculation
  const getDeadlineUrgency = (task: Task): number => {
    if (!task.dueDate) return 0
    
    const now = new Date()
    const hoursUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilDue < 0) return 25 // Overdue
    if (hoursUntilDue < 6) return 20 // Due today
    if (hoursUntilDue < 24) return 15 // Due tomorrow
    if (hoursUntilDue < 72) return 10 // Due this week
    return 0
  }

  const rescheduleAllTasks = (sortedTasks: Task[]) => {
    const newTimeBlocks: TimeBlock[] = []
    
    for (const task of sortedTasks) {
      if (task.status === 'todo' || task.status === 'in-progress') {
        const taskBlocks = scheduleTaskInTimeBlocks(task)
        newTimeBlocks.push(...taskBlocks)
      }
    }
    
    setTimeBlocks(newTimeBlocks)
  }

  // P66: Memory sync functionality
  const syncTaskToMemory = (task: Task, action: MemoryActivity['action']) => {
    const activity: MemoryActivity = {
      taskId: task.id,
      timestamp: new Date(),
      action,
      metadata: {
        title: task.title,
        priority: task.priority.score,
        project: task.projectId,
        duration: action === 'completed' ? task.actualDuration : undefined,
        tags: task.tags
      },
      sourceMemory: task.memoryLinks[0]
    }
    
    setMemoryActivities(prev => [...prev, activity])
    
    // In a real implementation, this would sync to the Memory system
    console.log('Syncing to Memory:', activity)
  }

  // Task creation with AI priority calculation and conflict detection
  const createTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      projectId: taskData.projectId,
      priority: calculateAIPriority(taskData),
      dueDate: taskData.dueDate,
      estimatedDuration: taskData.estimatedDuration || 60,
      status: 'todo',
      tags: taskData.tags || [],
      memoryLinks: taskData.memoryLinks || [],
      dependencies: taskData.dependencies || [],
      cognitiveLoad: taskData.cognitiveLoad || 'moderate',
      workMode: taskData.workMode || 'admin',
      emotionalTags: taskData.emotionalTags || [],
      createdAt: new Date(),
      scheduledBlocks: [],
      // P52: Priority lock defaults
      priorityLocked: taskData.priorityLocked || false,
      lockedPriority: taskData.lockedPriority
    }

    setTasks(prev => [...prev, newTask])
    syncTaskToMemory(newTask, 'created')
    
    // Schedule the task
    const blocks = scheduleTaskInTimeBlocks(newTask)
    newTask.scheduledBlocks = blocks
    
    // P16: Check for calendar conflicts
    const conflicts = detectSchedulingConflicts(newTask, blocks)
    if (conflicts.length > 0 && calendarIntegration.conflictResolution === 'suggest-alternatives') {
      console.log(`Scheduling conflicts detected for task "${newTask.title}":`, conflicts)
      // In a real implementation, this would show a conflict resolution dialog
    }
    
    setTimeBlocks(prev => [...prev, ...blocks])
    
    // P82: Generate smart reminders for new task
    if (userPreferences.notifications.smartReminders) {
      const newReminders = generateSmartReminders(newTask)
      setSmartReminders(prev => [...prev, ...newReminders])
    }
    
    return newTask
  }

  // Task completion
  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completedTask = {
          ...task,
          status: 'completed' as const,
          completedAt: new Date()
        }
        syncTaskToMemory(completedTask, 'completed')
        return completedTask
      }
      return task
    }))
    
    // Remove time blocks for completed task
    setTimeBlocks(prev => prev.filter(block => block.taskId !== taskId))
  }

  // Utility functions
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // P14: Matrix quadrant styling helpers
  const getMatrixQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'urgent-important':
        return 'bg-red-100 text-red-800'
      case 'not-urgent-important':
        return 'bg-green-100 text-green-800'
      case 'urgent-not-important':
        return 'bg-yellow-100 text-yellow-800'
      case 'not-urgent-not-important':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMatrixQuadrantLabel = (quadrant: string) => {
    switch (quadrant) {
      case 'urgent-important':
        return 'Q1: Do First'
      case 'not-urgent-important':
        return 'Q2: Schedule'
      case 'urgent-not-important':
        return 'Q3: Delegate'
      case 'not-urgent-not-important':
        return 'Q4: Eliminate'
      default:
        return 'Unknown'
    }
  }

  // Get today's tasks and schedule
  const todaysTasks = tasks.filter(task => {
    if (task.status === 'completed') return false
    return task.scheduledBlocks.some(block => 
      isSameDay(new Date(block.start), selectedDate)
    )
  }).sort((a, b) => b.priority.score - a.priority.score)

  const todaysBlocks = timeBlocks
    .filter(block => isSameDay(new Date(block.start), selectedDate))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  // Initialize with sample data and sync calendars
  useEffect(() => {
    const sampleProject: Project = {
      id: 'proj-1',
      name: 'Ntu Development',
      description: 'Core platform development',
      status: 'active',
      type: 'project',
      members: ['user-1'],
      color: '#3B82F6'
    }
    
    setProjects([sampleProject])
    
    // P16: Enable calendar integrations for demo
    setCalendarIntegration(prev => ({
      ...prev,
      outlook: { ...prev.outlook, enabled: true },
      google: { ...prev.google, enabled: true }
    }))
    
    // P16: Auto-sync calendars on load
    setTimeout(() => {
      syncAllCalendars()
    }, 1000)
    
    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Implement AI task prioritization',
        description: 'Build the priority scoring algorithm',
        projectId: 'proj-1',
        estimatedDuration: 180,
        workMode: 'deep-work' as const,
        tags: ['ai', 'algorithm'],
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      },
      {
        title: 'Review calendar integration specs',
        description: 'Analyze requirements for calendar sync',
        estimatedDuration: 60,
        workMode: 'admin' as const,
        tags: ['review', 'calendar']
      }
    ]
    
    sampleTasks.forEach(taskData => createTask(taskData))
  }, [])

  // P13: Overdue task rescheduling
  const rescheduleOverdueTasks = () => {
    const now = new Date()
    const overdueTasks = tasks.filter(task => {
      return task.dueDate && 
             task.status !== 'completed' && 
             task.dueDate < now
    })

    if (overdueTasks.length === 0) return

    // Sort overdue tasks by urgency (priority score + hours overdue)
    const sortedOverdueTasks = overdueTasks.sort((a, b) => {
      const aHoursOverdue = a.dueDate ? (now.getTime() - a.dueDate.getTime()) / (1000 * 60 * 60) : 0
      const bHoursOverdue = b.dueDate ? (now.getTime() - b.dueDate.getTime()) / (1000 * 60 * 60) : 0
      
      const aUrgencyScore = a.priority.score + Math.min(aHoursOverdue * 2, 50) // Max 50 bonus points
      const bUrgencyScore = b.priority.score + Math.min(bHoursOverdue * 2, 50)
      
      return bUrgencyScore - aUrgencyScore
    })

    // Reschedule tasks based on urgency
    sortedOverdueTasks.forEach(task => {
      const hoursOverdue = task.dueDate ? (now.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60) : 0
      
      // Determine new due date based on urgency and how overdue it is
      let newDueDate: Date
      
      if (task.priority.score >= 80 || hoursOverdue >= 72) {
        // Critical/very overdue: reschedule for today
        newDueDate = new Date(now.getTime() + 6 * 60 * 60 * 1000) // 6 hours from now
      } else if (task.priority.score >= 60 || hoursOverdue >= 24) {
        // High priority/overdue: reschedule for tomorrow
        newDueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      } else {
        // Medium priority: reschedule based on original timeline
        const originalTimeToComplete = task.estimatedDuration * 60 * 1000 // Convert to ms
        newDueDate = new Date(now.getTime() + originalTimeToComplete + 48 * 60 * 60 * 1000) // Add 48h buffer
      }

      // Update the task
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          const updatedTask = {
            ...t,
            dueDate: newDueDate,
            tags: [...t.tags.filter(tag => tag !== 'overdue'), 'rescheduled']
          }
          
          // Remove old time blocks
          setTimeBlocks(prevBlocks => prevBlocks.filter(block => block.taskId !== task.id))
          
          // Generate new time blocks
          setTimeout(() => {
            const newBlocks = scheduleTaskInTimeBlocks(updatedTask)
            setTimeBlocks(prevBlocks => [...prevBlocks, ...newBlocks])
          }, 100)
          
          return updatedTask
        }
        return t
      }))
      
      // Add to memory activity
      syncTaskToMemory(task, 'modified')
      
      console.log(`🔄 Rescheduled overdue task "${task.title}" to ${newDueDate.toLocaleString()}`)
    })

    if (sortedOverdueTasks.length > 0) {
      // Create a notification about rescheduling
      const rescheduledReminder: SmartReminder = {
        id: `rescheduled-${Date.now()}`,
        taskId: 'system',
        type: 'priority-change',
        scheduledFor: now,
        message: `📅 Automatically rescheduled ${sortedOverdueTasks.length} overdue task${sortedOverdueTasks.length > 1 ? 's' : ''} based on urgency`,
        urgencyLevel: 'medium',
        sent: false,
        dismissed: false,
        createdAt: now
      }
      
      setSmartReminders(prev => [...prev, rescheduledReminder])
      setActiveReminders(prev => [...prev, rescheduledReminder])
    }
  }

  // P82: Periodic reminder checking + P13: Overdue task rescheduling
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      if (userPreferences.notifications.smartReminders) {
        checkAndSendReminders()
        
        // Generate new reminders for all tasks
        tasks.forEach(task => {
          if (task.status !== 'completed') {
            const newReminders = generateSmartReminders(task)
            const existingReminderIds = smartReminders.map(r => r.id)
            const uniqueReminders = newReminders.filter(r => !existingReminderIds.includes(r.id))
            
            if (uniqueReminders.length > 0) {
              setSmartReminders(prev => [...prev, ...uniqueReminders])
            }
          }
        })
      }
      
      // P13: Check and reschedule overdue tasks every 5 minutes
      if (Date.now() % (5 * 60 * 1000) < 60000) { // Roughly every 5 minutes
        rescheduleOverdueTasks()
      }
    }, 60000) // Check every minute

    return () => clearInterval(reminderInterval)
  }, [tasks, smartReminders, userPreferences.notifications.smartReminders])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Punctual</h1>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                AI Scheduling
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['calendar', 'kanban', 'list'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentView === view
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* P82: Smart reminder notification button */}
              <div className="relative">
                <button
                  onClick={() => setShowReminders(!showReminders)}
                  className={`p-2 transition-colors relative ${
                    activeReminders.length > 0 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <BellIcon className="h-5 w-5" />
                  {activeReminders.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {Math.min(activeReminders.length, 9)}
                    </span>
                  )}
                </button>
                
                {/* P82: Reminder dropdown */}
                {showReminders && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Smart Reminders</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {activeReminders.length > 0 ? (
                        activeReminders.map(reminder => (
                          <div
                            key={reminder.id}
                            className={`p-4 border-b border-gray-100 ${
                              reminder.urgencyLevel === 'critical' ? 'bg-red-50 border-l-4 border-l-red-500' :
                              reminder.urgencyLevel === 'high' ? 'bg-orange-50 border-l-4 border-l-orange-500' :
                              reminder.urgencyLevel === 'medium' ? 'bg-yellow-50 border-l-4 border-l-yellow-500' :
                              'bg-gray-50'
                            }`}
                          >
                            <p className="text-sm text-gray-900 mb-2">{reminder.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {reminder.type === 'deadline' ? '📅 Deadline' :
                                 reminder.type === 'block-starting' ? '⏰ Starting Soon' :
                                 reminder.type === 'overdue' ? '🚨 Overdue' :
                                 '📝 Task Update'}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => snoozeReminder(reminder.id, 15)}
                                  className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                  15m
                                </button>
                                <button
                                  onClick={() => snoozeReminder(reminder.id, 60)}
                                  className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                  1h
                                </button>
                                <button
                                  onClick={() => dismissReminder(reminder.id)}
                                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No active reminders</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Task
              </button>
              
              <button
                onClick={() => setShowPreferences(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* P12: Daily Agenda Summary */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Agenda - {selectedDate.toLocaleDateString()}
            </h2>
            <div className="flex items-center space-x-4">
              {/* P15: Deep work statistics */}
              <div className="flex items-center space-x-2">
                <BoltIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">
                  {todaysBlocks.filter(b => b.type === 'deep-work').length} deep work blocks
                </span>
              </div>
              {/* P16: Calendar events count */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {calendarEvents.filter(e => isSameDay(new Date(e.start), selectedDate)).length} calendar events
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {todaysTasks.length} tasks • {todaysBlocks.reduce((acc, block) => acc + block.duration, 0)} min scheduled
                </span>
              </div>
              {/* P16: Calendar sync button */}
              <button
                onClick={syncAllCalendars}
                disabled={syncInProgress}
                className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-3 w-3 mr-1 ${syncInProgress ? 'animate-spin' : ''}`} />
                {syncInProgress ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
          
          {todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {todaysTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      task.priority.score >= 80 ? 'bg-red-500' :
                      task.priority.score >= 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500">
                        Priority: {task.priority.score}/100
                        {task.priorityLocked && (
                          <span className="text-amber-600 ml-1" title={task.lockedPriority?.reason}>
                            (Locked)
                          </span>
                        )}
                        {' • '}{formatDuration(task.estimatedDuration)}
                        {task.dueDate && ` • Due ${task.dueDate.toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => completeTask(task.id)}
                    className="text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {todaysTasks.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{todaysTasks.length - 3} more tasks scheduled
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks scheduled for today</p>
          )}
        </div>

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Time Blocks</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={reorderTasksByPriority}
                    className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <BarsArrowUpIcon className="h-4 w-4 mr-2" />
                    Re-prioritize
                  </button>
                  {/* P13: Manual overdue reschedule button */}
                  <button
                    onClick={rescheduleOverdueTasks}
                    className="flex items-center px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Reschedule Overdue
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* P16: Combined timeline view of tasks and calendar events */}
              {(todaysBlocks.length > 0 || calendarEvents.filter(e => isSameDay(new Date(e.start), selectedDate)).length > 0) ? (
                <div className="space-y-2">
                  {/* Task blocks */}
                  {todaysBlocks.map(block => {
                    const task = tasks.find(t => t.id === block.taskId)
                    if (!task) return null
                    
                    return (
                      <div
                        key={block.id}
                        className={`p-4 rounded-lg border-l-4 relative ${
                          block.type === 'deep-work' ? 'border-purple-500 bg-purple-50' :
                          block.type === 'admin' ? 'border-blue-500 bg-blue-50' :
                          'border-gray-500 bg-gray-50'
                        }`}
                      >
                        {/* P15: Deep work indicator */}
                        {block.type === 'deep-work' && (
                          <div className="absolute top-2 right-2 flex items-center">
                            <BoltIcon className="h-4 w-4 text-purple-600 mr-1" />
                            <span className="text-xs font-medium text-purple-700">Deep Work</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-500">
                              {formatTime(new Date(block.start))} - {formatTime(new Date(block.end))} 
                              ({formatDuration(block.duration)})
                            </p>
                            <div className="flex items-center mt-2 space-x-2 flex-wrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                task.cognitiveLoad === 'heavy' ? 'bg-red-100 text-red-800' :
                                task.cognitiveLoad === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.cognitiveLoad}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {task.workMode}
                              </span>
                              {/* P13: Rescheduled task indicator */}
                              {task.tags.includes('rescheduled') && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <ArrowPathIcon className="h-3 w-3 mr-1" />
                                  Rescheduled
                                </span>
                              )}
                              {/* P14: Matrix quadrant indicator */}
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatrixQuadrantColor(task.priority.matrix.quadrant)}`}>
                                {getMatrixQuadrantLabel(task.priority.matrix.quadrant)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end mb-1">
                              <div className="text-lg font-semibold text-gray-900">
                                {task.priority.score}/100
                              </div>
                              {/* P52: Priority lock indicator */}
                              {task.priorityLocked && (
                                <LockClosedIcon className="h-4 w-4 text-amber-600 ml-1" title="Priority Locked" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {task.priorityLocked ? 'Locked Priority' : 'Priority'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* P16: Calendar events */}
                  {calendarEvents
                    .filter(event => isSameDay(new Date(event.start), selectedDate))
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                    .map(event => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border-l-4 relative ${
                          event.source === 'outlook' ? 'border-blue-600 bg-blue-50' :
                          event.source === 'google' ? 'border-green-600 bg-green-50' :
                          'border-gray-600 bg-gray-50'
                        }`}
                      >
                        <div className="absolute top-2 right-2 flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-600 mr-1" />
                          <span className="text-xs font-medium text-gray-700 capitalize">{event.source}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {event.isAllDay ? 'All Day' : 
                                `${formatTime(new Date(event.start))} - ${formatTime(new Date(event.end))}`
                              }
                              {event.location && ` • ${event.location}`}
                            </p>
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center mt-2 space-x-2">
                                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {event.attendees.length} attendees
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.priority === 'high' ? 'bg-red-100 text-red-800' :
                              event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {event.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No time blocks scheduled</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                  >
                    Create your first task
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Task List View */}
        {currentView === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.map(task => (
                <div key={task.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => task.status !== 'completed' && completeTask(task.id)}
                        className="mr-4"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500">
                            Priority: {task.priority.score}/100
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDuration(task.estimatedDuration)}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {task.dueDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* P52: Priority lock controls */}
                      <div className="flex items-center space-x-2">
                        {task.priorityLocked ? (
                          <button
                            onClick={() => unlockTaskPriority(task.id)}
                            className="flex items-center px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                            title="Click to unlock priority"
                          >
                            <LockClosedIcon className="h-3 w-3 mr-1" />
                            Locked
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setLockingTask(task)
                              setLockPriorityScore(task.priority.score)
                              setLockReason('')
                              setShowPriorityLockModal(true)
                            }}
                            className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            title="Click to lock priority"
                          >
                            <LockOpenIcon className="h-3 w-3 mr-1" />
                            Lock
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Creation/Edit Modal */}
      <PunctualTaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setEditingTask(null)
        }}
        onSave={createTask}
        projects={projects}
        editingTask={editingTask}
      />

      {/* P52: Priority Lock Modal */}
      {showPriorityLockModal && lockingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <LockClosedIcon className="h-6 w-6 text-amber-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Lock Task Priority</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Lock the priority for <span className="font-medium">"{lockingTask.title}"</span> to prevent AI from changing it.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Score (1-100)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={lockPriorityScore}
                        onChange={(e) => setLockPriorityScore(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <div className="w-16 text-center">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={lockPriorityScore}
                          onChange={(e) => setLockPriorityScore(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Current AI score: {lockingTask.priority.score}/100
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for locking (optional)
                    </label>
                    <textarea
                      value={lockReason}
                      onChange={(e) => setLockReason(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="e.g., Critical for client demo, Personal deadline, etc."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPriorityLockModal(false)
                    setLockingTask(null)
                    setLockReason('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (lockingTask) {
                      lockTaskPriority(
                        lockingTask.id, 
                        lockPriorityScore, 
                        lockReason || `Manually set to ${lockPriorityScore}`
                      )
                    }
                    setShowPriorityLockModal(false)
                    setLockingTask(null)
                    setLockReason('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                  Lock Priority
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}