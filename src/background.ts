/// <reference types="npm:@types/chrome" />

/**
 * Background script for the Color Picker extension
 * created by cline
 */

// Default color format
const DEFAULT_COLOR_FORMAT = "hex";

// // Handle messages from content script or options page
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "get-color-format") {
    chrome.storage.sync.get("colorFormat")
      .then((result) => {
        sendResponse({ format: result.colorFormat || DEFAULT_COLOR_FORMAT });
      }).catch((error) => {
        console.error("Failed to get color format:", error);
        sendResponse({ format: DEFAULT_COLOR_FORMAT });
      });
  }
  return true;
});

// Legacy action click handler
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "activate-picker" });
  }
});
