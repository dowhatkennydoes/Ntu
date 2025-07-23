'use client'

import { BoltIcon, CogIcon, PlayIcon, PauseIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { AppLayout } from '@/components/AppLayout'

export default function MarathonPage() {
  return (
    <AppLayout appName="Marathon">
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <BoltIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Marathon</h1>
                  <p className="text-sm text-gray-600">Workflow Automation & Process Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Beta Coming Soon
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <BoltIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Automate Everything</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Build powerful no-code workflows that connect all your apps and automate repetitive tasks. 
              From simple triggers to complex multi-step processes.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-8 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors shadow-lg">
                Join Waitlist
              </button>
              <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CogIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Workflow Builder</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Drag-and-drop interface for creating complex workflows. Connect triggers, actions, and conditions with intuitive visual nodes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <PlayIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Triggers</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Start workflows from memory creation, file uploads, schedule, webhooks, or any event across your Ntu ecosystem.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track workflow execution, debug issues, and optimize performance with detailed logs and analytics.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Actions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Integrate with Mere AI for intelligent content processing, summarization, and decision-making within workflows.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Version Control</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Full versioning and rollback capabilities. Test workflows safely before deploying to production.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Universal Integrations</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect with all Ntu apps (Junction, Punctual, Yonder, Mere) plus external services and APIs.
              </p>
            </div>
          </div>

          {/* Roadmap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Development Roadmap</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Visual Workflow Builder</h4>
                  <p className="text-sm text-gray-600">Drag-and-drop canvas with node-based workflow creation</p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Q2 2025</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Core Integrations</h4>
                  <p className="text-sm text-gray-600">Connect with Junction, Punctual, Yonder, and Mere</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Q3 2025</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">AI-Powered Automation</h4>
                  <p className="text-sm text-gray-600">Intelligent workflow suggestions and optimization</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Q4 2025</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  )
}