// Import YouTube functionality
import { isYouTubeVideoPage, getYouTubeVideoTitle } from './youtubeDetector.js';
import { extractYouTubeTranscript } from './transcriptExtractor.js';
import { chunkText } from '../utils/chunker.js';
import { summarizeYouTubeTranscript } from '../utils/geminiSummarizer.js';
import { YouTubeSummaryOverlay } from './YouTubeSummaryOverlay.js';

// TTS functionality using Web Speech API 
function speakText(text, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 0.8;

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Screenshot area selection functionality
let selectionOverlay = null;
let isSelecting = false;
let startX, startY, endX, endY;
let selectionRect = null;
let currentTargetLang = "hi";
let currentSourceLang = null;

// YouTube functionality
let youtubeSummaryOverlay = null;
let youtubeButton = null;
let isYouTubeSummarizing = false;

function createSelectionOverlay() {
  if (selectionOverlay) return selectionOverlay;

  selectionOverlay = document.createElement("div");
  selectionOverlay.id = "lingo-selection-overlay";
  Object.assign(selectionOverlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: "2147483646",
    cursor: "crosshair",
    userSelect: "none"
  });

  // Instructions overlay
  const instructions = document.createElement("div");
  Object.assign(instructions.style, {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    zIndex: "2147483647"
  });
  instructions.textContent = "📸 Drag to select the area you want to translate, then release";
  selectionOverlay.appendChild(instructions);

  // Cancel button
  const cancelBtn = document.createElement("button");
  Object.assign(cancelBtn.style, {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    zIndex: "2147483647"
  });
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => removeSelectionOverlay();
  selectionOverlay.appendChild(cancelBtn);

  // Selection rectangle
  selectionRect = document.createElement("div");
  Object.assign(selectionRect.style, {
    position: "absolute",
    border: "2px solid #3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    display: "none",
    pointerEvents: "none",
    zIndex: "2147483647"
  });
  selectionOverlay.appendChild(selectionRect);

  // Mouse event handlers
  selectionOverlay.addEventListener("mousedown", startSelection);
  selectionOverlay.addEventListener("mousemove", updateSelection);
  selectionOverlay.addEventListener("mouseup", endSelection);

  document.body.appendChild(selectionOverlay);
  return selectionOverlay;
}

function removeSelectionOverlay() {
  if (selectionOverlay) {
    selectionOverlay.remove();
    selectionOverlay = null;
    selectionRect = null;
    isSelecting = false;
  }
}

function startSelection(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  endX = e.clientX;
  endY = e.clientY;
  
  Object.assign(selectionRect.style, {
    left: startX + "px",
    top: startY + "px",
    width: "0px",
    height: "0px",
    display: "block"
  });
}

function updateSelection(e) {
  if (!isSelecting) return;
  
  endX = e.clientX;
  endY = e.clientY;
  
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  Object.assign(selectionRect.style, {
    left: left + "px",
    top: top + "px",
    width: width + "px",
    height: height + "px"
  });
}

function endSelection(e) {
  if (!isSelecting) return;
  
  isSelecting = false;
  endX = e.clientX;
  endY = e.clientY;
  
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  // Minimum selection size
  if (width < 50 || height < 50) {
    alert("Please select a larger area (minimum 50x50 pixels)");
    removeSelectionOverlay();
    return;
  }
  
  // Remove selection overlay and proceed with screenshot
  removeSelectionOverlay();
  
  // Send selection coordinates to background script
  chrome.runtime.sendMessage({
    action: "CAPTURE_SELECTED_AREA",
    selection: { left, top, width, height },
    targetLang: currentTargetLang,
    sourceLang: currentSourceLang
  });
}

// Screenshot OCR and Translation functionality
let tesseractWorker = null;

async function initTesseract() {
  if (tesseractWorker) return tesseractWorker;
  
  try {
    console.log('Initializing Tesseract worker...');
    
    // Try to import tesseract.js
    let createWorker;
    try {
      const tesseractModule = await import('tesseract.js');
      createWorker = tesseractModule.createWorker;
      console.log('Tesseract.js imported successfully');
    } catch (importError) {
      console.error('Failed to import tesseract.js:', importError);
      throw new Error(`Failed to import Tesseract.js: ${importError?.message || 'Import failed'}`);
    }
    
    // Try to create the worker
    try {
      tesseractWorker = await createWorker();
      await tesseractWorker.loadLanguage('eng');
      await tesseractWorker.reinitialize('eng');
      console.log('Tesseract worker initialized successfully');
      return tesseractWorker;
    } catch (workerError) {
      console.error('Failed to create Tesseract worker:', workerError);
      throw new Error(`Failed to create Tesseract worker: ${workerError?.message || 'Worker creation failed'}`);
    }
    
  } catch (error) {
    console.error('Failed to initialize Tesseract worker:', error);
    throw error; // Re-throw the specific error we created above
  }
}

