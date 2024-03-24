
let isExtensionActive = false;
let observer = null; 
function calcPoints() {
    // Now also ignoring elements that have already been processed
    const pointsElements = document.querySelectorAll('.integral:not(.processed)');

    pointsElements.forEach(element => {
        const pointsText = element.textContent;
        const pointsMatch = pointsText.match(/\d+/);
        if (pointsMatch) {
            const points = parseInt(pointsMatch[0], 10);
            const newPoints1 = points / 20;
            const newPoints = newPoints1 - (newPoints1 * 0.8);
            element.textContent = `~${newPoints.toFixed(2)}$ (-80%)`;
            // Mark this element as processed to avoid adjusting it again
            element.classList.add('processed');
        }
    });
}

function startObserving() {
    if (observer) return; // If we already have an observer, don't create another

    observer = new MutationObserver(mutations => {
        calcPoints();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    calcPoints(); // Also call the function immediately to update current points
}

function stopObserving() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

// Listening for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleExtension") {
        isExtensionActive = request.state;
        if (isExtensionActive) {
            startObserving();
        } else {
            stopObserving();
        }
    }
});

// Initialize the functionality if the extension was previously active
chrome.storage.local.get(['isExtensionActive'], function(result) {
    if (result.isExtensionActive) {
        isExtensionActive = true;
        startObserving();
    }
});
