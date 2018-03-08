let clientID = "290ebd318bf4070";
let imgurAPIUrl = "https://api.imgur.com/3/image";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab ?
        'from a content script:' + sender.tab.url :
        'from the extension');
    if (request.type == 'coords' && request.coords.h > 0) {
        chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: "png" }, (dataUrl) => {
            chrome.tabs.query({ active: true, windowType: "normal", currentWindow: true }, (tabs) => {
                let canvas = document.createElement('canvas');
                let { w, h, x, y } = request.coords;

                canvas.width = w;
                canvas.height = h;

                var ctx = canvas.getContext('2d');
                var img = new Image;
                img.onload = () => {
                    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
                    let croppedImageData = convertURLToImageData(canvas.toDataURL());
                    setBadgeLoading(tabs[0].id);
                    uploadImageToImgur(croppedImageData).then((response) => {
                        console.log(response);
                        clearBadgeText(tabs[0].id);
                    }).catch((error) => {
                        console.log(error);
                        setBadgeError(tabs[0].id);
                    });
                }
                img.src = dataUrl;
            })
        })
    }
});

/**
 * A data URI scheme uses the following syntax:
 * 
 * data:[<media type>][;base64],<data>
 * 
 * This method returns the <data> portion of the data URI.
 * 
 * @param {*} dataUrl a URI scheme
 */
function convertURLToImageData(dataUrl) {
    if (dataUrl.startsWith("data:image")) {
        return dataUrl.split(',')[1];
    } else {
        throw new Error("Error, tried to convert URL from an invalid URI scheme");
    }
}

/**
 * Sends POST HTTP request and returns the response in JSON format.
 * @param {*} data The image data
 */
function uploadImageToImgur(data) {
    let formData = new FormData();
    formData.append("image", data);

    return fetch(imgurAPIUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Client-ID ${clientID}`,
        },
        body: data,
    }).then(response => response.json()).then((json) => {
        chrome.tabs.create({
            url: json.data.link
        })
    });
}



function onImgurTabLoaded(tabId, changeInfo, tab) {
    if (changeInfo.status === "loading" && tab.url.match("i.imgur.com")) {
        setBadgeSuccess(tabId);
        chrome.tabs.onUpdated.removeListener(myListener);
    }
}

chrome.tabs.onUpdated.addListener(onImgurTabLoaded);

function setBadgeLoading(tabId) {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'blue', tabId: tabId });
    chrome.browserAction.setBadgeText({ text: "...", tabId: tabId });
}

function setBadgeSuccess(tabId) {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'green', tabId: tabId });
    chrome.browserAction.setBadgeText({ text: "done", tabId: tabId });
}

function setBadgeError(tabId) {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red', tabId: tabId });
    chrome.browserAction.setBadgeText({ text: "fail", tabId: tabId });
}

function clearBadgeText(tabId) {
    chrome.browserAction.setBadgeText({ text: "", tabId: tabId });
}