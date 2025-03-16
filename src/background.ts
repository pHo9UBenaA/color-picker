/// <reference types="npm:@types/chrome" />

/**
 * Background script for the Color Picker extension
 * created by cline
 */

// Default color format
const DEFAULT_COLOR_FORMAT = 'hex';

// Initialize context menu and storage
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'color-picker',
    title: 'Pick Color',
    contexts: ['page']
  });

  // Initialize storage with default values
  chrome.storage.sync.get('colorFormat', (result) => {
    if (!result.colorFormat) {
      chrome.storage.sync.set({ colorFormat: DEFAULT_COLOR_FORMAT });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'color-picker' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'activate-picker' });
  }
});

// Handle messages from content script or options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get-color-format') {
    chrome.storage.sync.get('colorFormat', (result) => {
      sendResponse({ colorFormat: result.colorFormat || DEFAULT_COLOR_FORMAT });
    });
    return true; // Required for async sendResponse
  }
});

// Legacy action click handler
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'activate-picker' });
  }
});
