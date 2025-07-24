# Ntu Backend Setup Guide

This guide covers the backend infrastructure setup for the Ntu platform, including database, job queues, LLM integration, and API endpoints.

## 🏗️ Architecture Overview

The Ntu backend is built on:
- **Next.js API Routes** - RESTful API endpoints
- **Supabase** - Database, authentication, and file storage
- **BullMQ + Redis** - Job queue management
- **Ollama + Claude/GPT** - LLM integration with fallback strategy
- **Whisper.cpp** - Audio transcription
- **pgvector** - Vector similarity search

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Redis** server running locally or remotely
3. **Ollama** installed and running locally
4. **Supabase** project created
5. **API Keys** for OpenAI and Anthropic (optional, for fallbacks)

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.example .env.local
```

Fill in the required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# LLM API Keys (optional)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OLLAMA_BASE_URL=http://localhost:11434

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# File Upload Configuration
MAX_FILE_SIZE=104857600
ALLOWED_AUDIO_FORMATS=wav,mp3,m4a
```

### 3. Database Setup

#### Supabase Project Setup

1. Create a new Supabase project
2. Enable the `pgvector` extension in your database
3. Create the required tables (see SQL schema below)

#### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimensions
  source_app TEXT NOT NULL,
  source_type TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 0.8,
  intent_label TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_id UUID NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  duration INTEGER,
  speaker_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  content TEXT NOT NULL,
  model_used TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  confidence_score FLOAT DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  app_context TEXT DEFAULT 'general',
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  memory_id UUID REFERENCES memories(id),
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  source_app TEXT DEFAULT 'yonder',
  public_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_source_app ON memories(source_app);
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own memories" ON memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON memories FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

### 4. Storage Setup

Create storage buckets in Supabase:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage policies
CREATE POLICY "Users can upload own files" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own files" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 🚀 Running the Backend

### Development Mode

```bash
npm run dev
```

The backend will be available at `http://localhost:3000/api/`

### Production Build

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - System health and service status

### Memory Management
- `POST /api/memories` - Create new memory
- `GET /api/memories` - List memories with filters
- `PUT /api/memories` - Update memory
- `DELETE /api/memories` - Delete memory

### File Upload & Transcription
- `POST /api/upload` - Upload audio file
- `GET /api/upload` - List uploaded files

### Summarization
- `POST /api/summarize` - Generate content summary
- `GET /api/summarize` - List summaries

### Chat (Mere)
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat` - Get chat sessions or messages
- `DELETE /api/chat` - Delete session or message

## 🔄 Job Queues

The backend uses BullMQ for background processing:

### Queue Types
- **transcription** - Audio file transcription
- **embedding** - Vector embedding generation
- **summarization** - Content summarization
- **memory_update** - Memory updates and re-embedding

### Queue Monitoring
- View queue stats via `/api/health` endpoint
- Monitor Redis for queue metrics

## 🤖 LLM Integration

### Fallback Strategy
1. **Ollama** (local) - Primary for summarization
2. **Claude** (cloud) - Fallback for complex analysis
3. **GPT** (cloud) - Final fallback

### Configuration
- Set `OLLAMA_BASE_URL` for local Ollama instance
- Configure API keys for cloud LLMs
- Adjust fallback order in `src/lib/llm.ts`

## 🔒 Security

### Authentication
- JWT-based authentication via Supabase
- Row Level Security (RLS) policies
- API rate limiting

### File Upload Security
- File size limits
- Format validation
- Virus scanning (implemented in job queues)

## 📊 Monitoring

### Health Checks
- Database connectivity
- Redis queue status
- LLM service availability
- File storage access

### Logging
- Structured logging with Winston
- Error tracking with Sentry (optional)
- Performance metrics

## 🧪 Testing

### API Testing
```bash
npm run test
```

### Manual Testing
Use the health endpoint to verify all services:
```bash
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Ensure Redis is running: `redis-server`
   - Check connection settings in `.env.local`

2. **Supabase Connection Issues**
   - Verify project URL and API keys
   - Check RLS policies are properly configured

3. **Ollama Not Responding**
   - Start Ollama: `ollama serve`
   - Pull required models: `ollama pull mistral`

4. **File Upload Failures**
   - Check storage bucket permissions
   - Verify file size and format limits

### Debug Mode
Set `DEBUG=true` in environment to enable detailed logging.

## 📈 Performance Optimization

### Database
- Use pgvector indexes for similarity search
- Implement connection pooling
- Monitor slow queries

### Caching
- Redis for session data
- Vector similarity cache
- LLM response caching

### Scaling
- Horizontal scaling with multiple workers
- Load balancing for API routes
- CDN for file storage

## 🔄 Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new endpoints
3. Update documentation
4. Ensure all services are healthy before merging

---

For more detailed information about specific features, see the `taskbd.md` file which contains 200+ backend acceptance criteria. 