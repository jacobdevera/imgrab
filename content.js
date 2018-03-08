chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == "start-screenshot") {
        startScreenshot();
        sendResponse({});
    } else {
        sendResponse({});
    }
});

function startScreenshot() {
    console.log('start screenshot');
	document.body.style.cursor = 'crosshair';
    document.addEventListener('mousedown', mouseDown, false);
}

function endScreenshot(coords) {
	document.removeEventListener('mousedown', mouseDown, false);
	sendMessage({type: 'coords', coords: coords});
}
 
function sendMessage(msg) {
	document.body.style.cursor = 'default';
	console.log('sending coordinates');
	chrome.runtime.sendMessage(msg, (response) => {});
};

var ghostElement, startPos, startY;

function mouseDown(e) {
	e.preventDefault();
 
	startPos = {x: e.pageX, y: e.pageY};
    startY = e.y;
	
	ghostElement = document.createElement('div');
	ghostElement.style.background = 'blue';
	ghostElement.style.opacity = '0.1';
	ghostElement.style.position = 'absolute';
	ghostElement.style.left = e.pageX + 'px';
	ghostElement.style.top = e.pageY + 'px';
	ghostElement.style.width = "0px";
	ghostElement.style.height = "0px";
	ghostElement.style.zIndex = "1000000";
	document.body.appendChild(ghostElement);
	
	document.addEventListener('mousemove', mouseMove, false);
	document.addEventListener('mouseup', mouseUp, false);
	
	return false;
}

function mouseMove(e) {
	e.preventDefault();
    let nowPos = {x: e.pageX, y: e.pageY};
    
    // change top-left corner if selection goes above or left of start
    ghostElement.style.left = nowPos.x < startPos.x ? `${nowPos.x}px` : `${startPos.x}px`;
    ghostElement.style.top = nowPos.y < startPos.y ? `${nowPos.y}px` : `${startPos.y}px`;

	let diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};
	
	ghostElement.style.width = Math.abs(diff.x) + 'px';
	ghostElement.style.height = Math.abs(diff.y) + 'px';
	
	return false;
}
 
function mouseUp(e) {
	e.preventDefault();
	
	let nowPos = {x: e.pageX, y: e.pageY};
	let diff = {x: nowPos.x - startPos.x, y: nowPos.y - startPos.y};
 
	document.removeEventListener('mousemove', mouseMove, false);
	document.removeEventListener('mouseup', mouseUp, false);
	
	ghostElement.parentNode.removeChild(ghostElement);
	
	setTimeout(function() {
		let scale = window.devicePixelRatio ? window.devicePixelRatio : 1;
		var coords = {
			w: Math.abs(diff.x) * scale,
			h: Math.abs(diff.y) * scale,
			x: (Math.min(nowPos.x, startPos.x) - window.pageXOffset) * scale,
			y: (Math.min(nowPos.y, startPos.y) - window.pageYOffset) * scale
		};
		gCoords = coords;
		endScreenshot(coords);
	}, 50);
	
	return false;
}