// Cleanup Tesseract worker on page unload
window.addEventListener('beforeunload', async () => {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
});

function createScreenshotOverlay(content, isLoading = false) {
  let overlay = document.getElementById("lingo-screenshot-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "lingo-screenshot-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      width: "350px",
      padding: "20px",
      backgroundColor: "#ffffff",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      borderRadius: "12px",
      zIndex: "2147483647",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontSize: "14px",
      color: "#1f2937",
      border: "1px solid #e5e7eb",
      maxHeight: "80vh",
      overflowY: "auto"
    });

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "12px",
      right: "12px",
      background: "transparent",
      border: "none",
      fontSize: "24px",
      lineHeight: "1",
      cursor: "pointer",
      color: "#9ca3af",
      padding: "0",
      width: "30px",
      height: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);

    const title = document.createElement("h3");
    title.textContent = "📸 Screenshot Translation";
    Object.assign(title.style, {
      margin: "0 0 16px 0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827"
    });
    overlay.appendChild(title);

    const body = document.createElement("div");
    body.id = "lingo-screenshot-body";
    body.style.lineHeight = "1.5";
    overlay.appendChild(body);

    document.body.appendChild(overlay);
  }

  const body = overlay.querySelector("#lingo-screenshot-body");
  if (isLoading) {
    body.innerHTML = '<div style="color: #6b7280; text-align: center;"><div>📷 Capturing screenshot...</div><div style="margin-top: 8px;">🤖 Processing with OCR...</div></div>';
  } else {
    body.innerHTML = content;
  }
}

