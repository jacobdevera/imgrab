/**
 * When the 'screen' button is clicked, takes a screenshot of the 
 * active tab and uploads it to Imgur.
 */
document.querySelector("#screen").addEventListener("click", () => {
    console.log("creating image data URI...");

    // Creates a data URI encoding an image of the visible area of 
    // the currently active tab in the specified window.
    chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: "png" }, (dataUrl) => {
        let bgPage = chrome.extension.getBackgroundPage();
        let imageData = bgPage.convertURLToImageData(dataUrl);
        console.log("Finished!");
        console.log("Sending POST request...");

        bgPage.uploadImageToImgur(imageData)
            .then((response) => {
                console.log(response);
                chrome.tabs.create({
                    url: response.data.link
                })
            })
            .catch((error) => {
                console.log(error);
            });
    })
})

document.querySelector("#snippet").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "start-screenshot" }, (response) => { });
    });
})