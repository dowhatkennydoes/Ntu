-- Function to match memories using vector similarity
-- This function is used by the vector search utility

CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  source_app text,
  source_type text,
  confidence_score float,
  intent_label text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.content,
    m.source_app,
    m.source_type,
    m.confidence_score,
    m.intent_label,
    m.created_at,
    1 - (m.embedding <=> query_embedding) as similarity
  FROM memories m
  WHERE m.user_id = match_memories.user_id
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$; 