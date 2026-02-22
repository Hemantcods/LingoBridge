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
        loadingSpan.replaceWith(resultSpan);
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

    const body = document.createElement("div");
    body.id = "lingo-summary-body";
    body.style.lineHeight = "1.5";
    popup.appendChild(body);

    document.body.appendChild(popup);
  }

  const body = popup.querySelector("#lingo-summary-body");
  if (isLoading) {
    body.innerHTML = '<div style="color: #6b7280;">Summarizing...</div>';
  } else {
    body.innerHTML = parseMarkdown(content);
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
});