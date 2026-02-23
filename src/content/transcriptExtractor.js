/**
 * Extracts transcript from YouTube video page
 * @returns {Promise<{success: boolean, transcript?: string, reason?: string}>}
 */
export async function extractYouTubeTranscript() {
  try {
    console.log('Lingo Bridge: Starting transcript extraction...');
    
    // Wait for YouTube to load
    await waitForYouTubeData();

    const playerResponse = window.ytInitialPlayerResponse;
    if (!playerResponse) {
      console.log('Lingo Bridge: ytInitialPlayerResponse not found');
      return { success: false, reason: 'YouTube data not available' };
    }

    console.log('Lingo Bridge: Found YouTube data, checking captions...');
    const captions = playerResponse.captions;
    if (!captions || !captions.playerCaptionsTracklistRenderer) {
      console.log('Lingo Bridge: No captions in player response');
      return { success: false, reason: 'No captions available for this video' };
    }

    const captionTracks = captions.playerCaptionsTracklistRenderer.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
      console.log('Lingo Bridge: No caption tracks found');
      return { success: false, reason: 'No caption tracks found' };
    }

    console.log('Lingo Bridge: Found', captionTracks.length, 'caption tracks');
    
    // Prefer English captions, fallback to first available
    let selectedTrack = captionTracks.find(track => track.languageCode === 'en');
    if (!selectedTrack) {
      selectedTrack = captionTracks[0];
      console.log('Lingo Bridge: Using non-English captions:', selectedTrack.languageCode);
    } else {
      console.log('Lingo Bridge: Using English captions');
    }

    if (!selectedTrack.baseUrl) {
      console.log('Lingo Bridge: No baseUrl in selected track');
      return { success: false, reason: 'Caption track URL not available' };
    }

    console.log('Lingo Bridge: Fetching captions from:', selectedTrack.baseUrl);
    
    // Fetch caption data
    const response = await fetch(selectedTrack.baseUrl);
    if (!response.ok) {
      console.log('Lingo Bridge: Fetch failed with status:', response.status);
      return { success: false, reason: 'Failed to fetch captions' };
    }

    const xmlText = await response.text();
    console.log('Lingo Bridge: Received XML, parsing...');
    const transcript = parseCaptionXML(xmlText);

    if (!transcript.trim()) {
      console.log('Lingo Bridge: Parsed transcript is empty');
      return { success: false, reason: 'Empty transcript' };
    }

    console.log('Lingo Bridge: Successfully extracted transcript, length:', transcript.length);
    return { success: true, transcript: transcript.trim() };

  } catch (error) {
    console.error('Lingo Bridge: Transcript extraction error:', error);
    return { success: false, reason: 'Error extracting transcript: ' + error.message };
  }
}

/**
 * Wait for YouTube's ytInitialPlayerResponse to be available
 */
function waitForYouTubeData() {
  return new Promise((resolve) => {
    const checkData = () => {
      if (window.ytInitialPlayerResponse) {
        resolve();
      } else {
        setTimeout(checkData, 100);
      }
    };
    checkData();
  });
}

/**
 * Parse YouTube caption XML into plain text
 * @param {string} xmlText - Raw XML caption data
 * @returns {string} Plain text transcript
 */
function parseCaptionXML(xmlText) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const textElements = xmlDoc.querySelectorAll('text');
    const transcriptParts = [];

    for (const element of textElements) {
      const text = element.textContent || '';
      // Remove HTML entities and clean up
      const cleanText = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      if (cleanText) {
        transcriptParts.push(cleanText);
      }
    }

    return transcriptParts.join(' ');
  } catch (error) {
    console.error('XML parsing error:', error);
    return '';
  }
}