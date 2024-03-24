let isExtensionActive = false;

// Migrating from 'chrome.browserAction' to 'chrome.action' for Manifest V3
chrome.action.onClicked.addListener((tab) => {
    // Toggle the state
    isExtensionActive = !isExtensionActive;

    // Store the new state
    chrome.storage.local.set({ isExtensionActive: isExtensionActive });

    // Set the badge text based on the new state
    chrome.action.setBadgeText({ text: isExtensionActive ? 'ON' : '', tabId: tab.id });

    // Send a message to the content script to toggle the functionality
    chrome.tabs.sendMessage(tab.id, { action: "toggleExtension", state: isExtensionActive });

    // Example of using notifications in service worker
    chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Extension Toggle',
        message: `Extension is now ${isExtensionActive ? 'ON' : 'OFF'}.`
    });
});

// Example of responding to messages in service workers
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "getStatus") {
            sendResponse({ status: isExtensionActive });
        }
    }
);

// Initial setup for badge (optional, can be removed if not using badge)
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeBackgroundColor({ color: '#555' });
});