async function processSelectedScreenshot(imageData, selection, targetLang, sourceLang) {
  createScreenshotOverlay(null, true);
  createScreenshotOverlay('<div style="color: #6b7280; text-align: center;"><div>📷 Processing selected area...</div><div style="margin-top: 8px;">✂️ Cropping image...</div></div>');
  
  // Create a canvas to crop the selected area
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = async () => {
    console.log('Image loaded successfully, processing selection...');
    try {
      // Validate selection
      if (!selection || selection.width < 10 || selection.height < 10) {
        console.error('Invalid selection:', selection);
        createScreenshotOverlay('<div style="color: #ef4444;">❌ Error: Selection too small. Please select a larger area with text.</div>');
        return;
      }
      
      // Set canvas size to selection dimensions
      canvas.width = selection.width;
      canvas.height = selection.height;
      
      // Calculate device pixel ratio for proper scaling
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scaledSelection = {
        left: selection.left * devicePixelRatio,
        top: selection.top * devicePixelRatio,
        width: selection.width * devicePixelRatio,
        height: selection.height * devicePixelRatio
      };
      
      // Draw the cropped portion
      ctx.drawImage(
        img,
        scaledSelection.left, scaledSelection.top, scaledSelection.width, scaledSelection.height,
        0, 0, selection.width, selection.height
      );
      
      // Convert to data URL for OCR
      const croppedDataUrl = canvas.toDataURL('image/png');
      
      // Validate cropped image
      if (!croppedDataUrl || croppedDataUrl.length < 100) {
        console.error('Invalid cropped image data');
        createScreenshotOverlay('<div style="color: #ef4444;">❌ Error: Invalid image data. Please try selecting a different area.</div>');
        return;
      }
      
      console.log('Starting OCR processing for selected area:', { width: selection.width, height: selection.height, dataUrlLength: croppedDataUrl.length });
      createScreenshotOverlay('<div style="color: #6b7280; text-align: center;"><div>📷 Processing selected area...</div><div style="margin-top: 8px;">🤖 Processing with OCR...</div></div>');
      
      // Initialize Tesseract worker
      let worker;
      try {
        worker = await initTesseract();
      } catch (initError) {
        console.error('Tesseract initialization failed:', initError);
        createScreenshotOverlay(`
          <div style="color: #ef4444; text-align: center;">
            <div>❌ Screenshot OCR Unavailable</div>
            <div style="margin-top: 8px; font-size: 14px;">
              ${initError.message}
            </div>
            <div style="margin-top: 12px; font-size: 13px; color: #6b7280;">
              <strong>Alternatives:</strong><br>
              • Select text directly on the page<br>
              • Use the regular translation feature<br>
              • Try refreshing the page
            </div>
            <div style="text-align: center; margin-top: 16px;">
              <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
          </div>
        `);
        return;
      }
      console.log('Tesseract worker initialized');
      
      // Perform OCR with progress tracking
      worker.onProgress = (progress) => {
        const percent = Math.round(progress * 100);
        console.log('OCR progress:', percent);
        createScreenshotOverlay(`<div style="color: #6b7280; text-align: center;"><div>📷 Processing selected area...</div><div style="margin-top: 8px;">🤖 Processing with OCR... ${percent}%</div></div>`);
      };
      
      console.log('Starting OCR recognition...');
      
      // Add timeout to OCR process (30 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000);
      });
      
      let text;
      try {
        console.log('Starting OCR recognition...');
        const result = await Promise.race([worker.recognize(croppedDataUrl), timeoutPromise]);
        text = result.data.text;
        console.log('OCR completed, extracted text:', text);
      } catch (ocrError) {
        console.error('OCR failed:', ocrError);
        const errorMessage = ocrError?.message || 'Unknown OCR error';
        createScreenshotOverlay(`<div style="color: #ef4444;">❌ OCR failed: ${errorMessage}. Please try again or select a different area.</div>`);
        return;
      }
      
      if (!text || text.trim().length === 0) {
        createScreenshotOverlay('<div style="color: #ef4444;">❌ No text found in selected area. Try selecting a different region or ensure text is clearly visible.</div>');
        return;
      }

      // Show extracted text
      createScreenshotOverlay(`
        <div style="margin-bottom: 16px;">
          <strong>📝 Extracted Text:</strong><br>
          <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 8px; font-family: monospace; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${text}</div>
        </div>
        <div style="color: #6b7280;">🔄 Translating...</div>
      `);

      // Translate the extracted text
      chrome.runtime.sendMessage({
        type: "GET_TRANSLATION",
        text: text.trim(),
        targetLang: targetLang,
        sourceLang: sourceLang
      }, (response) => {
        if (chrome.runtime.lastError || !response || !response.data) {
          console.error("Translation error:", chrome.runtime.lastError);
          createScreenshotOverlay(`
            <div style="margin-bottom: 16px;">
              <strong>📝 Extracted Text:</strong><br>
              <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 8px; font-family: monospace; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${text}</div>
            </div>
            <div style="color: #ef4444;">❌ Translation failed: ${chrome.runtime.lastError?.message || 'Unknown error'}</div>
          `);
          return;
        }

        // Show final result
        createScreenshotOverlay(`
          <div style="margin-bottom: 16px;">
            <strong>📝 Extracted Text:</strong><br>
            <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 8px; font-family: monospace; white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${text}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <strong>🌍 Translation:</strong><br>
            <div style="background-color: #ecfdf5; padding: 12px; border-radius: 8px; margin-top: 8px; border-left: 4px solid #10b981;">${response.data}</div>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 8px;">Close</button>
            <button onclick="navigator.clipboard.writeText('${response.data.replace(/'/g, "\\'")}')" style="padding: 8px 16px; background-color: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">📋 Copy</button>
          </div>
        `);
      });
      
    } catch (error) {
      console.error("Image processing error:", error);
      const errorMessage = error?.message || 'Unknown error occurred';
      createScreenshotOverlay(`<div style="color: #ef4444;">❌ Error processing selected area: ${errorMessage}</div>`);
    }
  };
  
  img.onerror = () => {
    console.error('Failed to load screenshot image');
    createScreenshotOverlay('<div style="color: #ef4444;">❌ Error loading screenshot image</div>');
  };
  
  console.log('Setting image source...');
  img.src = imageData;
}

