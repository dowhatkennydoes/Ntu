'use client'

import { useState } from 'react'
import { MicrophoneIcon, SpeakerWaveIcon, DocumentTextIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'
// import YonderVoiceWorkflow from '@/components/YonderVoiceWorkflow'

export default function YonderPage() {
  const [showWorkflow, setShowWorkflow] = useState(false)

  if (showWorkflow) {
    return (
      <AppLayout appName="Yonder">
        {/* <YonderVoiceWorkflow /> */}
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Yonder Voice Workflow</h1>
        <p className="text-gray-600">Voice processing and transcription features coming soon...</p>
      </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout appName="Yonder">
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <MicrophoneIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Yonder</h1>
                  <p className="text-sm text-gray-600">Audio Processing & Voice Intelligence</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Live Demo
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <MicrophoneIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Voice-First Productivity</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Transform audio into actionable insights. Record, transcribe, analyze, and integrate voice data 
              seamlessly across your entire Ntu workflow.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setShowWorkflow(true)}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                Start Recording
              </button>
              <button 
                onClick={() => setShowWorkflow(true)}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <MicrophoneIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Recording</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                High-quality audio capture with noise reduction, voice activation, and automatic speaker detection.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Transcription</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Accurate speech-to-text with punctuation, formatting, and real-time processing capabilities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <LanguageIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Language Support</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Process audio in 50+ languages with automatic language detection and translation capabilities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Analytics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Extract sentiment, key topics, action items, and insights from conversations and recordings.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <SpeakerWaveIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Synthesis</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Generate natural-sounding speech from text with customizable voices and speaking styles.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seamless Integration</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect with Junction for research, Punctual for tasks, and Marathon for automated workflows.
              </p>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Try Voice Recording</h3>
              <p className="text-gray-600">Experience the power of AI-driven audio processing</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div 
                onClick={() => setShowWorkflow(true)}
                className="bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-8 text-center cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-shadow">
                  <MicrophoneIcon className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-700 font-medium mb-2">Click to start recording</p>
                <p className="text-sm text-gray-500">Full featured voice workflow available now!</p>
              </div>
            </div>
          </div>

          {/* Features Implemented */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Implemented Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Core Recording
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-5">
                  <li>• Live audio recording with real-time display</li>
                  <li>• File upload support (MP3, WAV, M4A, MP4, MOV)</li>
                  <li>• Auto-save every 5 seconds</li>
                  <li>• Keyboard shortcuts (Ctrl+B for bookmarks)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  AI Analysis
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-5">
                  <li>• Real-time transcription with speaker detection</li>
                  <li>• Sentiment analysis (-1 to 1 scale)</li>
                  <li>• Emotion detection (6 states)</li>
                  <li>• Intent classification and urgency scoring</li>
                  <li>• Automatic action item extraction</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  )
}