/**
 * When the 'screen' button is clicked, takes a screenshot of the 
 * active tab and uploads it to Imgur.
 */
document.querySelector("#screen").addEventListener("click", () => {

    // Creates a data URI encoding an image of the visible area of 
    // the currently active tab in the specified window.
    chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: "png" }, (dataUrl) => {
        let bgPage = chrome.extension.getBackgroundPage();
        let imageData = bgPage.convertURLToImageData(dataUrl);
        chrome.tabs.query({ active: true, windowType: "normal", currentWindow: true }, (tabs) => {
            bgPage.setBadgeLoading(tabs[0].id);
            bgPage.uploadImageToImgur(imageData).then((response) => {
                bgPage.clearBadgeText(tabs[0].id);
                window.close();
            }).catch((error) => {
                bgPage.setBadgeError(tabs[0].id);
                window.close();
            });
        })
    })
})

document.querySelector("#snippet").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "start-screenshot" }, (response) => { });
    });
    window.close();
})
