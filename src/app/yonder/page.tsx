'use client'

import { useState } from 'react'
import { 
  MicrophoneIcon,
  VideoCameraIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'
import YonderVoiceWorkflow from '@/components/YonderVoiceWorkflow'
import YonderMeetingManager from '@/components/YonderMeetingManager'

export default function YonderPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'voice' | 'meetings' | 'analytics'>('overview')
  const [showVoiceWorkflow, setShowVoiceWorkflow] = useState(false)

  if (showVoiceWorkflow) {
    return (
      <AppLayout appName="Yonder">
        <YonderVoiceWorkflow />
      </AppLayout>
    )
  }

  return (
    <AppLayout appName="Yonder">
      {/* Simplified Header */}
      <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">
              Yonder
            </h1>
            <p className="text-lg text-red-100 mb-6 max-w-2xl mx-auto">
              AI-powered meeting intelligence. Record, transcribe, and analyze with enterprise-grade features.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowVoiceWorkflow(true)}
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-red-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <MicrophoneIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">Voice Recording</h3>
                <p className="text-sm text-gray-600">Record and transcribe audio</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-red-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <VideoCameraIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Join Meeting</h3>
                <p className="text-sm text-gray-600">Connect to Google Meet</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-red-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Analytics</h3>
                <p className="text-sm text-gray-600">View insights and reports</p>
              </div>
            </div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'voice'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'meetings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Meetings
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <MicrophoneIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Voice recording completed</p>
                    <p className="text-sm text-gray-600">Team meeting - 45 minutes</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Google Meet joined</p>
                    <p className="text-sm text-gray-600">Product review meeting</p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Summary generated</p>
                    <p className="text-sm text-gray-600">Weekly team sync</p>
                  </div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <MicrophoneIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-sm text-gray-600">Recordings</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-gray-600">Meetings</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">6.5h</p>
                    <p className="text-sm text-gray-600">Total Time</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                    <p className="text-sm text-gray-600">Summaries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-8">
            {/* Voice Recording Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <MicrophoneIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Voice Recording & Transcription
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Record audio content and get instant AI-powered transcription with insights, summaries, and action items.
                </p>
                <button
                  onClick={() => setShowVoiceWorkflow(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <SparklesIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Transcription</h3>
                  <p className="text-sm text-gray-600">95%+ accuracy with real-time processing</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DocumentTextIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Summaries</h3>
                  <p className="text-sm text-gray-600">Key points and action items extracted</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Speaker Detection</h3>
                  <p className="text-sm text-gray-600">Identify and track different speakers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <YonderMeetingManager userId="mock-user-id" />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Analytics Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analytics & Insights
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Track meeting effectiveness, team performance, and get AI-powered insights and recommendations.
                </p>
              </div>

              {/* Analytics Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                  <p className="text-sm text-gray-600">Meeting Effectiveness</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">12.5h</p>
                  <p className="text-sm text-gray-600">Time Saved This Week</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-600">Action Items Completed</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                  <p className="text-sm text-gray-600">Transcription Accuracy</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">View Reports</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <CpuChipIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">AI Insights</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Security</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  )
}