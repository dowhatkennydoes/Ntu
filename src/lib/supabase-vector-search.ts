import { supabase } from './supabase-client'

// Vector search functions for semantic memory search

/**
 * Search for similar memories using vector similarity
 * @param queryEmbedding - The embedding vector to search for
 * @param userId - The user ID to scope the search
 * @param matchThreshold - Similarity threshold (0-1)
 * @param matchCount - Maximum number of results
 * @returns Array of similar memories
 */
export async function searchSimilarMemories(
  queryEmbedding: number[],
  userId: string,
  matchThreshold: number = 0.78,
  matchCount: number = 10
) {
  const { data, error } = await supabase
    .rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      p_user_id: userId
    })

  if (error) {
    console.error('Error searching memories:', error)
    throw error
  }

  return data
}

/**
 * Create a memory with embedding
 * @param memoryData - Memory data including embedding
 * @returns Created memory
 */
export async function createMemoryWithEmbedding(memoryData: {
  user_id: string
  content: string
  embedding: number[]
  source_app: string
  source_type: string
  confidence_score?: number
  intent_label?: string
}) {
  const { data, error } = await supabase
    .from('memories')
    .insert(memoryData)
    .select()
    .single()

  if (error) {
    console.error('Error creating memory:', error)
    throw error
  }

  return data
}

/**
 * Update memory embedding
 * @param memoryId - Memory ID to update
 * @param embedding - New embedding vector
 * @returns Updated memory
 */
export async function updateMemoryEmbedding(
  memoryId: string,
  embedding: number[]
) {
  const { data, error } = await supabase
    .from('memories')
    .update({ embedding })
    .eq('id', memoryId)
    .select()
    .single()

  if (error) {
    console.error('Error updating memory embedding:', error)
    throw error
  }

  return data
}

/**
 * Get memories by content similarity (text-based search)
 * @param query - Text query to search for
 * @param userId - User ID to scope the search
 * @param limit - Maximum number of results
 * @returns Array of matching memories
 */
export async function searchMemoriesByContent(
  query: string,
  userId: string,
  limit: number = 10
) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .textSearch('content', query, {
      type: 'websearch',
      config: 'english'
    })
    .limit(limit)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching memories by content:', error)
    throw error
  }

  return data
}

/**
 * Get memories by tags/intent labels
 * @param tags - Array of tags to search for
 * @param userId - User ID to scope the search
 * @param limit - Maximum number of results
 * @returns Array of matching memories
 */
export async function searchMemoriesByTags(
  tags: string[],
  userId: string,
  limit: number = 10
) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .in('intent_label', tags)
    .limit(limit)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching memories by tags:', error)
    throw error
  }

  return data
}

/**
 * Get related memories based on source and content similarity
 * @param memoryId - Memory ID to find related memories for
 * @param userId - User ID to scope the search
 * @param limit - Maximum number of results
 * @returns Array of related memories
 */
export async function getRelatedMemories(
  memoryId: string,
  userId: string,
  limit: number = 5
) {
  // First get the target memory
  const { data: targetMemory, error: targetError } = await supabase
    .from('memories')
    .select('*')
    .eq('id', memoryId)
    .eq('user_id', userId)
    .single()

  if (targetError || !targetMemory) {
    throw new Error('Memory not found')
  }

  // Search for related memories using vector similarity
  if (targetMemory.embedding) {
    return await searchSimilarMemories(
      targetMemory.embedding,
      userId,
      0.7,
      limit
    )
  }

  // Fallback to content-based search
  return await searchMemoriesByContent(
    targetMemory.content.substring(0, 100), // Use first 100 chars
    userId,
    limit
  )
}

/**
 * Batch insert memories with embeddings
 * @param memories - Array of memory data with embeddings
 * @returns Array of created memories
 */
export async function batchCreateMemories(
  memories: Array<{
    user_id: string
    content: string
    embedding: number[]
    source_app: string
    source_type: string
    confidence_score?: number
    intent_label?: string
  }>
) {
  const { data, error } = await supabase
    .from('memories')
    .insert(memories)
    .select()

  if (error) {
    console.error('Error batch creating memories:', error)
    throw error
  }

  return data
}

/**
 * Get memory statistics for a user
 * @param userId - User ID to get stats for
 * @returns Memory statistics
 */
export async function getMemoryStats(userId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select('source_app, source_type, created_at')
    .eq('user_id', userId)

  if (error) {
    console.error('Error getting memory stats:', error)
    throw error
  }

  const stats = {
    total: data.length,
    bySource: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    recent: data.filter(m => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(m.created_at) > weekAgo
    }).length
  }

  data.forEach(memory => {
    stats.bySource[memory.source_app] = (stats.bySource[memory.source_app] || 0) + 1
    stats.byType[memory.source_type] = (stats.byType[memory.source_type] || 0) + 1
  })

  return stats
}

/**
 * Delete memory and its related data
 * @param memoryId - Memory ID to delete
 * @param userId - User ID for authorization
 * @returns Success status
 */
export async function deleteMemory(memoryId: string, userId: string) {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting memory:', error)
    throw error
  }

  return true
}

/**
 * Update memory content and regenerate embedding
 * @param memoryId - Memory ID to update
 * @param content - New content
 * @param embedding - New embedding (optional, will be generated if not provided)
 * @param userId - User ID for authorization
 * @returns Updated memory
 */
export async function updateMemory(
  memoryId: string,
  content: string,
  embedding?: number[],
  userId?: string
) {
  const updateData: any = { content }
  
  if (embedding) {
    updateData.embedding = embedding
  }

  const query = supabase
    .from('memories')
    .update(updateData)
    .eq('id', memoryId)

  if (userId) {
    query.eq('user_id', userId)
  }

  const { data, error } = await query.select().single()

  if (error) {
    console.error('Error updating memory:', error)
    throw error
  }

  return data
} 