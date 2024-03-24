let observer = null;

const exchangeRates = {
    USD: 1,
    EUR: 0.9, 
    CNY: 7.0  
};

function convertPointsToCurrency(points, currency) {
    const rate = exchangeRates[currency] || exchangeRates.USD; // Fallback to USD if currency is unknown or not provided
    return points * rate;
}

function calcPoints(discountType, currency = 'USD') {
    const pointsElements = document.querySelectorAll('.integral:not(.processed)');
    pointsElements.forEach(element => {
        const pointsText = element.textContent;
        const pointsMatch = pointsText.match(/\d+/);
        if (pointsMatch) {
            const points = parseInt(pointsMatch[0], 10);
            let newPoints;
            if (discountType === "80%") {
                const discountedPoints = points / 20;
                newPoints = convertPointsToCurrency(discountedPoints, currency) - (convertPointsToCurrency(discountedPoints, currency) * 0.8);
                element.textContent = `~${newPoints.toFixed(2)} ${currency} (-80%)`;
            } else {
                newPoints = convertPointsToCurrency(points / 20, currency);
                element.textContent = `~${newPoints.toFixed(2)} ${currency} (normal)`;
            }
            element.classList.add('processed');
        }
    });
}

function startObserving(discountType, currency) {
    if (!observer) {
        observer = new MutationObserver(() => calcPoints(discountType, currency));
        observer.observe(document.body, {childList: true, subtree: true});
    }
    calcPoints(discountType, currency);
}

function stopObserving() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "applyDiscount") {
        chrome.storage.local.get(['discountType', 'currency'], (result) => {
            if (result.discountType !== request.discountType || result.currency !== request.currency) {
                chrome.storage.local.set({isExtensionActive: true, discountType: request.discountType, currency: request.currency}, () => {
                    chrome.tabs.reload(sender.tab.id);
                });
            } else {
                startObserving(request.discountType, request.currency);
            }
        });
    } else if (request.action === "disableExtension") {
        chrome.storage.local.set({isExtensionActive: false});
        stopObserving();
    }
});

// Initialize based on stored state
chrome.storage.local.get(['isExtensionActive', 'discountType', 'currency'], (result) => {
    if (result.isExtensionActive) {
        startObserving(result.discountType, result.currency);
    }
});
