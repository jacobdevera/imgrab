let clientID = "290ebd318bf4070";
let imgurAPIUrl = "https://api.imgur.com/3/image";

chrome.runtime.onMessage.addListener((request) => {
    switch (request.type) {
        case "full-screenshot":
            setBadgeState("loading");
            getActiveTabScreenShot()
                .then((dataUrl) => {
                    let imageData = convertURLToImageData(dataUrl);
                    return uploadImageToImgur(imageData);
                })
                .then(() => {
                    setBadgeState("success");
                })
                .catch(() => {
                    setBadgeState("error");
                });
            break;

        case "snippet-screenshot":
            if (request.coords && request.coords.h > 0) {
                getActiveTabScreenShot()
                    .then((dataUrl) => {
                        chrome.tabs.query({
                            active: true,
                            windowType: "normal",
                            currentWindow: true,
                        }, (tabs) => {
                            let canvas = document.createElement("canvas");
                            let { w, h, x, y } = request.coords;

                            canvas.width = w;
                            canvas.height = h;

                            let ctx = canvas.getContext("2d");
                            let img = new Image();
                            img.onload = () => {
                                ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
                                let croppedImageData = convertURLToImageData(canvas.toDataURL());
                                setBadgeState("loading");
                                uploadImageToImgur(croppedImageData)
                                    .then((response) => {
                                        setBadgeState("success");
                                    })
                                    .catch((error) => {
                                        setBadgeState("error");
                                    });
                            };
                            img.src = dataUrl;
                        });
                    });
            }
            break;
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
        return dataUrl.split(",")[1];
    } else {
        throw new Error("Error, tried to convert URL from an invalid URI scheme");
    }
}

/**
 * Sends POST HTTP request and if successful opens new tab. Updates the extension badge
 * as well depending if succesful or not.
 * @param {*} data The image data
 */
function uploadImageToImgur(data) {
    let formData = new FormData();
    formData.append("image", data);

    return fetch(imgurAPIUrl, {
        method: "POST",
        headers: {
            Authorization: `Client-ID ${clientID}`,
        },
        body: data,
    })
        .then((response) => response.json())
        .then((json) => {
            chrome.tabs.create({
                url: json.data.link,
            });
        });
}

/**
 * Captures screenshot of active tab and returns a data URI of image.
 */
function getActiveTabScreenShot() {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, {
            format: "png",
        }, (dataUrl) => {
            resolve(dataUrl);
        });
    });
}

/**
 * Sets the state of the browser extension icon to the given state.
 */
function setBadgeState(state) {
    switch (state) {
        case "loading":
            chrome.browserAction.setBadgeBackgroundColor({
                color: "blue",
            });
            chrome.browserAction.setBadgeText({
                text: "...",
            });
            break;
        case "success":
            chrome.browserAction.setBadgeBackgroundColor({
                color: "green",
            });
            chrome.browserAction.setBadgeText({
                text: "done",
            });
            break;
        case "error":
            chrome.browserAction.setBadgeBackgroundColor({
                color: "red",
            });
            chrome.browserAction.setBadgeText({
                text: "fail",
            });
            break;
        default:
            chrome.browserAction.setBadgeText({
                text: "",
            });
            break;
    }
}
