const translateSelected = (selected, targetLang) => {
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
      targetLang: targetLang || "hi"
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
// Listen for the "Start" message from the Popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "TRIGGER_TRANSLATION") {
    const selection = window.getSelection();
    if (!selection.toString().trim()) {
      alert("Please select some text first!");
      sendResponse({ success: false });
      return;
    }
    translateSelected(selection, msg.targetLang);
    sendResponse({ success: true });
  }
});