const translateSelected = (selected, targetLang, sourceLang = "en") => {
  console.log("Translating selection:", selected.toString());
  const text = selected.toString().trim();
  if (text && selected.rangeCount > 0) {
    if (!chrome.runtime?.id) {
      console.error("Extension context invalidated. Please reload the page.");
      return;
    }

    const range = selected.getRangeAt(0).cloneRange();
    const rect = range.getBoundingClientRect();
    
    // Capture computed styles from the parent element
    const parentEl = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    const computedStyles = window.getComputedStyle(parentEl);
    const textStyles = {
      color: computedStyles.color,
      fontSize: computedStyles.fontSize,
      fontFamily: computedStyles.fontFamily,
      fontWeight: computedStyles.fontWeight,
      lineHeight: computedStyles.lineHeight,
    };

    // Inject Skeleton Loader CSS
    if (!document.getElementById("lingo-skeleton-style")) {
      const style = document.createElement("style");
      style.id = "lingo-skeleton-style";
      style.textContent = `
        .lingo-skeleton-loader {
          display: inline-block;
          vertical-align: middle;
          border-radius: 4px;
          background-color: var(--lingo-skeleton-color, #e0e0e0);
          animation: lingo-pulse 1.5s ease-in-out infinite;
        }
        @keyframes lingo-pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.2; }
          100% { opacity: 0.4; }
        }
      `;
      document.head.appendChild(style);
    }

    const loadingSpan = document.createElement("span");
    loadingSpan.className = "lingo-skeleton-loader";
    loadingSpan.style.width = `${rect.width}px`;
    loadingSpan.style.height = `${rect.height}px`;
    loadingSpan.style.setProperty('--lingo-skeleton-color', textStyles.color);

    const originalContent = range.extractContents();
    range.insertNode(loadingSpan);

    chrome.runtime.sendMessage({
      type: "GET_TRANSLATION",
      text: text,
      targetLang: targetLang || "hi",
      sourceLang: sourceLang
    }, (response) => {
      if (chrome.runtime.lastError || !response || !response.data) {
        console.error("Translation error:", chrome.runtime.lastError);
        const errorSpan = document.createElement("span");
        errorSpan.textContent = " [Translation Failed]";
        errorSpan.style.color = "red";
        errorSpan.style.fontSize = "small";
        originalContent.appendChild(errorSpan);
        loadingSpan.replaceWith(originalContent);
        setTimeout(() => errorSpan.remove(), 3000);
        return;
      }

      if (response?.data) {
        const resultSpan = document.createElement("span");
        resultSpan.textContent = response.data;
        resultSpan.style.color = textStyles.color;
        resultSpan.style.fontSize = textStyles.fontSize;
        resultSpan.style.fontFamily = textStyles.fontFamily;
        resultSpan.style.fontWeight = textStyles.fontWeight;

        // Add TTS button for translated text
        const ttsButton = document.createElement("button");
        ttsButton.innerHTML = "🔊";
        ttsButton.title = "Speak translation";
        Object.assign(ttsButton.style, {
          display: "inline-block",
          marginLeft: "8px",
          padding: "2px 6px",
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "12px",
          cursor: "pointer",
          verticalAlign: "middle"
        });

        let isSpeaking = false;
        ttsButton.onclick = () => {
          if (isSpeaking) {
            stopSpeaking();
            ttsButton.innerHTML = "🔊";
            ttsButton.style.backgroundColor = "#10b981";
            isSpeaking = false;
          } else {
            speakText(response.data, targetLang || "hi");
            ttsButton.innerHTML = "⏹️";
            ttsButton.style.backgroundColor = "#ef4444";
            isSpeaking = true;

            // Reset button after speaking (approximate duration)
            setTimeout(() => {
              ttsButton.innerHTML = "🔊";
              ttsButton.style.backgroundColor = "#10b981";
              isSpeaking = false;
            }, 3000);
          }
        };

        const container = document.createElement("span");
        container.appendChild(resultSpan);
        container.appendChild(ttsButton);

        loadingSpan.replaceWith(container);
      }
    });
  }
};

