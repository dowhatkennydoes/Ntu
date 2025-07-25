// Simple embedding generator for testing purposes
// In production, you'd use OpenAI's text-embedding-ada-002 or similar

export class EmbeddingGenerator {
  private static instance: EmbeddingGenerator

  static getInstance(): EmbeddingGenerator {
    if (!EmbeddingGenerator.instance) {
      EmbeddingGenerator.instance = new EmbeddingGenerator()
    }
    return EmbeddingGenerator.instance
  }

  // Generate a simple embedding based on text content
  // This is a mock implementation - replace with real embedding service
  async generateEmbedding(text: string): Promise<number[]> {
    // Simple hash-based embedding for testing
    const hash = this.simpleHash(text)
    const embedding = new Array(1536).fill(0)
    
    // Distribute the hash across the embedding dimensions
    for (let i = 0; i < 1536; i++) {
      embedding[i] = Math.sin(hash + i) * 0.1
    }
    
    return embedding
  }

  // Generate embeddings for multiple texts
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = []
    
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text)
      embeddings.push(embedding)
    }
    
    return embeddings
  }

  // Calculate similarity between two embeddings
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)

    if (norm1 === 0 || norm2 === 0) {
      return 0
    }

    return dotProduct / (norm1 * norm2)
  }

  // Simple hash function for generating consistent embeddings
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Generate test embeddings for different types of content
  async generateTestEmbeddings(): Promise<{
    memories: Array<{ content: string; embedding: number[] }>
    queries: Array<{ query: string; embedding: number[] }>
  }> {
    const testMemories = [
      "I learned about machine learning algorithms today",
      "The meeting discussed Q4 sales projections",
      "Python is a great programming language for data science",
      "We need to improve our customer support process",
      "The new product launch was successful",
      "I read an interesting article about AI ethics",
      "The team completed the sprint ahead of schedule",
      "We should implement better security measures",
      "The conference was informative and well-organized",
      "I'm working on improving our database performance"
    ]

    const testQueries = [
      "machine learning",
      "sales meeting",
      "programming languages",
      "customer service",
      "product launch",
      "artificial intelligence",
      "project management",
      "cybersecurity",
      "professional development",
      "database optimization"
    ]

    const memoryEmbeddings = await this.generateEmbeddings(testMemories)
    const queryEmbeddings = await this.generateEmbeddings(testQueries)

    return {
      memories: testMemories.map((content, i) => ({
        content,
        embedding: memoryEmbeddings[i]
      })),
      queries: testQueries.map((query, i) => ({
        query,
        embedding: queryEmbeddings[i]
      }))
    }
  }
}

// Export singleton instance
export const embeddingGenerator = EmbeddingGenerator.getInstance()

// Convenience functions
export const generateEmbedding = (text: string) => embeddingGenerator.generateEmbedding(text)
export const generateEmbeddings = (texts: string[]) => embeddingGenerator.generateEmbeddings(texts)
export const calculateSimilarity = (embedding1: number[], embedding2: number[]) => 
  embeddingGenerator.calculateSimilarity(embedding1, embedding2)
export const generateTestEmbeddings = () => embeddingGenerator.generateTestEmbeddings() 