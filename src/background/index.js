import { LingoDotDevEngine } from "lingo.dev/sdk";
const APIKEY=import.meta.env.VITE_LINGO_API_KEY

console.log("Lingo Bridge Background Service Worker Loaded");

// Initialize the Lingo Engine
let lingo;
try {
  lingo = new LingoDotDevEngine({
    apiKey: APIKEY, 
  });
} catch (e) {
  console.error("Failed to initialize Lingo:", e);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_TRANSLATION") {
    if (!lingo) {
      sendResponse({ error: "Lingo engine not initialized" });
      return true;
    }
    // Translate the text received from the Content Script
    lingo.localizeText(request.text, { 
      sourceLocale: "en", 
      targetLocale: request.targetLang || "hi" 
    })
    .then(translatedText => sendResponse({ data: translatedText }))
    .catch(err => sendResponse({ error: err.message }));

    return true; // Keeps the async connection open
  }
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate",
    title: "Translate Selection",
    contexts: ["selection"],
  }, () => {
    // Suppress "Duplicate id" error if it exists
    if (chrome.runtime.lastError) console.log("Context menu check:", chrome.runtime.lastError.message);
  })
})
chrome.contextMenus.onClicked.addListener((info, tab) =>{
  if (info.menuItemId === "translate" && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_TRANSLATION" })
      .catch(err => console.log("Could not trigger translation (content script might not be ready):", err));
  }
} )