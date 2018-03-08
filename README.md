# imgrab
A Chrome extension that allows the user to grab a screenshot of the current tab or selected area and upload it to imgur anonymously.

### Installation
1. Install github repo locally.
2. Open Chrome and type in `chrome://extensions` in the address bar. This opens the Chrome extentions page.
3. Click 'Development Mode'
4. Click 'Load unpacked extension...'
5. Locate the installed 'imgrab' folder.
6. Refresh all Chrome Tabs.

### Getting Started
- Click the extension icon. 
- A popup should appear with two buttons: **screen** or **snippet**. Click either one to:
  - **screen**: get full tab screenshot.
  - **snippet**: select an area of screen to screenshot.

After grabbing the image, it automatically sends a POST request to Imgur including the image.
The extension icon changes style depending on the response of the POST request.

### Imgur Upload Privacy
Although this extension allows you to post images to Imgur anynomously, it is important to note that **no image uploaded to Imgur is ever completely hidden from public view.** Every image uploaded to Imgur has it's own direct URL.

> "Unless the post is shared publicly with the community, search engines will not be able to see the content, and therefore the content is not searchable by other people." _[Source](https://help.imgur.com/hc/en-us/articles/201746817-Post-privacy)_

### Contributors
[Jacob Devera](https://github.com/jacobdevera)

[John Diego](https://github.com/jadiego)
