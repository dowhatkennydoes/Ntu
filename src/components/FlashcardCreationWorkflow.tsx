'use client'

import { useState, useEffect } from 'react'
import { 
  AcademicCapIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useWorkflow } from './WorkflowProvider'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  hint?: string
}

interface StudySet {
  id: string
  title: string
  description: string
  category: string
  cards: Flashcard[]
  studyMode: 'flashcards' | 'quiz' | 'review'
  settings: {
    shuffleCards: boolean
    showHints: boolean
    repeatMissed: boolean
  }
}

export function FlashcardCreationWorkflow() {
  const { updateWorkflowData, finishWorkflow, handleAsyncOperation } = useWorkflow()
  const [studySet, setStudySet] = useState<StudySet>({
    id: `study-set-${Date.now()}`,
    title: '',
    description: '',
    category: 'general',
    cards: [],
    studyMode: 'flashcards',
    settings: {
      shuffleCards: true,
      showHints: true,
      repeatMissed: true
    }
  })
  const [currentStep, setCurrentStep] = useState<'setup' | 'content' | 'preview'>('setup')
  const [sourceContent, setSourceContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [newCard, setNewCard] = useState({ front: '', back: '', hint: '' })
  const [previewCardIndex, setPreviewCardIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)

  const categories = [
    { id: 'general', name: 'General Knowledge', icon: '📚' },
    { id: 'language', name: 'Language', icon: '🌍' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'history', name: 'History', icon: '🏛️' },
    { id: 'math', name: 'Mathematics', icon: '📐' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'medical', name: 'Medical', icon: '🏥' }
  ]

  // Auto-generate flashcards from source content (N3: ≤3 steps)
  const generateFlashcardsFromContent = async () => {
    if (!sourceContent.trim()) return

    setIsGenerating(true)
    const result = await handleAsyncOperation(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Simulate AI flashcard generation
        const sentences = sourceContent.split(/[.!?]+/).filter(s => s.trim().length > 20)
        const generatedCards: Flashcard[] = []
        
        // Generate different types of cards based on content
        for (let i = 0; i < Math.min(sentences.length, 8); i++) {
          const sentence = sentences[i].trim()
          let front, back, hint
          
          if (sentence.includes('because') || sentence.includes('due to')) {
            // Cause and effect cards
            const parts = sentence.split(/because|due to/i)
            front = `Why ${parts[0].trim().toLowerCase()}?`
            back = `Because ${parts[1]?.trim() || 'of specific reasons mentioned in the content'}`
            hint = 'Think about cause and effect relationships'
          } else if (sentence.includes('is') || sentence.includes('are')) {
            // Definition cards
            const parts = sentence.split(/\bis\b|\bare\b/i)
            if (parts[0] && parts[1]) {
              front = `What ${parts[0].trim().toLowerCase()}?`
              back = parts[1].trim()
              hint = 'Consider the definition or characteristics'
            } else {
              front = `Complete: ${sentence.substring(0, sentence.length / 2)}...`
              back = sentence
              hint = 'Think about the complete statement'
            }
          } else {
            // Fill in the blank cards
            const words = sentence.split(' ')
            if (words.length > 5) {
              const blankIndex = Math.floor(words.length / 2)
              const blankedWord = words[blankIndex]
              words[blankIndex] = '____'
              front = words.join(' ')
              back = blankedWord
              hint = `Think about what fits in the context`
            } else {
              front = `What does this statement mean: "${sentence}"`
              back = `This refers to the concept explained in the source material`
              hint = 'Consider the main idea being conveyed'
            }
          }
          
          generatedCards.push({
            id: `card-${Date.now()}-${i}`,
            front,
            back,
            category: studySet.category,
            difficulty: 'medium' as const,
            tags: ['auto-generated'],
            hint
          })
        }
        
        return generatedCards
      },
      'Generate flashcards from content',
      { contentLength: sourceContent.length }
    )
    
    setIsGenerating(false)
    if (result.success && result.data) {
      setStudySet(prev => ({
        ...prev,
        cards: [...prev.cards, ...(result.data as Flashcard[])]
      }))
      toast.success(`Generated ${(result.data as Flashcard[]).length} flashcards!`)
    }
  }

  const addManualCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      toast.error('Both front and back are required')
      return
    }

    const card: Flashcard = {
      id: `card-${Date.now()}`,
      front: newCard.front.trim(),
      back: newCard.back.trim(),
      hint: newCard.hint.trim() || undefined,
      category: studySet.category,
      difficulty: 'medium',
      tags: ['manual']
    }

    setStudySet(prev => ({
      ...prev,
      cards: [...prev.cards, card]
    }))

    setNewCard({ front: '', back: '', hint: '' })
    toast.success('Flashcard added!')
  }

  const removeCard = (cardId: string) => {
    setStudySet(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== cardId)
    }))
    toast.success('Flashcard removed')
  }

  const updateCardDifficulty = (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setStudySet(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === cardId ? { ...card, difficulty } : card
      )
    }))
  }

  const completeStudySetCreation = () => {
    updateWorkflowData({
      studySet: {
        ...studySet,
        createdAt: new Date().toISOString()
      }
    })
    
    toast.success(`Created study set with ${studySet.cards.length} flashcards!`)
    finishWorkflow()
  }

  const canProceed = studySet.title.trim() && studySet.cards.length > 0

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {['Setup', 'Content', 'Preview'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep === step.toLowerCase() ? 'bg-purple-600 text-white' :
              ['setup', 'content', 'preview'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-600'
            )}>
              {['setup', 'content', 'preview'].indexOf(currentStep) > index ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{step}</span>
            {index < 2 && (
              <div className="w-8 h-px bg-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Setup */}
      {currentStep === 'setup' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-purple-600" />
            Study Set Setup
          </h4>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Set Title *
              </label>
              <input
                type="text"
                value={studySet.title}
                onChange={(e) => setStudySet(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter study set title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={studySet.description}
                onChange={(e) => setStudySet(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                placeholder="Describe what this study set covers..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setStudySet(prev => ({ ...prev, category: category.id }))}
                    className={cn(
                      'p-3 border rounded-lg text-sm flex items-center gap-2 transition-colors',
                      studySet.category === category.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Study Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'flashcards', name: 'Flashcards', desc: 'Classic card review' },
                  { id: 'quiz', name: 'Quiz Mode', desc: 'Multiple choice questions' },
                  { id: 'review', name: 'Review', desc: 'Spaced repetition' }
                ].map(mode => (
                  <label key={mode.id} className="flex flex-col p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="studyMode"
                      value={mode.id}
                      checked={studySet.studyMode === mode.id}
                      onChange={(e) => setStudySet(prev => ({ ...prev, studyMode: e.target.value as any }))}
                      className="sr-only"
                    />
                    <div className={cn(
                      'font-medium',
                      studySet.studyMode === mode.id ? 'text-purple-700' : 'text-gray-900'
                    )}>
                      {mode.name}
                    </div>
                    <div className="text-sm text-gray-600">{mode.desc}</div>
                    {studySet.studyMode === mode.id && (
                      <CheckIcon className="h-4 w-4 text-purple-600 mt-1 self-end" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Settings
              </label>
              <div className="space-y-2">
                {[
                  { key: 'shuffleCards', label: 'Shuffle cards during study', desc: 'Randomize card order' },
                  { key: 'showHints', label: 'Show hints when available', desc: 'Display helpful hints on cards' },
                  { key: 'repeatMissed', label: 'Repeat missed cards', desc: 'Show incorrect answers again' }
                ].map(setting => (
                  <label key={setting.key} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={studySet.settings[setting.key as keyof typeof studySet.settings]}
                      onChange={(e) => setStudySet(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          [setting.key]: e.target.checked
                        }
                      }))}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('content')}
                disabled={!studySet.title.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Content Creation */}
      {currentStep === 'content' && (
        <div className="space-y-6">
          {/* Auto-Generation from Content */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              Auto-Generate from Content
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Content
                </label>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={6}
                  placeholder="Paste your study material here and we'll automatically generate flashcards..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  AI will analyze your content and create relevant flashcards automatically
                </p>
              </div>
              
              <button
                onClick={generateFlashcardsFromContent}
                disabled={!sourceContent.trim() || isGenerating}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    Generate Flashcards (Step 1 of 3)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Manual Card Creation */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <PlusIcon className="h-5 w-5 text-purple-600" />
              Add Manual Cards
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front (Question) *
                  </label>
                  <textarea
                    value={newCard.front}
                    onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                    placeholder="Enter the question or prompt..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back (Answer) *
                  </label>
                  <textarea
                    value={newCard.back}
                    onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                    placeholder="Enter the answer or explanation..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hint (Optional)
                </label>
                <input
                  type="text"
                  value={newCard.hint}
                  onChange={(e) => setNewCard(prev => ({ ...prev, hint: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Add a helpful hint..."
                />
              </div>
              
              <button
                onClick={addManualCard}
                disabled={!newCard.front.trim() || !newCard.back.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Card
              </button>
            </div>
          </div>

          {/* Current Cards */}
          {studySet.cards.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                  Current Cards ({studySet.cards.length})
                </h4>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {studySet.cards.map((card, index) => (
                  <div key={card.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Front:</div>
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {card.front}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Back:</div>
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {card.back}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-3">
                        <select
                          value={card.difficulty}
                          onChange={(e) => updateCardDifficulty(card.id, e.target.value as any)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                        <button
                          onClick={() => removeCard(card.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove card"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {card.hint && (
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>Hint:</strong> {card.hint}
                      </div>
                    )}
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
              onClick={() => setCurrentStep('preview')}
              disabled={studySet.cards.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Preview
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Complete */}
      {currentStep === 'preview' && studySet.cards.length > 0 && (
        <div className="space-y-6">
          {/* Study Set Summary */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-purple-600" />
              Study Set Preview
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{studySet.cards.length}</div>
                  <div className="text-sm text-purple-700">Total Cards</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {studySet.cards.filter(c => c.difficulty === 'easy').length}
                  </div>
                  <div className="text-sm text-green-700">Easy Cards</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {studySet.cards.filter(c => c.difficulty === 'hard').length}
                  </div>
                  <div className="text-sm text-red-700">Hard Cards</div>
                </div>
              </div>

              {/* Card Preview */}
              <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900">
                    Card Preview ({previewCardIndex + 1} of {studySet.cards.length})
                  </h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewCardIndex(Math.max(0, previewCardIndex - 1))}
                      disabled={previewCardIndex === 0}
                      className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPreviewCardIndex(Math.min(studySet.cards.length - 1, previewCardIndex + 1))}
                      disabled={previewCardIndex === studySet.cards.length - 1}
                      className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6 min-h-32">
                  {!showBack ? (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Front:</div>
                      <div className="text-lg text-gray-900">{studySet.cards[previewCardIndex]?.front}</div>
                      {studySet.cards[previewCardIndex]?.hint && studySet.settings.showHints && (
                        <div className="mt-3 text-sm text-gray-600 italic">
                          💡 Hint: {studySet.cards[previewCardIndex].hint}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Back:</div>
                      <div className="text-lg text-gray-900">{studySet.cards[previewCardIndex]?.back}</div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowBack(!showBack)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    {showBack ? 'Show Front' : 'Show Back'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('content')}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Edit
            </button>
            <button
              onClick={completeStudySetCreation}
              disabled={!canProceed}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <AcademicCapIcon className="h-4 w-4" />
              Create Study Set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}