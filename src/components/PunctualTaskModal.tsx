'use client'

import { useState } from 'react'
import { XMarkIcon, CalendarIcon, ClockIcon, TagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Task {
  id: string
  title: string
  description: string
  projectId?: string
  dueDate?: Date
  estimatedDuration: number
  tags: string[]
  memoryLinks: string[]
  dependencies: string[]
  cognitiveLoad: 'light' | 'moderate' | 'heavy'
  workMode: 'deep-work' | 'admin' | 'reactive' | 'creative'
  emotionalTags: string[]
}

interface Project {
  id: string
  name: string
  color: string
}

interface PunctualTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => void
  projects: Project[]
  editingTask?: Task | null
}

export default function PunctualTaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  projects, 
  editingTask 
}: PunctualTaskModalProps) {
  const [formData, setFormData] = useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    projectId: editingTask?.projectId || '',
    dueDate: editingTask?.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : '',
    dueTime: editingTask?.dueDate ? editingTask.dueDate.toTimeString().split(' ')[0].slice(0, 5) : '',
    estimatedDuration: editingTask?.estimatedDuration || 60,
    tags: editingTask?.tags.join(', ') || '',
    cognitiveLoad: editingTask?.cognitiveLoad || 'moderate',
    workMode: editingTask?.workMode || 'admin',
    emotionalTags: editingTask?.emotionalTags.join(', ') || ''
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData: Partial<Task> = {
      title: formData.title,
      description: formData.description,
      projectId: formData.projectId || undefined,
      dueDate: formData.dueDate ? new Date(`${formData.dueDate}T${formData.dueTime || '23:59'}`) : undefined,
      estimatedDuration: formData.estimatedDuration,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      cognitiveLoad: formData.cognitiveLoad as Task['cognitiveLoad'],
      workMode: formData.workMode as Task['workMode'],
      emotionalTags: formData.emotionalTags.split(',').map(tag => tag.trim()).filter(Boolean),
      memoryLinks: [],
      dependencies: []
    }

    onSave(taskData)
    onClose()
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      projectId: '',
      dueDate: '',
      dueTime: '',
      estimatedDuration: 60,
      tags: '',
      cognitiveLoad: 'moderate',
      workMode: 'admin',
      emotionalTags: ''
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What needs to be done?"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add more details..."
              />
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Due Time
                </label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 60 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* P15: Deep work duration warning */}
              {formData.workMode === 'deep-work' && formData.estimatedDuration < 120 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2" />
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Deep work recommendation:</span> Tasks will be automatically extended to 2+ hours for optimal focus sessions.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Work Mode and Cognitive Load */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Mode
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value as Task['workMode'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="deep-work">Deep Work</option>
                  <option value="creative">Creative</option>
                  <option value="reactive">Reactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cognitive Load
                </label>
                <select
                  value={formData.cognitiveLoad}
                  onChange={(e) => setFormData({ ...formData, cognitiveLoad: e.target.value as Task['cognitiveLoad'] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TagIcon className="h-4 w-4 inline mr-1" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="urgent, review, meeting"
              />
            </div>

            {/* Emotional Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotional Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.emotionalTags}
                onChange={(e) => setFormData({ ...formData, emotionalTags: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="inspiring, draining, energizing"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}