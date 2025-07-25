export default function TestSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">✅ App is Working!</h1>
        <p className="text-white/70">This is a simple test page without authentication.</p>
        <div className="mt-6 space-y-2">
          <p className="text-green-300">✅ Next.js is running</p>
          <p className="text-green-300">✅ Tailwind CSS is working</p>
          <p className="text-green-300">✅ Pages are rendering</p>
        </div>
        <div className="mt-8">
          <a 
            href="/auth/login" 
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  )
}