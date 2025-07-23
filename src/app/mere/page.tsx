'use client'

import { SparklesIcon, ChatBubbleLeftRightIcon, LightBulbIcon, CpuChipIcon, LinkIcon } from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'

export default function MerePage() {
  return (
    <AppLayout appName="Mere">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mere</h1>
                  <p className="text-sm text-gray-600">AI Assistant & Workflow Orchestration</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  GPT-4 Powered
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your AI-Powered Command Center</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Orchestrate your entire productivity ecosystem with intelligent conversations. 
              Mere connects, analyzes, and automates across all your Ntu workflows.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg">
                Chat with Mere
              </button>
              <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                See Capabilities
              </button>
            </div>
          </div>

          {/* Interactive Chat Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-16 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat with Mere</h3>
              <p className="text-gray-600">Try natural language commands across your workflow</p>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* Sample conversation */}
              <div className="flex justify-end">
                <div className="bg-purple-600 text-white rounded-lg px-4 py-2 max-w-xs">
                  &quot;Summarize my research from Junction and create tasks in Punctual&quot;
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Mere</span>
                  </div>
                  I've analyzed your 3 research documents from Junction and created 5 prioritized tasks in Punctual based on the key findings. Would you like me to schedule these tasks or create a Marathon workflow for follow-up research?
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Ask Mere anything about your workflow..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled
              />
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50" disabled>
                Send
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Language Interface</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Communicate with your entire workflow using natural conversation. No complex commands or syntax required.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CpuChipIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligent Automation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Mere learns your patterns and proactively suggests optimizations, automations, and workflow improvements.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <LinkIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-App Orchestration</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Seamlessly coordinate actions across Junction, Punctual, Yonder, and Marathon with a single conversation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <LightBulbIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contextual Insights</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get intelligent analysis and recommendations based on your work patterns, deadlines, and priorities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy-First AI</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your data stays secure with enterprise-grade encryption and privacy controls. AI processing happens locally when possible.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Share AI insights with your team, collaborate on complex workflows, and maintain context across projects.
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Mere Can Do</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Research Assistant</h4>
                  <p className="text-sm text-purple-800">"Analyze my Junction research and create a summary presentation"</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Task Optimizer</h4>
                  <p className="text-sm text-blue-800">"Reschedule my Punctual tasks based on upcoming deadlines and energy levels"</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Workflow Creator</h4>
                  <p className="text-sm text-green-800">"Build a Marathon workflow to automatically process my weekly reports"</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">Voice Processor</h4>
                  <p className="text-sm text-orange-800">"Transcribe my Yonder recordings and extract action items for Punctual"</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Project Coordinator</h4>
                  <p className="text-sm text-red-800">"Coordinate this project across all apps and keep stakeholders updated"</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Strategic Advisor</h4>
                  <p className="text-sm text-indigo-800">"Analyze my productivity patterns and suggest improvements"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Development Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">AI Development Roadmap</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Conversational Interface</h4>
                  <p className="text-sm text-gray-600">Natural language processing and chat-based workflow control</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">In Progress</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cross-App Integration</h4>
                  <p className="text-sm text-gray-600">Deep integration with Junction, Punctual, Yonder, and Marathon</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Q2 2025</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Advanced AI Features</h4>
                  <p className="text-sm text-gray-600">Predictive analytics, automated insights, and proactive suggestions</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Q3 2025</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  )
}