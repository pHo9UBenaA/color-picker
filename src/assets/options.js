/**
 * Options page script for the Color Picker extension
 * created by cline
 */

// Default color format
const DEFAULT_COLOR_FORMAT = 'hex';

// Save options to chrome.storage
function saveOptions() {
  const colorFormat = document.querySelector('input[name="colorFormat"]:checked').value;
  
  chrome.storage.sync.set({ colorFormat }, () => {
    // Update status to let user know options were saved
    const status = document.getElementById('status');
    status.textContent = 'Options saved!';
    status.className = 'status success';
    
    // Hide status after 2 seconds
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
    }, 2000);
  });
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get({ colorFormat: DEFAULT_COLOR_FORMAT }, (items) => {
    // Set the color format radio button
    const radioButton = document.getElementById(items.colorFormat);
    if (radioButton) {
      radioButton.checked = true;
    } else {
      // If the saved format is invalid, default to hex
      document.getElementById(DEFAULT_COLOR_FORMAT).checked = true;
    }
  });
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved options
  restoreOptions();
  
  // Add event listener for save button
  document.getElementById('save').addEventListener('click', saveOptions);
});
