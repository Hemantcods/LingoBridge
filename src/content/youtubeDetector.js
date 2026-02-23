/**
 * Detects if current page is a YouTube video page
 * @returns {boolean} True if on YouTube video page
 */
export function isYouTubeVideoPage() {
  try {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // Check if on youtube.com
    if (!hostname.includes('youtube.com')) {
      return false;
    }

    // Check if it's a watch page with video ID
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    console.log(videoId)
    return url.includes('/watch') && videoId && videoId.length > 0;
  } catch (error) {
    console.error('Error detecting YouTube page:', error);
    return false;
  }
}

/**
 * Gets the YouTube video title
 * @returns {string} Video title or fallback
 */
export function getYouTubeVideoTitle() {
  try {
    // Try to get title from YouTube's data
    if (window.ytInitialPlayerResponse &&
        window.ytInitialPlayerResponse.videoDetails &&
        window.ytInitialPlayerResponse.videoDetails.title) {
      return window.ytInitialPlayerResponse.videoDetails.title;
    }

    // Fallback to document title
    const title = document.title;
    if (title && title.includes(' - YouTube')) {
      return title.replace(' - YouTube', '').trim();
    }

    return title || 'YouTube Video';
  } catch (error) {
    console.error('Error getting video title:', error);
    return 'YouTube Video';
  }
}