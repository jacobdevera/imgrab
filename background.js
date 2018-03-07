let clientID = "290ebd318bf4070";
let imgurAPIUrl = "https://api.imgur.com/3/image";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab ?
        'from a content script:' + sender.tab.url :
        'from the extension');
    if (request.type == 'coords') {
        console.log(request.coords);
    }
    chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: "png" }, (dataUrl) => {
        let canvas = document.createElement('canvas');
        let { w, h, x, y } = request.coords;
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        var img = new Image;
        img.onload = () => {
            ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
            let croppedImageData = convertURLToImageData(canvas.toDataURL());
            uploadImageToImgur(croppedImageData).then((response) => {
                console.log(response);
                chrome.tabs.create({
                    url: response.data.link
                })
            }).catch((error) => {
                console.log(error);
            });
        };
        img.src = dataUrl;
    })
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
    })
        .then(response => response.json());
}