'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpenIcon,
  FolderIcon,
  TagIcon,
  UserGroupIcon,
  PlusIcon,
  CheckIcon,
  SparklesIcon,
  DocumentTextIcon,
  SwatchIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface NotebookConfig {
  title: string
  description: string
  category: string
  privacy: 'private' | 'shared' | 'public'
  template: string
  tags: string[]
  color: string
  collaborators: string[]
}

interface NotebookTemplate {
  id: string
  name: string
  description: string
  sections: string[]
  icon: string
  color: string
}

export function NotebookCreationWorkflow() {
  const { updateWorkflowData, nextStep, finishWorkflow, handleAsyncOperation } = useWorkflow()
  const [config, setConfig] = useState<NotebookConfig>({
    title: '',
    description: '',
    category: 'general',
    privacy: 'private',
    template: 'blank',
    tags: [],
    color: 'blue',
    collaborators: []
  })
  const [currentStep, setCurrentStep] = useState<'setup' | 'template' | 'content' | 'sharing'>('setup')
  const [suggestedTitle, setSuggestedTitle] = useState('')
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [availableTemplates] = useState<NotebookTemplate[]>([
    {
      id: 'blank',
      name: 'Blank Notebook',
      description: 'Start from scratch with a clean notebook',
      sections: ['Notes'],
      icon: '📝',
      color: 'gray'
    },
    {
      id: 'research',
      name: 'Research Project',
      description: 'Organize research with references, findings, and conclusions',
      sections: ['Background', 'Research Notes', 'Sources', 'Analysis', 'Conclusions'],
      icon: '🔍',
      color: 'blue'
    },
    {
      id: 'meeting',
      name: 'Meeting Notes',
      description: 'Structure for meeting documentation and follow-ups',
      sections: ['Agenda', 'Discussion Points', 'Decisions', 'Action Items'],
      icon: '🤝',
      color: 'green'
    },
    {
      id: 'learning',
      name: 'Learning Journal',
      description: 'Track learning progress with concepts, examples, and practice',
      sections: ['Key Concepts', 'Examples', 'Practice Notes', 'Questions', 'Summary'],
      icon: '📚',
      color: 'purple'
    },
    {
      id: 'project',
      name: 'Project Planning',
      description: 'Comprehensive project management and documentation',
      sections: ['Overview', 'Requirements', 'Timeline', 'Resources', 'Progress', 'Review'],
      icon: '🎯',
      color: 'orange'
    }
  ])
  
  const categories = [
    { id: 'general', name: 'General', icon: '📄' },
    { id: 'work', name: 'Work', icon: '💼' },
    { id: 'personal', name: 'Personal', icon: '👤' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'research', name: 'Research', icon: '🔬' },
    { id: 'creative', name: 'Creative', icon: '🎨' }
  ]

  const colors = [
    { id: 'blue', name: 'Blue', class: 'bg-blue-500' },
    { id: 'green', name: 'Green', class: 'bg-green-500' },
    { id: 'purple', name: 'Purple', class: 'bg-purple-500' },
    { id: 'orange', name: 'Orange', class: 'bg-orange-500' },
    { id: 'red', name: 'Red', class: 'bg-red-500' },
    { id: 'gray', name: 'Gray', class: 'bg-gray-500' }
  ]

  // Auto-generate semantic title suggestion (N1)
  const generateTitleSuggestion = async () => {
    if (!config.description.trim()) return
    
    setIsGeneratingTitle(true)
    const result = await handleAsyncOperation(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Simulate AI title generation based on description
        const descriptions = config.description.toLowerCase()
        let suggestion = ''
        
        if (descriptions.includes('meeting') || descriptions.includes('discussion')) {
          suggestion = 'Meeting Notes - ' + new Date().toLocaleDateString()
        } else if (descriptions.includes('research') || descriptions.includes('study')) {
          suggestion = 'Research Project: ' + config.description.split(' ').slice(0, 3).join(' ')
        } else if (descriptions.includes('learn') || descriptions.includes('course')) {
          suggestion = 'Learning Journal: ' + config.description.split(' ').slice(0, 3).join(' ')
        } else if (descriptions.includes('project') || descriptions.includes('plan')) {
          suggestion = 'Project: ' + config.description.split(' ').slice(0, 3).join(' ')
        } else {
          suggestion = config.description.split(' ').slice(0, 4).join(' ').replace(/^\w/, c => c.toUpperCase())
        }
        
        return suggestion
      },
      'Generate semantic title',
      { description: config.description }
    )
    
    setIsGeneratingTitle(false)
    if (result.success && result.data) {
      setSuggestedTitle(result.data as string)
      toast.success('Generated title suggestion!')
    }
  }

  useEffect(() => {
    if (config.description.length > 10) {
      const timeout = setTimeout(generateTitleSuggestion, 1000)
      return () => clearTimeout(timeout)
    }
  }, [config.description])

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !config.tags.includes(tag.trim())) {
      setConfig(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  const handleTagRemove = (tag: string) => {
    setConfig(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const getSelectedTemplate = () => {
    return availableTemplates.find(t => t.id === config.template) || availableTemplates[0]
  }

  const getSelectedColor = () => {
    return colors.find(c => c.id === config.color) || colors[0]
  }

  const completeNotebookCreation = () => {
    const selectedTemplate = getSelectedTemplate()
    
    updateWorkflowData({
      notebook: {
        ...config,
        id: `notebook-${Date.now()}`,
        template: selectedTemplate,
        createdAt: new Date().toISOString(),
        sections: selectedTemplate.sections.map(section => ({
          id: `section-${Date.now()}-${section.toLowerCase().replace(/\s+/g, '-')}`,
          title: section,
          content: '',
          notes: []
        }))
      }
    })
    
    toast.success(`Created notebook: ${config.title}`)
    finishWorkflow()
  }

  const canProceed = config.title.trim() && config.template

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {['Setup', 'Template', 'Content', 'Sharing'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === step.toLowerCase() ? 'bg-blue-600 text-white' :
              ['setup', 'template', 'content', 'sharing'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-600'
            )}>
              {['setup', 'template', 'content', 'sharing'].indexOf(currentStep) > index ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{step}</span>
            {index < 3 && (
              <div className="w-8 h-px bg-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Setup */}
      {currentStep === 'setup' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            Notebook Setup
          </h4>
          
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notebook Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter notebook title..."
                />
                {suggestedTitle && suggestedTitle !== config.title && (
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, title: suggestedTitle }))}
                    className="absolute right-2 top-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Use: "{suggestedTitle.substring(0, 20)}..."
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what this notebook will be used for..."
                />
                {isGeneratingTitle && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 text-xs text-blue-600">
                    <SparklesIcon className="h-3 w-3 animate-pulse" />
                    Generating title...
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Adding a description will help generate a smart title suggestion
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setConfig(prev => ({ ...prev, category: category.id }))}
                    className={cn(
                      'p-3 border rounded-lg text-sm flex items-center gap-2 transition-colors',
                      config.category === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy
              </label>
              <div className="space-y-2">
                {[
                  { id: 'private', name: 'Private', desc: 'Only you can access this notebook' },
                  { id: 'shared', name: 'Shared', desc: 'Share with specific people' },
                  { id: 'public', name: 'Public', desc: 'Anyone with the link can view' }
                ].map(privacy => (
                  <label key={privacy.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="privacy"
                      value={privacy.id}
                      checked={config.privacy === privacy.id}
                      onChange={(e) => setConfig(prev => ({ ...prev, privacy: e.target.value as 'private' | 'shared' | 'public' }))}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{privacy.name}</div>
                      <div className="text-sm text-gray-600">{privacy.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('template')}
                disabled={!config.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {currentStep === 'template' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            Choose Template
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setConfig(prev => ({ ...prev, template: template.id }))}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all',
                    config.template === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">Includes sections:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.sections.slice(0, 3).map(section => (
                            <span key={section} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {section}
                            </span>
                          ))}
                          {template.sections.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{template.sections.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {config.template === template.id && (
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Template Preview */}
            {config.template && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Template Preview</h5>
                <div className="space-y-2">
                  {getSelectedTemplate().sections.map(section => (
                    <div key={section} className="flex items-center gap-2 text-sm">
                      <FolderIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('setup')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('content')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Content Customization */}
      {currentStep === 'content' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-blue-600" />
            Customize Content
          </h4>
          
          <div className="space-y-4">
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notebook Color
              </label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setConfig(prev => ({ ...prev, color: color.id }))}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      color.class,
                      config.color === color.id ? 'border-gray-800 scale-110' : 'border-gray-300'
                    )}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {config.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTagAdd(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input?.value) {
                        handleTagAdd(input.value)
                        input.value = ''
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('template')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('sharing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Sharing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Sharing Settings */}
      {currentStep === 'sharing' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-blue-600" />
            Sharing & Collaboration
          </h4>
          
          <div className="space-y-4">
            {config.privacy === 'shared' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collaborators
                </label>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setConfig(prev => ({
                          ...prev,
                          collaborators: [...prev.collaborators, e.currentTarget.value]
                        }))
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <div className="space-y-1">
                    {config.collaborators.map(email => (
                      <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{email}</span>
                        <button
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            collaborators: prev.collaborators.filter(c => c !== email)
                          }))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <EyeIcon className="h-4 w-4" />
                Notebook Preview
              </h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={cn('w-4 h-4 rounded', getSelectedColor().class)} />
                  <span className="font-medium text-gray-900">{config.title}</span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                    {categories.find(c => c.id === config.category)?.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{config.description || 'No description'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{getSelectedTemplate().name}</span>
                  <span>•</span>
                  <span>{getSelectedTemplate().sections.length} sections</span>
                  <span>•</span>
                  <span className="capitalize">{config.privacy}</span>
                  {config.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{config.tags.length} tag{config.tags.length !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('content')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={completeNotebookCreation}
                disabled={!canProceed}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <BookOpenIcon className="h-4 w-4" />
                Create Notebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}