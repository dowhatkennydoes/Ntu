# Supabase Setup Guide for NTU App

This guide will help you set up Supabase for your NTU application.

## 🚀 Quick Start

### 1. Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Initialize Supabase in Your Project

```bash
# Initialize Supabase (creates supabase/ directory)
supabase init

# Start Supabase locally
supabase start
```

### 3. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `ntu-app`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 4. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### 5. Update Environment Variables

Please manually update your `.env` file with these values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://chtzfqiigqaterznidnp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodHpmcWlpZ3FhdGVyem5pZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzE0MDMsImV4cCI6MjA2ODkwNzQwM30.mtMjO7x0MqV5sEmIxU4iTUsmObGEbIgpiuKqvlndqH8
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**You still need to get your service role key from the Supabase dashboard:**

1. Go to https://supabase.com/dashboard/project/chtzfqiigqaterznidnp
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (it starts with `eyJ...`)

Once you've updated the `.env` file with both keys, let's test the connection:

### 6. Run Database Migrations

```bash
# Apply the initial schema
supabase db push

# Or if you want to reset and start fresh
supabase db reset
```

## 🗄️ Database Schema

The migration file `supabase/migrations/001_initial_schema.sql` creates the following tables:

### Core Tables
- **users** - User accounts and profiles
- **memories** - AI-powered memory storage with vector embeddings
- **transcripts** - Audio/video transcription data
- **summaries** - AI-generated content summaries
- **chat_sessions** - Chat conversation sessions
- **chat_messages** - Individual chat messages

### Meeting Tables
- **meetings** - Google Calendar meeting data
- **meeting_participants** - Meeting attendee information
- **meeting_transcripts** - Real-time meeting transcription
- **meeting_summaries** - AI-generated meeting summaries
- **meeting_bot_sessions** - Bot participation tracking
- **google_oauth_tokens** - Google OAuth token storage

### Features Included
- ✅ **Row Level Security (RLS)** - Data isolation per user
- ✅ **Vector Search** - Semantic search with pgvector
- ✅ **UUID Primary Keys** - Secure, non-sequential IDs
- ✅ **Timestamps** - Automatic created_at/updated_at tracking
- ✅ **Indexes** - Optimized query performance
- ✅ **Foreign Keys** - Data integrity constraints

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure users can only access their own data:

```sql
-- Example policy for memories table
CREATE POLICY "Users can view own memories" 
ON memories FOR SELECT 
USING (auth.uid()::text = user_id::text);
```

### Authentication
- JWT-based authentication
- Token rotation enabled
- Configurable session duration
- Email confirmation (optional)

## 🧪 Local Development

### Start Local Supabase
```bash
supabase start
```

This will start:
- **Database**: PostgreSQL on port 54322
- **API**: REST API on port 54321
- **Studio**: Web interface on port 54323
- **Auth**: Authentication service
- **Storage**: File storage service
- **Realtime**: Real-time subscriptions

### Access Local Services
- **Supabase Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Database**: `postgresql://postgres:postgres@localhost:54322/postgres`

### Stop Local Supabase
```bash
supabase stop
```

## 🔄 Database Migrations

### Create a New Migration
```bash
supabase migration new migration_name
```

### Apply Migrations
```bash
# Apply to local database
supabase db push

# Apply to remote database
supabase db push --db-url "your-remote-db-url"
```

### Reset Database
```bash
# Reset local database
supabase db reset

# Reset remote database (⚠️ DESTRUCTIVE)
supabase db reset --db-url "your-remote-db-url"
```

## 📊 Vector Search Setup

The database includes pgvector extension for semantic search:

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create vector index for memories
CREATE INDEX idx_memories_embedding 
ON memories USING ivfflat (embedding vector_cosine_ops);
```

### Using Vector Search
```typescript
// Search for similar memories
const { data, error } = await supabase
  .rpc('match_memories', {
    query_embedding: embedding,
    match_threshold: 0.78,
    match_count: 10
  })
```

## 🔧 TypeScript Integration

### Generate Types
```bash
# Generate types from your database
supabase gen types typescript --local > src/types/database.ts
```

### Use Generated Types
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## 🚀 Production Deployment

### 1. Environment Variables
Ensure all environment variables are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Migrations
```bash
# Apply migrations to production
supabase db push --db-url "your-production-db-url"
```

### 3. Enable Production Features
- Set up custom domains
- Configure email providers
- Set up monitoring and alerts
- Enable backup retention

## 🛠️ Troubleshooting

### Common Issues

#### 1. Connection Errors
```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start
```

#### 2. Migration Errors
```bash
# Reset and reapply migrations
supabase db reset
supabase db push
```

#### 3. RLS Policy Issues
```bash
# Check RLS policies
supabase db diff --schema public
```

#### 4. Vector Search Not Working
```bash
# Verify pgvector extension
psql -h localhost -p 54322 -U postgres -d postgres -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Getting Help
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 📋 Checklist

- [ ] Install Supabase CLI
- [ ] Initialize Supabase project
- [ ] Create remote Supabase project
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Test local development
- [ ] Set up production environment
- [ ] Configure authentication
- [ ] Test vector search
- [ ] Set up monitoring

## 🎯 Next Steps

1. **Authentication**: Set up user signup/login flows
2. **Storage**: Configure file uploads for audio/video
3. **Realtime**: Enable real-time features for chat
4. **Edge Functions**: Create serverless functions
5. **Monitoring**: Set up logging and analytics

Your NTU app is now ready to use Supabase! 🚀 