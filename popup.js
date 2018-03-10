/**
 * Pass message to extension to create fullscreen shot when "screen" 
 * button is clicked.
 */
document.querySelector("#screen").addEventListener("click", () => {
    chrome.runtime.sendMessage({
        type: "full-screenshot",
    }, window.close());
});

/**
 * Pass message to extension start snippet screenshot when "snippet" 
 * button is clicked.
 */
document.querySelector("#snippet").addEventListener("click", () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "grab-coordinates"
        });
        window.close();
    });
});
