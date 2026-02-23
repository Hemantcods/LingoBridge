import { speakText, stopSpeaking } from './index.js';

/**
 * YouTube Summary Overlay Component
 */
export class YouTubeSummaryOverlay {
  constructor() {
    this.overlay = null;
    this.isVisible = false;
    this.currentSummary = '';
    this.videoTitle = '';
    this.isLoading = false;
    this.mode = 'bullets';
  }

  /**
   * Show the overlay with loading state
   * @param {string} videoTitle - Title of the YouTube video
   */
  show(videoTitle) {
    if (this.overlay) {
      this.hide();
    }

    this.videoTitle = videoTitle;
    this.isLoading = true;
    this.currentSummary = '';
    this.createOverlay();
    this.isVisible = true;
  }

  /**
   * Hide the overlay
   */
  hide() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.isVisible = false;
    stopSpeaking();
  }

  /**
   * Update loading state
   * @param {boolean} loading - Whether still loading
   */
  setLoading(loading) {
    this.isLoading = loading;
    this.updateContent();
  }

  /**
   * Append chunk to summary
   * @param {string} chunk - Text chunk to append
   */
  appendChunk(chunk) {
    this.currentSummary += chunk;
    this.updateContent();
  }

  /**
   * Set summary mode
   * @param {string} mode - Summary mode ('tldr', 'bullets', 'detailed')
   */
  setMode(mode) {
    this.mode = mode;
  }

  /**
   * Create the overlay DOM elements
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'lingo-youtube-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: '2147483647',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    });

    const container = document.createElement('div');
    Object.assign(container.style, {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      maxHeight: '80vh',
      width: '90%',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white'
    });

    // Header
    const header = document.createElement('div');
    header.style.marginBottom = '16px';

    const title = document.createElement('h2');
    title.textContent = this.videoTitle;
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#3b82f6'
    });

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Video Summary';
    Object.assign(subtitle.style, {
      margin: '0',
      fontSize: '14px',
      color: '#9ca3af'
    });

    header.appendChild(title);
    header.appendChild(subtitle);

    // Mode selector
    const modeSelector = this.createModeSelector();

    // Content area
    const contentArea = document.createElement('div');
    Object.assign(contentArea.style, {
      flex: '1',
      overflowY: 'auto',
      marginBottom: '16px',
      minHeight: '200px',
      maxHeight: '400px'
    });

    this.contentElement = document.createElement('div');
    Object.assign(this.contentElement.style, {
      fontSize: '14px',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap'
    });

    contentArea.appendChild(this.contentElement);

    // Buttons
    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end'
    });

    const speakBtn = this.createButton('🔊 Speak', () => this.speakSummary());
    const copyBtn = this.createButton('📋 Copy', () => this.copySummary());
    const closeBtn = this.createButton('✕ Close', () => this.hide());

    Object.assign(closeBtn.style, {
      backgroundColor: '#ef4444',
      color: 'white'
    });

    buttonContainer.appendChild(speakBtn);
    buttonContainer.appendChild(copyBtn);
    buttonContainer.appendChild(closeBtn);

    container.appendChild(header);
    container.appendChild(modeSelector);
    container.appendChild(contentArea);
    container.appendChild(buttonContainer);

    this.overlay.appendChild(container);
    document.body.appendChild(this.overlay);

    this.updateContent();
  }

  /**
   * Create mode selector
   */
  createModeSelector() {
    const container = document.createElement('div');
    container.style.marginBottom = '16px';

    const label = document.createElement('label');
    label.textContent = 'Summary Style: ';
    Object.assign(label.style, {
      fontSize: '14px',
      color: '#9ca3af',
      marginRight: '8px'
    });

    const select = document.createElement('select');
    Object.assign(select.style, {
      backgroundColor: '#2a2a2a',
      color: 'white',
      border: '1px solid #4a4a4a',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '14px'
    });

    const options = [
      { value: 'tldr', label: 'Quick TL;DR' },
      { value: 'bullets', label: 'Bullet Points' },
      { value: 'detailed', label: 'Detailed Notes' }
    ];

    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      if (option.value === this.mode) {
        optionElement.selected = true;
      }
      select.appendChild(optionElement);
    });

    select.addEventListener('change', (e) => {
      this.mode = e.target.value;
      // Could trigger re-summarization here if needed
    });

    container.appendChild(label);
    container.appendChild(select);
    return container;
  }

  /**
   * Create a button element
   */
  createButton(text, onClick) {
    const button = document.createElement('button');
    Object.assign(button.style, {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s'
    });

    button.textContent = text;
    button.addEventListener('click', onClick);
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#2563eb';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#3b82f6';
    });

    return button;
  }

  /**
   * Update the content display
   */
  updateContent() {
    if (!this.contentElement) return;

    if (this.isLoading && !this.currentSummary) {
      this.contentElement.textContent = '🔄 Generating summary...';
      this.contentElement.style.color = '#9ca3af';
    } else if (this.currentSummary) {
      this.contentElement.textContent = this.currentSummary;
      this.contentElement.style.color = 'white';
    } else {
      this.contentElement.textContent = 'No summary available';
      this.contentElement.style.color = '#9ca3af';
    }
  }

  /**
   * Speak the current summary
   */
  speakSummary() {
    if (this.currentSummary) {
      speakText(this.currentSummary, 'en-US');
    }
  }

  /**
   * Copy summary to clipboard
   */
  async copySummary() {
    try {
      await navigator.clipboard.writeText(this.currentSummary);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  }
}