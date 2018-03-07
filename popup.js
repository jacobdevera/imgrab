let clientID = "290ebd318bf4070";
let imgurAPIUrl = "https://api.imgur.com/3/image"

/**
 * When the 'screen' button is clicked, takes a screenshot of the 
 * active tab and uploads it to Imgur.
 */
document.querySelector("#screen").addEventListener("click", () => {
    console.log("creating image data URI...");

    // Creates a data URI encoding an image of the visible area of 
    // the currently active tab in the specified window.
    chrome.tabs.captureVisibleTab((dataUrl) => {

        let imageData = convertURLToImageData(dataUrl);
        console.log("Finished!");
        console.log("Sending POST request...");

        uploadImageToImgur(imageData)
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
