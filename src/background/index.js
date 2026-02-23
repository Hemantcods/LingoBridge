import { LingoDotDevEngine } from "lingo.dev/sdk";
import { streamGeminiSummarizer } from "./gemini";
import { summarizeYouTubeTranscript } from "../utils/geminiSummarizer.js";
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
      sourceLocale: request.sourceLang || "en", 
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
  if (request.type === "GET_YOUTUBE_SUMMARY") {
    console.log("Background: Starting YouTube summary generation...");
    if(!GEMINI_API_KEY){
      console.error("Gemini API key not found");
      chrome.tabs.sendMessage(sender.tab.id, { action: "YOUTUBE_SUMMARY_ERROR", error: "Gemini API key not found" });
      return true;
    }

    summarizeYouTubeTranscript(request.chunks, GEMINI_API_KEY, request.mode || 'bullets', (chunk) => {
      chrome.tabs.sendMessage(sender.tab.id, { action: "YOUTUBE_SUMMARY_CHUNK", data: chunk });
    })
    .then(() => {
      chrome.tabs.sendMessage(sender.tab.id, { action: "YOUTUBE_SUMMARY_COMPLETE" });
    })
    .catch(err => {
      console.error("Background: YouTube summary failed.", err);
      chrome.tabs.sendMessage(sender.tab.id, { action: "YOUTUBE_SUMMARY_ERROR", error: err.message });
    });

    return true;
  }
  if (request.action === "CAPTURE_SELECTED_AREA") {
    console.log("Background: Capturing selected area:", request.selection);
    
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Screenshot capture failed:", chrome.runtime.lastError);
        return;
      }
      
      // Send the screenshot and selection coordinates to content script for cropping and OCR
      chrome.tabs.sendMessage(request.tabId || sender.tab.id, {
        action: "PROCESS_SELECTED_SCREENSHOT",
        imageData: dataUrl,
        selection: request.selection,
        targetLang: request.targetLang,
        sourceLang: request.sourceLang
      });
    });
    
    return true;
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
  chrome.contextMenus.create({
    id: "speak",
    title: "Speak Selection",
    contexts: ["selection"],
  }, () => {
    if (chrome.runtime.lastError) console.log("Context menu check:", chrome.runtime.lastError.message);
  })
  chrome.contextMenus.create({
    id: "screenshot-translate",
    title: "📸 Screenshot Translate",
    contexts: ["page"],
  }, () => {
    if (chrome.runtime.lastError) console.log("Context menu check:", chrome.runtime.lastError.message);
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
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "speak" && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_TTS", lang: "en-US" })
      .catch(err => console.log("Could not trigger TTS (content script might not be ready):", err));
  }
})
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "screenshot-translate" && tab && tab.id) {
    // Get current settings from storage and start screenshot selection
    // OCR availability will be checked in the content script
    chrome.storage.sync.get(['sourceLang', 'targetLang'], (result) => {
      chrome.tabs.sendMessage(tab.id, { 
        action: "START_AREA_SELECTION",
        targetLang: result.targetLang || "hi",
        sourceLang: result.sourceLang || null
      });
    });
  }
})
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "translate-selection" && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_TRANSLATION" })
      .catch(err => console.log("Could not trigger translation via shortcut:", err));
  }
});
