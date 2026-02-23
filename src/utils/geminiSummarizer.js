import { streamGeminiSummarizer } from '../background/gemini.js';

/**
 * Summarizes YouTube transcript by processing chunks and combining results
 * @param {string[]} chunks - Array of transcript chunks
 * @param {string} apiKey - Gemini API key
 * @param {string} mode - Summary mode: 'tldr', 'bullets', 'detailed'
 * @param {function} onChunk - Callback for streaming chunks
 * @returns {Promise<string>} Final combined summary
 */
export async function summarizeYouTubeTranscript(chunks, apiKey, mode = 'bullets', onChunk) {
  if (!chunks || chunks.length === 0) {
    throw new Error('No transcript chunks to summarize');
  }

  const modePrompts = {
    tldr: 'Provide a quick TL;DR summary in 1-2 sentences.',
    bullets: 'Summarize in 4-6 concise bullet points.',
    detailed: 'Provide detailed study notes with key points, main ideas, and important details.'
  };

  const prompt = modePrompts[mode] || modePrompts.bullets;

  // If only one chunk, summarize directly
  if (chunks.length === 1) {
    return await summarizeChunk(chunks[0], apiKey, prompt, onChunk);
  }

  // Process chunks and collect partial summaries
  const partialSummaries = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const partialPrompt = `This is part ${i + 1} of ${chunks.length} of a YouTube video transcript. ${prompt} Focus on the key information in this segment.`;

    try {
      const partialSummary = await summarizeChunk(chunk, apiKey, partialPrompt, onChunk);
      partialSummaries.push(partialSummary);
    } catch (error) {
      console.error(`Failed to summarize chunk ${i + 1}:`, error);
      // Continue with other chunks
    }
  }

  if (partialSummaries.length === 0) {
    throw new Error('Failed to generate any partial summaries');
  }

  // Combine partial summaries into final summary
  const combinedText = partialSummaries.join('\n\n');
  const finalPrompt = `Combine these partial summaries of a YouTube video into a single cohesive ${mode} summary. Remove duplicates and ensure logical flow. ${prompt}`;

  return await summarizeChunk(combinedText, apiKey, finalPrompt, onChunk);
}

/**
 * Summarizes a single chunk of text
 * @param {string} text - Text to summarize
 * @param {string} apiKey - Gemini API key
 * @param {string} prompt - Summary prompt
 * @param {function} onChunk - Callback for streaming chunks
 * @returns {Promise<string>} Summary text
 */
async function summarizeChunk(text, apiKey, prompt, onChunk) {
  return new Promise((resolve, reject) => {
    let fullSummary = '';

    streamGeminiSummarizer(`${prompt}\n\nText: ${text}`, apiKey, (chunk) => {
      fullSummary += chunk;
      if (onChunk) onChunk(chunk);
    })
    .then(() => resolve(fullSummary))
    .catch(reject);
  });
}