// Simple markdown parser for summary display
const parseMarkdown = (markdown) => {
  if (!markdown) return '';

  let html = markdown
    // Headers (# ## ###)
    .replace(/^### (.+)$/gm, (match, p1) => `<h3 style="font-size: 1.1em; font-weight: bold; margin: 0.5em 0 0.3em 0;">${p1}</h3>`)
    .replace(/^## (.+)$/gm, (match, p1) => `<h2 style="font-size: 1.2em; font-weight: bold; margin: 0.5em 0 0.3em 0;">${p1}</h2>`)
    .replace(/^# (.+)$/gm, (match, p1) => `<h1 style="font-size: 1.3em; font-weight: bold; margin: 0.5em 0 0.3em 0;">${p1}</h1>`)

    // Bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, (match, p1) => `<strong style="font-weight: bold;">${p1}</strong>`)
    .replace(/__(.+?)__/g, (match, p1) => `<strong style="font-weight: bold;">${p1}</strong>`)

    // Italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, (match, p1) => `<em style="font-style: italic;">${p1}</em>`)
    .replace(/_(.+?)_/g, (match, p1) => `<em style="font-style: italic;">${p1}</em>`)

    // Strikethrough (~~text~~)
    .replace(/~~(.+?)~~/g, (match, p1) => `<del style="text-decoration: line-through;">${p1}</del>`)

    // Inline code (`code`)
    .replace(/`([^`]+)`/g, (match, p1) => `<code style="background-color: #f3f4f6; padding: 0.125em 0.25em; border-radius: 0.25em; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.9em;">${p1}</code>`)

    // Code blocks (```code```)
    .replace(/```([\s\S]*?)```/g, (match, p1) => `<pre style="background-color: #f3f4f6; padding: 0.5em; border-radius: 0.25em; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.9em; overflow-x: auto; white-space: pre-wrap;"><code>${p1}</code></pre>`)

    // Unordered lists (- item or * item)
    .replace(/^[-*] (.+)$/gm, (match, p1) => `<li style="margin-left: 1em;">${p1}</li>`)

    // Ordered lists (1. item)
    .replace(/^\d+\. (.+)$/gm, (match, p1) => `<li style="margin-left: 1em;">${p1}</li>`)

    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, p1, p2) => `<a href="${p2}" style="color: #3b82f6; text-decoration: underline;" target="_blank">${p1}</a>`)

    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
    const isOrdered = /^\d+\./.test(match);
    const tag = isOrdered ? 'ol' : 'ul';
    const style = isOrdered ? 'padding-left: 1.5em; margin: 0.5em 0;' : 'padding-left: 1.5em; margin: 0.5em 0;';
    return `<${tag} style="${style}">${match}</${tag}>`;
  });

  return html;
};

const createSummaryPopup = (content, isLoading = false) => {
  let popup = document.getElementById("lingo-summary-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "lingo-summary-popup";
    Object.assign(popup.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      width: "300px",
      padding: "16px",
      backgroundColor: "#ffffff",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      borderRadius: "8px",
      zIndex: "2147483647",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontSize: "14px",
      color: "#1f2937",
      border: "1px solid #e5e7eb",
      maxHeight: "80vh",
      overflowY: "auto"
    });

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "8px",
      right: "8px",
      background: "transparent",
      border: "none",
      fontSize: "20px",
      lineHeight: "1",
      cursor: "pointer",
      color: "#9ca3af",
      padding: "0",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    closeBtn.onclick = () => popup.remove();
    popup.appendChild(closeBtn);

    const title = document.createElement("h3");
    title.textContent = "Lingo Summary";
    Object.assign(title.style, {
      margin: "0 0 12px 0",
      fontSize: "16px",
      fontWeight: "600",
      color: "#111827"
    });
    popup.appendChild(title);

    // TTS Controls
    const ttsControls = document.createElement("div");
    ttsControls.id = "lingo-tts-controls";
    ttsControls.style.display = "flex";
    ttsControls.style.gap = "8px";
    ttsControls.style.marginBottom = "12px";
    ttsControls.style.justifyContent = "center";

    const speakBtn = document.createElement("button");
    speakBtn.innerHTML = "🔊 Speak";
    speakBtn.id = "lingo-speak-btn";
    Object.assign(speakBtn.style, {
      padding: "6px 12px",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
      display: "none" // Hidden initially
    });
    speakBtn.onclick = () => {
      const summaryText = document.getElementById("lingo-summary-body").textContent;
      if (summaryText && summaryText.trim()) {
        speakText(summaryText, "en-US");
        speakBtn.disabled = true;
        speakBtn.innerHTML = "🔊 Speaking...";
        stopBtn.style.display = "inline-block";
      }
    };

    const stopBtn = document.createElement("button");
    stopBtn.innerHTML = "⏹️ Stop";
    stopBtn.id = "lingo-stop-btn";
    Object.assign(stopBtn.style, {
      padding: "6px 12px",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer",
      display: "none"
    });
    stopBtn.onclick = () => {
      stopSpeaking();
      speakBtn.disabled = false;
      speakBtn.innerHTML = "🔊 Speak";
      stopBtn.style.display = "none";
    };

    ttsControls.appendChild(speakBtn);
    ttsControls.appendChild(stopBtn);
    popup.appendChild(ttsControls);

    const body = document.createElement("div");
    body.id = "lingo-summary-body";
    body.style.lineHeight = "1.5";
    popup.appendChild(body);

    document.body.appendChild(popup);
  }

  const body = popup.querySelector("#lingo-summary-body");
  const speakBtn = popup.querySelector("#lingo-speak-btn");
  const stopBtn = popup.querySelector("#lingo-stop-btn");

  if (isLoading) {
    body.innerHTML = '<div style="color: #6b7280;">Summarizing...</div>';
    if (speakBtn) speakBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "none";
  } else {
    body.innerHTML = parseMarkdown(content);
    if (speakBtn) speakBtn.style.display = "inline-block";
  }
};

let summaryBuffer = "";

const handleSummarize = (selection) => {
  const text = selection.toString().trim();
  summaryBuffer = "";
  createSummaryPopup(null, true);

  chrome.runtime.sendMessage({
    type: "GET_GEMINI_SUMMARY",
    text: text
  });
};

// Listen for the "Start" message from the Popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "TRIGGER_TRANSLATION") {
    const selection = window.getSelection();
    if (!selection.toString().trim()) {
      alert("Please select some text first!");
      sendResponse({ success: false });
      return;
    }
    translateSelected(selection, msg.targetLang, msg.sourceLang);
    sendResponse({ success: true });
  }
  if(msg.action==="Summrize"){
    const selection = window.getSelection();
    if (!selection.toString().trim()) {
      alert("Please select some text first!");
      sendResponse({ success: false });
      return;
    }
    handleSummarize(selection);
    sendResponse({ success: true });
  }
  // Temporarily disabled TTS functionality
  // if (msg.action === "TRIGGER_TTS") {
  //   const selection = window.getSelection();
  //   const text = selection.toString().trim();
  //   if (!text) {
  //     alert("Please select some text first!");
  //     sendResponse({ success: false });
  //     return;
  //   }
  //   chrome.runtime.sendMessage({
  //     type: "GET_TTS",
  //     text: text,
  //     lang: "en-US"
  //   }, (response) => {
  //     if (chrome.runtime.lastError || !response || response.error) {
  //       console.error("TTS Error:", chrome.runtime.lastError?.message || response?.error);
  //       return;
  //     }
  //     const audio = new Audio(`data:audio/mp3;base64,${response.data}`);
  //     audio.play().catch(e => console.error("Playback failed:", e));
  //   });
  //   sendResponse({ success: true });
  // }
  if (msg.action === "TRIGGER_TTS") {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text) {
      alert("Please select some text first!");
      sendResponse({ success: false });
      return;
    }
    speakText(text, msg.lang || "en-US");
    sendResponse({ success: true });
  }
  if (msg.action === "STOP_TTS") {
    stopSpeaking();
    sendResponse({ success: true });
  }
  if (msg.action === "SUMMARY_CHUNK") {
    summaryBuffer += msg.data;
    createSummaryPopup(summaryBuffer);
  }
  if (msg.action === "SUMMARY_ERROR") {
    createSummaryPopup("Error: " + msg.error);
  }
  if (msg.action === "SUMMARY_COMPLETE") {
    // completion logic here
  }
  if (msg.action === "START_AREA_SELECTION") {
    currentTargetLang = msg.targetLang || "hi";
    currentSourceLang = msg.sourceLang;
    createSelectionOverlay();
    sendResponse({ success: true });
  }
  if (msg.action === "PROCESS_SELECTED_SCREENSHOT") {
    processSelectedScreenshot(msg.imageData, msg.selection, msg.targetLang, msg.sourceLang);
    sendResponse({ success: true });
  }

  // YouTube summary messages
  if (msg.action === "YOUTUBE_SUMMARY_CHUNK") {
    if (youtubeSummaryOverlay) {
      youtubeSummaryOverlay.appendChunk(msg.data);
    }
  }
  if (msg.action === "YOUTUBE_SUMMARY_ERROR") {
    if (youtubeSummaryOverlay) {
      youtubeSummaryOverlay.setLoading(false);
      youtubeSummaryOverlay.appendChunk("\n\nError: " + msg.error);
    }
    isYouTubeSummarizing = false;
  }
  if (msg.action === "YOUTUBE_SUMMARY_COMPLETE") {
    if (youtubeSummaryOverlay) {
      youtubeSummaryOverlay.setLoading(false);
    }
    isYouTubeSummarizing = false;
  }
  if (msg.action === "TRIGGER_YOUTUBE_SUMMARY") {
    if (!isYouTubeSummarizing) {
      handleYouTubeSummary();
    }
    sendResponse({ success: true });
  }
});

// Initialize YouTube functionality if on YouTube video page
function initializeYouTubeFeatures() {
  console.log('Lingo Bridge: Checking if YouTube video page...');
  if (isYouTubeVideoPage()) {
    console.log('Lingo Bridge: YouTube video detected, creating button');
    createYouTubeSummaryButton();
  } else {
    console.log('Lingo Bridge: Not a YouTube video page');
  }
}

// Create floating "Summarize Video" button for YouTube
function createYouTubeSummaryButton() {
  if (youtubeButton) return;

  youtubeButton = document.createElement('button');
  youtubeButton.id = 'lingo-youtube-button';
  youtubeButton.textContent = '🎥 Summarize Video';
  Object.assign(youtubeButton.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: '2147483647',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease'
  });

  youtubeButton.addEventListener('mouseenter', () => {
    youtubeButton.style.backgroundColor = '#2563eb';
    youtubeButton.style.transform = 'scale(1.05)';
  });

  youtubeButton.addEventListener('mouseleave', () => {
    youtubeButton.style.backgroundColor = '#3b82f6';
    youtubeButton.style.transform = 'scale(1)';
  });

  youtubeButton.addEventListener('click', () => {
    if (!isYouTubeSummarizing) {
      handleYouTubeSummary();
    }
  });

  document.body.appendChild(youtubeButton);
}

// Handle YouTube video summarization
async function handleYouTubeSummary() {
  if (isYouTubeSummarizing) return;

  console.log('Lingo Bridge: Starting YouTube summary process');
  isYouTubeSummarizing = true;
  const videoTitle = getYouTubeVideoTitle();
  console.log('Lingo Bridge: Video title:', videoTitle);

  // Initialize overlay
  if (!youtubeSummaryOverlay) {
    youtubeSummaryOverlay = new YouTubeSummaryOverlay();
  }

  youtubeSummaryOverlay.show(videoTitle);

  try {
    // Extract transcript
    const transcriptResult = await extractYouTubeTranscript();
    if (!transcriptResult.success) {
      youtubeSummaryOverlay.setLoading(false);
      youtubeSummaryOverlay.appendChunk(`❌ ${transcriptResult.reason}`);
      isYouTubeSummarizing = false;
      return;
    }

    // Chunk transcript
    const chunks = chunkText(transcriptResult.transcript, 3500);
    if (chunks.length === 0) {
      youtubeSummaryOverlay.setLoading(false);
      youtubeSummaryOverlay.appendChunk('❌ No transcript content to summarize');
      isYouTubeSummarizing = false;
      return;
    }

    // Start summarization
    chrome.runtime.sendMessage({
      type: 'GET_YOUTUBE_SUMMARY',
      chunks: chunks,
      mode: youtubeSummaryOverlay.mode
    });

  } catch (error) {
    console.error('YouTube summary error:', error);
    youtubeSummaryOverlay.setLoading(false);
    youtubeSummaryOverlay.appendChunk(`❌ Error: ${error.message}`);
    isYouTubeSummarizing = false;
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeYouTubeFeatures);
} else {
  initializeYouTubeFeatures();
}

// Also check when URL changes (for SPA navigation)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // Remove existing button
    if (youtubeButton) {
      youtubeButton.remove();
      youtubeButton = null;
    }
    // Hide overlay if visible
    if (youtubeSummaryOverlay) {
      youtubeSummaryOverlay.hide();
    }
    // Re-initialize
    setTimeout(initializeYouTubeFeatures, 1000);
  }
}, 1000);

// Export functions for use in other modules
export { speakText, stopSpeaking };
