import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (to be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          content: string
          embedding: number[]
          source_app: string
          source_type: string
          confidence_score: number
          intent_label: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          embedding?: number[]
          source_app: string
          source_type: string
          confidence_score?: number
          intent_label?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          embedding?: number[]
          source_app?: string
          source_type?: string
          confidence_score?: number
          intent_label?: string
          created_at?: string
          updated_at?: string
        }
      }
      transcripts: {
        Row: {
          id: string
          user_id: string
          file_id: string
          content: string
          language: string
          duration: number
          speaker_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_id: string
          content: string
          language?: string
          duration?: number
          speaker_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_id?: string
          content?: string
          language?: string
          duration?: number
          speaker_count?: number
          created_at?: string
        }
      }
      summaries: {
        Row: {
          id: string
          user_id: string
          source_id: string
          source_type: string
          content: string
          model_used: string
          input_tokens: number
          output_tokens: number
          confidence_score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_id: string
          source_type: string
          content: string
          model_used: string
          input_tokens: number
          output_tokens: number
          confidence_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_id?: string
          source_type?: string
          content?: string
          model_used?: string
          input_tokens?: number
          output_tokens?: number
          confidence_score?: number
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          app_context: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          app_context: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          app_context?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          memory_id?: string
          tokens_used?: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          memory_id?: string
          tokens_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          memory_id?: string
          tokens_used?: number
          created_at?: string
        }
      }
    }
  }
} 