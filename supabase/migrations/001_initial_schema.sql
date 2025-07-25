-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories table with vector support
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  source_app TEXT NOT NULL,
  source_type TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 0.0,
  intent_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  duration INTEGER DEFAULT 0,
  speaker_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  content TEXT NOT NULL,
  model_used TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  confidence_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  app_context TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google OAuth tokens table
CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  google_user_id TEXT NOT NULL,
  google_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  hangout_link TEXT,
  location TEXT,
  creator_email TEXT NOT NULL,
  attendees TEXT[] DEFAULT '{}',
  is_recurring BOOLEAN DEFAULT false,
  recurring_event_id TEXT,
  status TEXT CHECK (status IN ('upcoming', 'live', 'past', 'cancelled')) DEFAULT 'upcoming',
  auto_transcribe BOOLEAN DEFAULT false,
  custom_labels TEXT[] DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('host', 'participant', 'guest')) DEFAULT 'participant',
  join_time TIMESTAMP WITH TIME ZONE,
  leave_time TIMESTAMP WITH TIME ZONE,
  attendance_status TEXT CHECK (attendance_status IN ('invited', 'accepted', 'declined', 'attended', 'no_show')) DEFAULT 'invited',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting transcripts table
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  content TEXT NOT NULL,
  speaker TEXT,
  timestamp INTEGER DEFAULT 0, -- seconds from start
  confidence_score FLOAT DEFAULT 0.0,
  language TEXT DEFAULT 'en',
  chunk_index INTEGER DEFAULT 0,
  is_partial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting summaries table
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  agenda TEXT,
  key_takeaways TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  participants TEXT[] DEFAULT '{}',
  model_used TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  confidence_score FLOAT DEFAULT 0.0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting bot sessions table
CREATE TABLE IF NOT EXISTS meeting_bot_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bot_email TEXT NOT NULL,
  join_time TIMESTAMP WITH TIME ZONE,
  leave_time TIMESTAMP WITH TIME ZONE,
  join_delay INTEGER DEFAULT 0, -- seconds
  join_status TEXT CHECK (join_status IN ('pending', 'success', 'failed', 'lobby_waiting')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_user_id ON google_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_meeting_id ON meeting_transcripts(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_meeting_id ON meeting_summaries(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bot_sessions_meeting_id ON meeting_bot_sessions(meeting_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bot_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own memories" ON memories FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own memories" ON memories FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own memories" ON memories FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own memories" ON memories FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own transcripts" ON transcripts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own transcripts" ON transcripts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own transcripts" ON transcripts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own transcripts" ON transcripts FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own summaries" ON summaries FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own summaries" ON summaries FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own summaries" ON summaries FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own summaries" ON summaries FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own chat sessions" ON chat_sessions FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own chat messages" ON chat_messages FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own chat messages" ON chat_messages FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own oauth tokens" ON google_oauth_tokens FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own oauth tokens" ON google_oauth_tokens FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own oauth tokens" ON google_oauth_tokens FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own oauth tokens" ON google_oauth_tokens FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own meetings" ON meetings FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own meetings" ON meetings FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own meetings" ON meetings FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own meetings" ON meetings FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view meeting participants" ON meeting_participants FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert meeting participants" ON meeting_participants FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update meeting participants" ON meeting_participants FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete meeting participants" ON meeting_participants FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view meeting transcripts" ON meeting_transcripts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert meeting transcripts" ON meeting_transcripts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update meeting transcripts" ON meeting_transcripts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete meeting transcripts" ON meeting_transcripts FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view meeting summaries" ON meeting_summaries FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert meeting summaries" ON meeting_summaries FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update meeting summaries" ON meeting_summaries FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete meeting summaries" ON meeting_summaries FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view meeting bot sessions" ON meeting_bot_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert meeting bot sessions" ON meeting_bot_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update meeting bot sessions" ON meeting_bot_sessions FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete meeting bot sessions" ON meeting_bot_sessions FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_google_oauth_tokens_updated_at BEFORE UPDATE ON google_oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_summaries_updated_at BEFORE UPDATE ON meeting_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_bot_sessions_updated_at BEFORE UPDATE ON meeting_bot_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 