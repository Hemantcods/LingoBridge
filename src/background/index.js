import { LingoDotDevEngine } from "lingo.dev/sdk";
import { streamGeminiSummarizer } from "./gemini";
const APIKEY=import.meta.env.VITE_LINGO_API_KEY
const GEMINI_API_KEY=import.meta.env.VITE_GEMINI_API_KEY
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
      console.error("Lingo engine not initialized");
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
  if (request.type === "GET_GEMINI_SUMMARY") {
    console.log("Background: Starting Gemini summary generation...");
    if(!GEMINI_API_KEY){
      console.error("Gemini API key not found");
      sendResponse({error:"Gemini API key not found"})
      return true;
    }
    
    streamGeminiSummarizer(request.text, GEMINI_API_KEY, (chunk) => {
      chrome.tabs.sendMessage(sender.tab.id, { action: "SUMMARY_CHUNK", data: chunk });
    })
    .then(() => {
      chrome.tabs.sendMessage(sender.tab.id, { action: "SUMMARY_COMPLETE" });
    })
    .catch(err => {
      console.error("Background: Gemini summary failed.", err);
      chrome.tabs.sendMessage(sender.tab.id, { action: "SUMMARY_ERROR", error: err.message });
    });
    
    return true
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
  chrome.contextMenus.create({
    id:"Summarise",
    title:"Summarise Selection",
    contexts:["selection"],
    }, () => {
      if(chrome.runtime.lastError){
        console.log("Context menu check:",chrome.runtime.lastError.message)
    }
  })
})
chrome.contextMenus.onClicked.addListener((info, tab) =>{
  if (info.menuItemId === "translate" && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_TRANSLATION" })
      .catch(err => console.log("Could not trigger translation (content script might not be ready):", err));
  }
} )
chrome.contextMenus.onClicked.addListener((info, tab) =>{
  if (info.menuItemId === "Summarise" && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "Summrize" })
      .catch(err => console.log("Could not trigger translation (content script might not be ready):", err));
  }
} )
