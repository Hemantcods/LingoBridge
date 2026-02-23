/**
 * Utility for safely chunking text while preserving sentence boundaries
 * @param {string} text - The text to chunk
 * @param {number} maxChunkSize - Maximum characters per chunk (default: 3500)
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, maxChunkSize = 3500) {
  if (!text || text.length === 0) return [];

  const chunks = [];
  let currentChunk = '';

  // Split into sentences (basic regex for common sentence endings)
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    // If adding this sentence would exceed the limit, save current chunk
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Add remaining chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}