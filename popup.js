function sendMessageAndRefresh(action, discountType, currency) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {...action, currency}, () => {
            chrome.tabs.reload(tabs[0].id);
        });
    });
    chrome.storage.local.set({isExtensionActive: action.isExtensionActive, discountType, currency});
}

document.addEventListener('DOMContentLoaded', () => {
    const currencySelect = document.getElementById('currencySelect');
    document.getElementById('dividePoints1').addEventListener('click', () => {
        const currency = currencySelect.value;
        sendMessageAndRefresh({action: "applyDiscount", isExtensionActive: true}, "80%", currency);
    });

    document.getElementById('dividePoints2').addEventListener('click', () => {
        const currency = currencySelect.value;
        sendMessageAndRefresh({action: "applyDiscount", isExtensionActive: true}, "noDiscount", currency);
    });

    document.getElementById('toggleoff').addEventListener('click', () => {
        sendMessageAndRefresh({action: "disableExtension", isExtensionActive: false}, null);
    });
});
