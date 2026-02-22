async function streamGeminiSummarizer(text, apiKey, onChunk) {
  console.log("Gemini Service: Streaming API...");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Summarize this text in 2-3 bullet points: ${text}` }] }]
    })
  });

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch (e) { /* ignore */ }
    console.error("Gemini Service: API call failed with status", response.status);
    throw new Error(data?.error?.message || `API Error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Parse JSON objects from the stream buffer
    // The stream format is a JSON array: [{...}, {...}]
    // We look for balanced braces to extract complete objects
    let depth = 0;
    let start = -1;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (buffer[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const jsonStr = buffer.substring(start, i + 1);
          try {
            const data = JSON.parse(jsonStr);
            if (data.candidates && data.candidates[0].content) {
              const chunk = data.candidates[0].content.parts[0].text;
              if (chunk) onChunk(chunk);
            }
            buffer = buffer.substring(i + 1); // Advance buffer
            i = -1; // Reset loop
            start = -1;
          } catch (e) {
            // Incomplete or invalid JSON, continue reading
          }
        }
      }
    }
  }
}

async function callGeminiSummarizer(text, apiKey) {
  console.log("Gemini Service: Calling API...");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Summarize this text in 2-3 bullet points: ${text}` }] }]
    })
  });

  if (!response.ok) {
    const data = await response.json();
    console.error("Gemini Service: API call failed with status", response.status);
    throw new Error(data.error?.message || `API Error: ${response.status}`);
  }
  const data = await response.json();
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("No summary generated. The content might have been blocked.");
  }
  return data.candidates[0].content.parts[0].text;
}
export { streamGeminiSummarizer, callGeminiSummarizer }