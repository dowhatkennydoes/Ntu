# Ntu - AI-Powered Memory & Workflow Platform

Ntu is a $10B DeviseOS clone that transforms how users work, learn, and collaborate through AI-powered memory management and seamless workflows. The platform is built on 100+ carefully designed workflow acceptance criteria that ensure optimal productivity and minimal cognitive load.

## 🚀 Features

### Core Workflow Logic
- **3-Step Task Completion**: Complete any common task in 3 steps or less
- **Seamless App Integration**: No workflow requires switching between more than 2 apps
- **Auto-Save Progress**: All workflows auto-save at each major step
- **Error Recovery**: Comprehensive retry, rollback, and exit options
- **Consistent Launcher**: Every workflow starts from a unified interface
- **Context Preservation**: Always return to the original context
- **Visual Progress Tracking**: Steppers, checklists, and progress bars
- **Dual Navigation**: Support for both keyboard and mouse navigation
- **AI Transparency**: Clear indication of AI-assisted steps
- **AI Takeover**: Mere can handle or summarize any workflow

### Memory-Centric Workflows
- **One-Flow Memory Creation**: Transcription + summarization in a single workflow
- **Drag-and-Select**: Merge and compare memory blocks intuitively
- **Reasoning Flows**: Memory chain generation in ≤ 4 actions
- **Smart Tagging**: Auto-suggest existing tags during creation
- **Privacy Controls**: Review, approval, and export for redaction
- **Timeline Playback**: Memory review with annotation capabilities
- **Smart Decks**: Auto-generate quiz cards from memories
- **Memory Forking**: Fork memories during any workflow
- **Live Suggestions**: Dynamic related memory updates
- **In-Place Editing**: Edit memories without modal interruptions

### AI Assistant (Mere)
- **Single-Click Export**: Summarize and export with fallback formats
- **Flow Control**: Pause, explain, and undo capabilities
- **Section-Based Redaction**: Granular privacy controls
- **UI Adaptation**: Minimize visual disruption during AI workflows
- **Timeline Navigation**: Animated scroll to relevant moments
- **Error Recovery**: Explanation and alternate paths for failures
- **Workflow Escalation**: "Continue where I left off" functionality
- **Background Processing**: AI works behind the scenes
- **Resumable Workflows**: Continue from assistant history
- **Confidence Thresholds**: Only ask for clarification when needed

## 🛠️ Technology Stack

- **Frontend**: Next.js 14.2.30, React 18.3.1, TypeScript 5.6.0
- **Styling**: Tailwind CSS 3.4.0, Framer Motion 11.18.2
- **State Management**: Zustand 4.5.7
- **Data Fetching**: TanStack Query 5.83.0
- **UI Components**: Headless UI 2.2.4, Heroicons 2.2.0
- **Forms**: React Hook Form 7.60.0
- **Notifications**: React Hot Toast 2.5.2

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ntu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── Dashboard.tsx      # Main dashboard
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── store/                 # State management
└── utils/                 # Helper functions
```

## 🎯 Workflow Implementation Status

### ✅ Completed
- Project setup and configuration
- Basic dashboard structure
- Workflow grid display
- Step-by-step workflow runner
- Progress tracking
- Visual feedback and animations

### 🔄 In Progress
- Memory creation workflows
- AI assistant integration
- Notebook workflows
- Real-time collaboration

### ⏳ Planned
- Plugin system
- Privacy and export workflows
- Team collaboration features
- Admin and knowledge ops
- Multimodal input support

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use Tailwind CSS for styling
- Implement responsive design patterns

### Component Structure
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow the single responsibility principle
- Add proper error boundaries

### Workflow Implementation
- Follow the 100 acceptance criteria
- Ensure 3-step completion for common tasks
- Implement proper error handling
- Add progress tracking for all workflows

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_APP_ENV=production
```

## 📊 Performance Targets

- **Response Time**: < 2s for all workflow steps
- **Memory Creation**: ≤ 10s for multimodal input
- **Workflow Steps**: ≤ 3 steps for common tasks
- **Memory Chain Generation**: ≤ 4 actions
- **Audio Processing**: ≤ 3 user actions

## 🔒 Security & Privacy

- **Data Encryption**: All data encrypted in transit and at rest
- **Privacy Controls**: Granular redaction and export controls
- **Access Management**: Role-based access control (RBAC)
- **Audit Trails**: Comprehensive logging for compliance
- **Emergency Lockdown**: Instant data protection capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@ntu.com or join our Slack channel.

---

**Built with ❤️ by the Ntu Team** 