let observer = null;

const exchangeRates = {
    USD: 1 / 7, // Adjusted to convert from CNY to USD
    EUR: 0.9 / 7, // Adjusted to convert from CNY to EUR
    CNY: 1
};

function convertPointsToCurrency(points, currency) {
    const rate = exchangeRates[currency] || exchangeRates.CNY; // Fallback to CNY if currency is unknown or not provided
    return points * rate;
}

function calcPoints(discountType, currency = 'CNY') {
    const pointsElements = document.querySelectorAll('.integral:not(.processed)');
    pointsElements.forEach(element => {
        const pointsText = element.textContent;
        const pointsMatch = pointsText.match(/\d+/);
        if (pointsMatch) {
            const points = parseInt(pointsMatch[0], 10);
            const pointsInCNY = points / 100; // Convert points to CNY
            let newPoints;
            if (discountType === "80%") {
                const discountedPoints = pointsInCNY * 0.2; // Apply 80% discount
                newPoints = convertPointsToCurrency(discountedPoints, currency);
                element.textContent = `~${newPoints.toFixed(2)} ${currency} (-80%)`;
            } else {
                newPoints = convertPointsToCurrency(pointsInCNY, currency); // No discount
                element.textContent = `~${newPoints.toFixed(2)} ${currency}`;
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
