const translateSelected = (selected, targetLang) => {
  console.log("Translating selection:", selected.toString());
  const text = selected.toString().trim();
  if (text && selected.rangeCount > 0) {
    if (!chrome.runtime?.id) {
      console.error("Extension context invalidated. Please reload the page.");
      return;
    }

    const range = selected.getRangeAt(0).cloneRange();

    const loadingSpan = document.createElement("span");
    loadingSpan.textContent = " [Translating...]";
    loadingSpan.style.fontSize = "small";
    loadingSpan.style.color = "#888";

    const rangeEnd = range.cloneRange();
    rangeEnd.collapse(false);
    rangeEnd.insertNode(loadingSpan);

    chrome.runtime.sendMessage({
      type: "GET_TRANSLATION",
      text: text,
      targetLang: targetLang || "hi"
    }, (response) => {
      loadingSpan.remove();

      if (chrome.runtime.lastError || !response || !response.data) {
        console.error("Translation error:", chrome.runtime.lastError);
        const errorSpan = document.createElement("span");
        errorSpan.textContent = " [Translation Failed]";
        errorSpan.style.color = "red";
        errorSpan.style.fontSize = "small";
        const rangeEndError = range.cloneRange();
        rangeEndError.collapse(false);
        rangeEndError.insertNode(errorSpan);
        setTimeout(() => errorSpan.remove(), 3000);
        return;
      }

      if (response?.data) {
        range.deleteContents();
        range.insertNode(document.createTextNode(response.data));
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